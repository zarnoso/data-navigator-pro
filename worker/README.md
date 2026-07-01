# Mapadata Worker (DonWeb)

Worker Node.js que procesa runs largos del Mapadata Lead Builder. Recibe triggers HMAC-firmados desde las Edge Functions de Supabase, consulta Google Places, normaliza y deduplica leads, y sube los exports (XLSX/CSV) a Supabase Storage.

## Arquitectura

```
Edge Function ─POST /trigger (HMAC)──▶ Worker
                                        │
                                        ├─ Google Places API
                                        ├─ Normalize / Dedupe / Score
                                        ├─ INSERT leads + run_leads (service_role)
                                        ├─ Build XLSX + CSV
                                        ├─ Upload a Storage (mapadata-exports)
                                        └─ UPDATE search_runs + entitlements
```

Un **cron interno** (cada `WORKER_CRON_INTERVAL_MS`) escanea `search_runs` con status `pending` de más de 2 minutos y los retoma. Esto hace al sistema resiliente a que el trigger HTTP se pierda.

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET  | `/health`   | público | ping + versión + concurrencia actual |
| POST | `/trigger`  | HMAC    | `{ run_id, action: "process_run" \| "build_export", export_id? }` |

Header requerido: `X-Mapadata-Signature: <hex-hmac-sha256(body, MAPADATA_WORKER_SECRET)>`

## Deploy en DonWeb

1. **Node 20+** en el servidor (`nvm install 20`).
2. Subir el repo (`git clone` o `rsync`). Ir a `worker/`.
3. `cp .env.example .env` y completar valores. `SUPABASE_SERVICE_ROLE_KEY` y `MAPADATA_WORKER_SECRET` deben ser los mismos configurados en Supabase Secrets.
4. `npm install` (o `bun install`).
5. `npm run build`.
6. Ejecutar bajo un supervisor:
   ```
   npm i -g pm2
   pm2 start dist/index.js --name mapadata-worker --time
   pm2 save && pm2 startup
   ```
7. Exponer el puerto detrás de nginx con SSL. La URL pública final se registra en Supabase como el secret `DONWEB_WORKER_URL`.
8. Verificar: `curl https://tu-worker.donweb.tld/health`.

## Agregar rubros / comunas

Insertar filas en `mapadata_industry_keywords` (con `google_places_types` + keywords) y `mapadata_comuna_geos` (con `lat`, `lng`, `radius_m`). El worker las lee dinámicamente, no requiere redeploy.

## Logs

`pino` a stdout (JSON). Usar `pm2 logs mapadata-worker` o enviar a Datadog/Loki.
