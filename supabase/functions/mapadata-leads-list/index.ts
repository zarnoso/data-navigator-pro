import { handlePreflight, json } from "../_shared/cors.ts";
import { requireUser, userClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const url = new URL(req.url);
  const runId = url.searchParams.get("run_id");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 1000);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const supa = userClient(user.authHeader);
  if (runId) {
    const { data, error, count } = await supa
      .from("mapadata_run_leads")
      .select("position, lead:mapadata_leads(*)", { count: "exact" })
      .eq("run_id", runId)
      .order("position", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) return json({ error: error.message }, 500);
    return json({ total: count, leads: (data ?? []).map((r: any) => r.lead) });
  }

  const { data, error, count } = await supa
    .from("mapadata_leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return json({ error: error.message }, 500);
  return json({ total: count, leads: data ?? [] });
});
