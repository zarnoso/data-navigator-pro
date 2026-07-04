import { handlePreflight, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";
import { triggerWorker } from "../_shared/worker.ts";

interface Body {
  industry: string;        // free text or slug
  comuna: string;          // free text or slug
  region?: string;
  limit: number;
  formats?: string[];
  name?: string;
  radius_m?: number;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function geocode(query: string): Promise<{ lat: number; lng: number; region: string | null } | null> {
  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=cl&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const first = data.results?.[0];
  if (!first) return null;
  const loc = first.geometry?.location;
  if (!loc) return null;
  const regionComp = first.address_components?.find((c: any) => c.types?.includes("administrative_area_level_1"));
  return { lat: loc.lat, lng: loc.lng, region: regionComp?.long_name ?? null };
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let user;
  try { user = await requireUser(req); } catch (r) { return r as Response; }

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }

  // Backwards compat: accept industry_slug / comuna_slug
  const industryInput = (body.industry ?? (body as any).industry_slug ?? "").toString().trim();
  const comunaInput = (body.comuna ?? (body as any).comuna_slug ?? "").toString().trim();

  if (!industryInput || !comunaInput || !body.limit) {
    return json({ error: "missing_fields", required: ["industry", "comuna", "limit"] }, 400);
  }
  if (body.limit < 1 || body.limit > 5000) {
    return json({ error: "invalid_limit", min: 1, max: 5000 }, 400);
  }

  const supa = adminClient();
  const industrySlug = slugify(industryInput);
  const comunaSlug = slugify(comunaInput);

  // Upsert industry
  const { data: existingInd } = await supa
    .from("mapadata_industry_keywords")
    .select("slug")
    .eq("slug", industrySlug)
    .maybeSingle();
  if (!existingInd) {
    await supa.from("mapadata_industry_keywords").insert({
      slug: industrySlug,
      display_name: industryInput,
      keywords: [industryInput],
      google_places_types: [],
    });
  }

  // Upsert comuna (geocode if new)
  let { data: existingCom } = await supa
    .from("mapadata_comuna_geos")
    .select("slug, region")
    .eq("slug", comunaSlug)
    .maybeSingle();

  if (!existingCom) {
    const geo = await geocode(`${comunaInput}${body.region ? ", " + body.region : ""}, Chile`);
    if (!geo) return json({ error: "geocode_failed", detail: `no se pudo ubicar "${comunaInput}"` }, 400);
    const { error: comErr } = await supa.from("mapadata_comuna_geos").insert({
      slug: comunaSlug,
      display_name: comunaInput,
      region: body.region ?? geo.region ?? "Desconocida",
      center_lat: geo.lat,
      center_lng: geo.lng,
      radius_meters: body.radius_m ?? 5000,
    });
    if (comErr) return json({ error: "db_error", detail: comErr.message }, 500);
    existingCom = { slug: comunaSlug, region: body.region ?? geo.region ?? "Desconocida" };
  }

  // Validar entitlement
  const { data: ents } = await supa
    .from("mapadata_entitlements")
    .select("leads_available, leads_consumed, expires_at")
    .eq("user_id", user.id);
  const remaining = (ents ?? [])
    .filter((e) => !e.expires_at || new Date(e.expires_at) > new Date())
    .reduce((acc, e) => acc + (e.leads_available - e.leads_consumed), 0);
  if (remaining < body.limit) {
    return json({ error: "insufficient_credits", remaining, requested: body.limit }, 402);
  }

  const formats = body.formats?.length ? body.formats : ["xlsx", "csv"];
  const { data: run, error: insErr } = await supa
    .from("mapadata_search_runs")
    .insert({
      user_id: user.id,
      industry_slug: industrySlug,
      comuna_slug: comunaSlug,
      region: existingCom.region,
      requested_limit: body.limit,
      formats,
      status: "pending",
      params: { name: body.name ?? `${industryInput} · ${comunaInput}`, industry_label: industryInput, comuna_label: comunaInput },
    })
    .select("id")
    .single();
  if (insErr || !run) return json({ error: "db_error", detail: insErr?.message }, 500);

  const trig = await triggerWorker({ run_id: run.id, action: "process_run" });
  return json({ run_id: run.id, status: "pending", worker: trig }, 202);
});
