import { config } from "./config.js";
import { supabase } from "./supabase.js";
import { processRun } from "./engine/runner.js";
import pino from "pino";

const log = pino({ name: "queue" });

const active = new Set<string>();

export function currentActive(): number {
  return active.size;
}

export function enqueue(runId: string) {
  if (active.has(runId)) return;
  if (active.size >= config.WORKER_MAX_CONCURRENCY) {
    log.warn({ runId, active: active.size }, "at_capacity_deferring_to_cron");
    return;
  }
  active.add(runId);
  processRun(runId)
    .catch((e) => log.error({ runId, err: (e as Error).message }, "processRun_threw"))
    .finally(() => active.delete(runId));
}

export function startCron() {
  const tick = async () => {
    try {
      if (active.size >= config.WORKER_MAX_CONCURRENCY) return;
      const cutoff = new Date(Date.now() - 2 * 60_000).toISOString();
      const { data } = await supabase
        .from("mapadata_search_runs")
        .select("id, created_at, worker_started_at")
        .in("status", ["pending"])
        .lt("created_at", cutoff)
        .limit(config.WORKER_MAX_CONCURRENCY - active.size);
      for (const r of data ?? []) enqueue(r.id);
    } catch (e) {
      log.warn({ err: (e as Error).message }, "cron_tick_failed");
    }
  };
  setInterval(tick, config.WORKER_CRON_INTERVAL_MS);
  log.info({ intervalMs: config.WORKER_CRON_INTERVAL_MS }, "cron_started");
}
