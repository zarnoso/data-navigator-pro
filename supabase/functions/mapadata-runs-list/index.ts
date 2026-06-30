import { handlePreflight, json } from "../_shared/cors.ts";
import { requireUser, userClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const status = url.searchParams.get("status");

  const supa = userClient(user.authHeader);
  let q = supa.from("mapadata_search_runs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);
  return json({ runs: data ?? [] });
});
