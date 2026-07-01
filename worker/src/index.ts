import express from "express";
import pino from "pino";
import { config } from "./config.js";
import { verifySignature } from "./hmac.js";
import { enqueue, currentActive, startCron } from "./queue.js";

const log = pino({ name: "http" });
const app = express();

// Necesitamos el raw body para validar HMAC
app.use(express.json({
  verify: (req, _res, buf) => { (req as unknown as { rawBody: string }).rawBody = buf.toString("utf8"); },
  limit: "1mb",
}));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    version: "0.1.0",
    active: currentActive(),
    max: config.WORKER_MAX_CONCURRENCY,
  });
});

app.post("/trigger", (req, res) => {
  const raw = (req as unknown as { rawBody: string }).rawBody ?? "";
  const sig = req.header("X-Mapadata-Signature") ?? undefined;
  if (!verifySignature(raw, sig)) {
    log.warn("invalid_signature");
    return res.status(401).json({ error: "invalid_signature" });
  }
  const body = req.body as { run_id?: string; action?: string };
  if (!body?.run_id || body.action !== "process_run") {
    return res.status(400).json({ error: "invalid_payload" });
  }
  enqueue(body.run_id);
  return res.status(202).json({ accepted: true, run_id: body.run_id });
});

app.listen(config.PORT, () => {
  log.info({ port: config.PORT }, "worker_listening");
  startCron();
});
