import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config.js";

export function verifySignature(rawBody: string, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", config.MAPADATA_WORKER_SECRET).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
