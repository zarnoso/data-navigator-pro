import { handlePreflight, json } from "../_shared/cors.ts";
import { requireUser, userClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const url = new URL(req.url);
  const runId = url.searchParams.get("run_id");
  if (!runId) return json({ error: "missing_run_id" }, 400);

  const supa = userClient(user.authHeader);
  const { data: run, error } = await supa
    .from("mapadata_search_runs")
    .select("*")
    .eq("id", runId)
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!run) return json({ error: "not_found" }, 404);

  const { data: exports_ } = await supa
    .from("mapadata_exports")
    .select("id, format, status, row_count, storage_path, bytes")
    .eq("run_id", runId);

  return json({ run, exports: exports_ ?? [] });
});
