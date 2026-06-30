import { handlePreflight, json } from "../_shared/cors.ts";
import { requireUser, userClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const supa = userClient(user.authHeader);
  const { data: ents, error } = await supa
    .from("mapadata_entitlements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 500);

  const now = new Date();
  const active = (ents ?? []).filter((e: any) => !e.expires_at || new Date(e.expires_at) > now);
  const remaining = active.reduce(
    (acc: number, e: any) => acc + (e.leads_available - e.leads_consumed),
    0,
  );

  return json({
    user_id: user.id,
    remaining_leads: remaining,
    entitlements: ents ?? [],
  });
});
