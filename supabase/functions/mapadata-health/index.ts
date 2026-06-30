import { corsHeaders, handlePreflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;

  const checks: Record<string, unknown> = {
    service: "mapadata-health",
    time: new Date().toISOString(),
    db: "unknown",
    worker: "unknown",
  };

  try {
    const supa = adminClient();
    const { error } = await supa.from("mapadata_industry_keywords").select("slug").limit(1);
    checks.db = error ? `error:${error.message}` : "ok";
  } catch (e) {
    checks.db = `error:${(e as Error).message}`;
  }

  const workerUrl = Deno.env.get("DONWEB_WORKER_URL");
  if (!workerUrl) {
    checks.worker = "not_configured";
  } else {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const r = await fetch(`${workerUrl.replace(/\/$/, "")}/health`, { signal: ctrl.signal });
      clearTimeout(t);
      checks.worker = r.ok ? "ok" : `http_${r.status}`;
    } catch (e) {
      checks.worker = `unreachable:${(e as Error).message}`;
    }
  }

  return json(checks);
});
