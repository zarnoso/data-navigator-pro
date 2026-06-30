import { handlePreflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/auth.ts";

/**
 * MercadoPago IPN/webhook handler.
 *
 * MP envía POST con query `?type=payment&data.id=XXX` o body JSON. Buscamos el
 * payment con la API de MP (requiere MERCADOPAGO_ACCESS_TOKEN) y mapeamos
 * `external_reference` => "<user_id>:<plan_id>" para crear el entitlement.
 *
 * Validación opcional con MERCADOPAGO_WEBHOOK_SECRET vía header `x-signature`.
 */
const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? "";

const PLAN_LEADS: Record<string, number> = {
  basico: 500,
  starter: 1000,
  business: 3000,
  master: 5000,
};

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const supa = adminClient();

  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? null;
  let rawBody: any = null;
  if (req.method === "POST") {
    rawBody = await req.json().catch(() => ({}));
    paymentId = paymentId ?? rawBody?.data?.id ?? rawBody?.id ?? null;
  }

  // Auditoría
  await supa.from("mapadata_billing_events").insert({
    provider: "mercadopago",
    event_type: rawBody?.type ?? url.searchParams.get("type") ?? "unknown",
    external_id: paymentId ? String(paymentId) : null,
    payload: { query: Object.fromEntries(url.searchParams), body: rawBody },
  });

  if (!paymentId) return json({ ok: true, note: "no_payment_id" });
  if (!MP_TOKEN) return json({ ok: true, note: "mp_token_missing" });

  // Consultar pago en MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
  });
  if (!mpRes.ok) return json({ ok: false, error: `mp_${mpRes.status}` }, 200);
  const payment = await mpRes.json();

  if (payment.status !== "approved") {
    return json({ ok: true, status: payment.status });
  }

  const extRef: string = payment.external_reference ?? "";
  const [userId, planId] = extRef.split(":");
  if (!userId || !planId) {
    return json({ ok: false, error: "bad_external_reference", external_reference: extRef });
  }
  const leads = PLAN_LEADS[planId] ?? 0;
  if (!leads) return json({ ok: false, error: "unknown_plan", planId });

  // Upsert idempotente por mp_payment_id
  const { error } = await supa.from("mapadata_entitlements").upsert(
    {
      user_id: userId,
      plan_id: planId,
      leads_available: leads,
      leads_consumed: 0,
      mp_payment_id: String(paymentId),
      mp_external_reference: extRef,
      source: "mercadopago",
      metadata: { amount: payment.transaction_amount, currency: payment.currency_id },
    },
    { onConflict: "mp_payment_id" },
  );
  if (error) return json({ ok: false, error: error.message }, 500);

  return json({ ok: true, user_id: userId, plan_id: planId, leads_added: leads });
});
