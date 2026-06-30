import { handlePreflight, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";
import { triggerWorker } from "../_shared/worker.ts";

interface Body {
  industry_slug: string;
  comuna_slug: string;
  limit: number;
  formats?: string[];
  name?: string;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let user;
  try { user = await requireUser(req); } catch (r) { return r as Response; }

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }

  if (!body.industry_slug || !body.comuna_slug || !body.limit) {
    return json({ error: "missing_fields", required: ["industry_slug", "comuna_slug", "limit"] }, 400);
  }
  if (body.limit < 1 || body.limit > 5000) {
    return json({ error: "invalid_limit", min: 1, max: 5000 }, 400);
  }

  const supa = adminClient();

  // Validar catálogo
  const [{ data: ind }, { data: com }] = await Promise.all([
    supa.from("mapadata_industry_keywords").select("slug").eq("slug", body.industry_slug).maybeSingle(),
    supa.from("mapadata_comuna_geos").select("slug, region").eq("slug", body.comuna_slug).maybeSingle(),
  ]);
  if (!ind) return json({ error: "unknown_industry" }, 400);
  if (!com) return json({ error: "unknown_comuna" }, 400);

  // Validar entitlement (suma de remaining)
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

  // Crear run pending
  const formats = body.formats?.length ? body.formats : ["xlsx", "csv"];
  const { data: run, error: insErr } = await supa
    .from("mapadata_search_runs")
    .insert({
      user_id: user.id,
      industry_slug: body.industry_slug,
      comuna_slug: body.comuna_slug,
      region: com.region,
      requested_limit: body.limit,
      formats,
      status: "pending",
      params: { name: body.name ?? null },
    })
    .select("id")
    .single();
  if (insErr || !run) return json({ error: "db_error", detail: insErr?.message }, 500);

  // Notificar worker (best-effort; cron lo recoge si falla)
  const trig = await triggerWorker({ run_id: run.id, action: "process_run" });

  return json({ run_id: run.id, status: "pending", worker: trig }, 202);
});
