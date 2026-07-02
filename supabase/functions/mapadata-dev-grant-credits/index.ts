// Dev-only helper: otorga un entitlement de prueba al usuario autenticado.
// Útil para validar el flujo end-to-end sin pasar por MercadoPago.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getUserFromRequest } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const amount = Math.min(2000, Math.max(1, Number(body?.amount ?? 500)));
    const plan_id = String(body?.plan_id ?? "dev_grant");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await admin
      .from("mapadata_entitlements")
      .insert({
        user_id: user.id,
        plan_id,
        source: "dev_grant",
        leads_available: amount,
        leads_consumed: 0,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, entitlement: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
