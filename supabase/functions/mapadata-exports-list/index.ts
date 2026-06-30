import { handlePreflight, json } from "../_shared/cors.ts";
import { requireUser, userClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const url = new URL(req.url);
  const runId = url.searchParams.get("run_id");

  const supa = userClient(user.authHeader);
  let q = supa.from("mapadata_exports").select("*").order("created_at", { ascending: false });
  if (runId) q = q.eq("run_id", runId);
  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);
  return json({ exports: data ?? [] });
});
