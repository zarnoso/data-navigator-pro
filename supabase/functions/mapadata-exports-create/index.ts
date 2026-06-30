import { handlePreflight, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";
import { triggerWorker } from "../_shared/worker.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const body = await req.json().catch(() => null) as { run_id?: string; format?: string } | null;
  if (!body?.run_id || !body?.format) return json({ error: "missing_fields" }, 400);
  if (!["xlsx", "csv"].includes(body.format)) return json({ error: "invalid_format" }, 400);

  const supa = adminClient();
  const { data: run } = await supa
    .from("mapadata_search_runs")
    .select("id, user_id, status")
    .eq("id", body.run_id)
    .maybeSingle();
  if (!run || run.user_id !== user.id) return json({ error: "not_found" }, 404);

  const { data: exp, error } = await supa
    .from("mapadata_exports")
    .insert({ user_id: user.id, run_id: run.id, format: body.format, status: "pending" })
    .select("id")
    .single();
  if (error || !exp) return json({ error: error?.message ?? "db_error" }, 500);

  const trig = await triggerWorker({ export_id: exp.id, action: "build_export" });
  return json({ export_id: exp.id, status: "pending", worker: trig }, 202);
});
