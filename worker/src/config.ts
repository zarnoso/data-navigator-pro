import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(8787),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  MAPADATA_WORKER_SECRET: z.string().min(16),
  GOOGLE_PLACES_API_KEY: z.string().min(10),
  WORKER_MAX_CONCURRENCY: z.coerce.number().default(2),
  WORKER_CRON_INTERVAL_MS: z.coerce.number().default(60_000),
  MAPADATA_EXPORTS_BUCKET: z.string().default("mapadata-exports"),
});

export const config = schema.parse(process.env);
export type Config = z.infer<typeof schema>;
