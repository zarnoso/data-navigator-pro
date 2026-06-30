import { handlePreflight, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";
import { triggerWorker } from "../_shared/worker.ts";

/**
 * Importa una lista de leads provistos por el usuario (CSV ya parseado por el
 * cliente o lista JSON). Para volúmenes grandes el cliente debe subir el CSV
 * directo al bucket y llamar este endpoint con `storage_path`.
 */
interface ImportLead {
  name: string;
  address?: string;
  comuna?: string;
  comuna_slug?: string;
  region?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry_slug?: string;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const body = await req.json().catch(() => null) as {
    leads?: ImportLead[];
    storage_path?: string;
    industry_slug?: string;
    comuna_slug?: string;
  } | null;
  if (!body) return json({ error: "invalid_json" }, 400);

  const supa = adminClient();

  // Modo 1: storage_path => delega al worker
  if (body.storage_path) {
    const { data: run, error } = await supa
      .from("mapadata_search_runs")
      .insert({
        user_id: user.id,
        industry_slug: body.industry_slug ?? "import",
        comuna_slug: body.comuna_slug ?? "import",
        requested_limit: 0,
        status: "pending",
        formats: [],
        params: { mode: "csv_import", storage_path: body.storage_path },
      })
      .select("id").single();
    if (error || !run) return json({ error: error?.message ?? "db_error" }, 500);
    const trig = await triggerWorker({ run_id: run.id, action: "process_run" });
    return json({ run_id: run.id, mode: "csv_import", worker: trig }, 202);
  }

  // Modo 2: leads inline (máx 500 por request)
  if (!Array.isArray(body.leads) || body.leads.length === 0) {
    return json({ error: "leads_required" }, 400);
  }
  if (body.leads.length > 500) {
    return json({ error: "too_many_leads", max: 500, suggestion: "use storage_path" }, 400);
  }

  const rows = body.leads.map((l) => ({
    owner_user_id: user.id,
    source: "csv_import",
    name: l.name,
    name_normalized: l.name.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, "").trim(),
    address: l.address,
    comuna: l.comuna,
    comuna_slug: l.comuna_slug,
    region: l.region,
    phone: l.phone,
    email: l.email,
    website: l.website,
    industry_slug: l.industry_slug,
    raw: l as unknown as Record<string, unknown>,
  }));

  const { error, count } = await supa
    .from("mapadata_leads")
    .upsert(rows, { onConflict: "owner_user_id,place_id", ignoreDuplicates: false, count: "exact" });
  if (error) return json({ error: error.message }, 500);
  return json({ imported: count ?? rows.length }, 201);
});
