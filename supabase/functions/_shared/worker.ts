/**
 * Dispara el worker externo en DonWeb. Si la URL no está configurada o el
 * worker no responde a tiempo, NO falla: el worker tomará el run vía cron de
 * runs pendientes.
 */
export async function triggerWorker(
  payload: { run_id?: string; export_id?: string; action: "process_run" | "build_export" },
): Promise<{ triggered: boolean; reason?: string }> {
  const url = Deno.env.get("DONWEB_WORKER_URL");
  const secret = Deno.env.get("MAPADATA_WORKER_SECRET");
  if (!url || !secret) return { triggered: false, reason: "worker_not_configured" };

  try {
    const body = JSON.stringify(payload);
    const sig = await hmac(secret, body);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`${url.replace(/\/$/, "")}/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mapadata-Signature": sig,
      },
      body,
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { triggered: false, reason: `http_${res.status}` };
    return { triggered: true };
  } catch (e) {
    return { triggered: false, reason: (e as Error).message };
  }
}

async function hmac(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
