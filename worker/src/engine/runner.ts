import { supabase } from "../supabase.js";
import { config } from "../config.js";
import { buildPlan, type RunPlan } from "./planner.js";
import { searchText } from "./google-places.js";
import { normalize, score, type NormalizedLead } from "./normalizer.js";
import { dedupe } from "./dedupe.js";
import { buildXlsx, buildCsv } from "./export-builder.js";
import { fetchLeadsDuckDuckGo } from "./duckduckgo.js";
import pino from "pino";

const log = pino({ name: "runner" });

type SourcedLead = NormalizedLead & { source: "google_places" | "duckduckgo_scrape" };


async function updateRun(runId: string, patch: Record<string, unknown>) {
  await supabase.from("mapadata_search_runs").update(patch).eq("id", runId);
}

async function fetchLeads(plan: RunPlan): Promise<SourcedLead[]> {
  const all: SourcedLead[] = [];
  const queries = plan.keywords.map((k) => `${k} en ${plan.comunaSlug}`);
  for (const q of queries) {
    if (all.length >= plan.requestedLimit) break;
    try {
      const raws = await searchText(q, plan);
      for (const r of raws) {
        const n = normalize(r, plan);
        if (!n) continue;
        n.quality_score = score(n);
        all.push({ ...n, source: "google_places" });
      }
    } catch (e) {
      log.warn({ q, err: (e as Error).message }, "places_query_failed");
    }
  }

  // Fallback gratuito: si Places entregó poco, complementar con DuckDuckGo scraping
  if (all.length < plan.requestedLimit) {
    const missing = plan.requestedLimit - all.length;
    try {
      const ddg = await fetchLeadsDuckDuckGo(plan, missing);
      for (const l of ddg) {
        l.quality_score = score(l);
        all.push({ ...l, source: "duckduckgo_scrape" });
      }
    } catch (e) {
      log.warn({ err: (e as Error).message }, "ddg_fallback_failed");
    }
  }

  return dedupe(all).slice(0, plan.requestedLimit) as SourcedLead[];
}


async function persistLeads(plan: RunPlan, leads: SourcedLead[]): Promise<string[]> {
  const ids: string[] = [];
  const chunkSize = 100;
  for (let i = 0; i < leads.length; i += chunkSize) {
    const chunk = leads.slice(i, i + chunkSize).map((l) => ({
      owner_user_id: plan.userId,
      source: l.source,
      place_id: l.place_id,
      name: l.name,
      name_normalized: l.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(),
      address: l.address,
      comuna_slug: l.comuna_slug,
      region: l.region,
      country: "CL",
      phone: l.phone_raw,
      phone_e164: l.phone_e164,
      email: l.email,
      website: l.website,
      industry_slug: l.industry_slug,
      lat: l.lat,
      lng: l.lng,
      rating: l.rating,
      rating_count: l.reviews,
      quality_score: l.quality_score,
      enrichment: {
        types: l.types,
        primary_type: l.primary_type,
        business_status: l.business_status,
      },
    }));

    const { data, error } = await supabase
      .from("mapadata_leads")
      .upsert(chunk, { onConflict: "owner_user_id,place_id" })
      .select("id");
    if (error) throw new Error(`persist_leads:${error.message}`);
    if (data) ids.push(...data.map((r: { id: string }) => r.id));

    await updateRun(plan.runId, {
      progress_pct: Math.min(90, Math.round(((i + chunk.length) / leads.length) * 80) + 10),
    });
  }

  const runLeads = ids.map((leadId, idx) => ({
    run_id: plan.runId,
    lead_id: leadId,
    user_id: plan.userId,
    position: idx,
  }));
  if (runLeads.length) {
    for (let i = 0; i < runLeads.length; i += 500) {
      await supabase.from("mapadata_run_leads").upsert(runLeads.slice(i, i + 500), {
        onConflict: "run_id,lead_id",
      });
    }
  }
  return ids;
}

async function buildAndUpload(plan: RunPlan, leads: NormalizedLead[]) {
  const title = `${plan.industrySlug}_${plan.comunaSlug}_${Date.now()}`;
  const outputs: Array<{ format: string; path: string; bytes: number }> = [];

  for (const fmt of plan.formats) {
    let buffer: Buffer;
    let ext: string;
    let contentType: string;
    if (fmt === "xlsx") {
      buffer = await buildXlsx(leads, title);
      ext = "xlsx";
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (fmt === "csv") {
      buffer = buildCsv(leads);
      ext = "csv";
      contentType = "text/csv";
    } else continue;

    const path = `${plan.userId}/${plan.runId}/${title}.${ext}`;
    const { error } = await supabase.storage
      .from(config.MAPADATA_EXPORTS_BUCKET)
      .upload(path, buffer, { contentType, upsert: true });
    if (error) throw new Error(`storage_upload:${error.message}`);

    await supabase.from("mapadata_exports").insert({
      user_id: plan.userId,
      run_id: plan.runId,
      format: fmt,
      status: "ready",
      row_count: leads.length,
      storage_path: path,
      bytes: buffer.length,
    });
    outputs.push({ format: fmt, path, bytes: buffer.length });
  }
  return outputs;
}

export async function processRun(runId: string): Promise<void> {
  log.info({ runId }, "run_start");
  try {
    await updateRun(runId, {
      status: "running",
      worker_started_at: new Date().toISOString(),
      progress_pct: 5,
      error_message: null,
    });

    const plan = await buildPlan(runId);
    await updateRun(runId, { progress_pct: 10 });

    const leads = await fetchLeads(plan);
    if (leads.length === 0) {
      await updateRun(runId, {
        status: "completed",
        progress_pct: 100,
        worker_finished_at: new Date().toISOString(),
        result_count: 0,
        error_message: "no_results",
      });
      return;
    }

    await persistLeads(plan, leads);
    await updateRun(runId, { progress_pct: 92 });

    const outputs = await buildAndUpload(plan, leads);

    // Consumir créditos SOLO tras éxito
    const { data: consumed } = await supabase.rpc("mapadata_consume_credits", {
      _user_id: plan.userId,
      _amount: leads.length,
    });

    await updateRun(runId, {
      status: "completed",
      progress_pct: 100,
      worker_finished_at: new Date().toISOString(),
      result_count: leads.length,
      params: { outputs, credits_consumed: consumed === true ? leads.length : 0 },
    });
    log.info({ runId, leads: leads.length }, "run_done");
  } catch (e) {
    const msg = (e as Error).message;
    log.error({ runId, err: msg }, "run_failed");
    await updateRun(runId, {
      status: "failed",
      error_message: msg.slice(0, 500),
      worker_finished_at: new Date().toISOString(),
    });
  }
}
