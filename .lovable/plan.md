
# Plan — Mapadata Lead Builder (Fases 1+2+6) — v2 con worker DonWeb

## Objetivo
Cliente selecciona rubro/comuna/cantidad → API crea un `search_run` y responde rápido → worker externo en DonWeb procesa el run (Google Places → normaliza → dedup → guarda en Supabase → genera XLSX/CSV → sube a Storage → marca run como completado). Caso de validación: 500 ferreterías en Valparaíso.

## Arquitectura

```
[Cliente Vite/React]
        │  supabase.functions.invoke('mapadata-runs-create')
        ▼
[Edge Function Supabase]  ← API gateway delgado
  - valida JWT
  - valida entitlement
  - INSERT search_run (status='pending')
  - notifica worker (HTTP POST a DonWeb /trigger)
  - responde { run_id } en < 1s
        │
        │ (asíncrono)
        ▼
[Worker DonWeb / Node]   ← proceso largo
  - lee run pendiente (via REST Supabase con service_role)
  - planner → Google Places API en batches
  - normalizer → dedupe → quality score
  - INSERT leads + run_leads (chunked)
  - export builder XLSX + CSV
  - upload a Supabase Storage (signed URLs)
  - UPDATE search_run status='completed' + cost_usd + counters
  - UPDATE entitlement (descuenta créditos)
        ▲
        │  polling
[Cliente] ── GET mapadata-runs-status (cada 3-5s)
```

### División de responsabilidades

| Capa | Responsabilidad |
|---|---|
| **Supabase** | Auth, Postgres (`mapadata` schema), Storage (`mapadata-exports`), RLS, billing/entitlements, Edge Functions como API gateway |
| **Edge Functions** | Validar, crear/leer runs, leer leads, devolver signed URLs, recibir webhook MercadoPago, disparar worker. **Nunca procesos largos.** |
| **Worker DonWeb** | Google Places fetch, normalización, dedup, enrichment, generación XLSX/CSV, upload a Storage, actualización de runs |

## Fase 1 — Schema `mapadata` (Supabase migration)

Tablas (idénticas a v1):
- `mapadata.search_queries`
- `mapadata.search_runs` — añade columnas: `worker_id`, `worker_started_at`, `worker_finished_at`, `progress_pct`, `error_message`, `cost_usd`
- `mapadata.leads`
- `mapadata.run_leads`
- `mapadata.exports`
- `mapadata.entitlements`
- `mapadata.billing_events`
- `mapadata.industry_keywords` (seed: ferretería)

Cada tabla: CREATE → GRANT (`authenticated` + `service_role`) → ENABLE RLS → POLICIES (usuario ve solo lo suyo; `industry_keywords` lectura pública).

Storage bucket privado `mapadata-exports`.
Vista `mapadata.v_ferreterias_valparaiso_export`.

## Fase 2 — Edge Functions (API delgada)

Todas con CORS, validación Zod, verificación JWT en código. **Ninguna ejecuta scraping ni Places API.**

| Endpoint | Función | Qué hace |
|---|---|---|
| `health` | `mapadata-health` | ping + estado DB + estado worker (HEAD a DonWeb) |
| `POST runs` | `mapadata-runs-create` | valida entitlement → INSERT run pending → POST a `${DONWEB_WORKER_URL}/trigger` con `{run_id, hmac}` → responde `{run_id}` |
| `GET runs` | `mapadata-runs-list` | runs del usuario |
| `GET runs/:id` | `mapadata-runs-status` | estado + progress_pct + counts (para polling del cliente) |
| `GET leads` | `mapadata-leads-list` | leads de un run con filtros/paginación |
| `POST exports` | `mapadata-exports-create` | marca export pendiente y notifica al worker (el worker genera el archivo) |
| `GET exports` | `mapadata-exports-list` | |
| `GET exports/:id/download` | `mapadata-exports-download` | signed URL del archivo en Storage |
| `POST import` | `mapadata-import` | recibe CSV chico (<5MB) y lo encola para el worker; archivos grandes suben directo a Storage y notifican |
| `GET billing/status` | `mapadata-billing-status` | entitlement actual del usuario |
| `POST billing/webhook` | `mapadata-billing-webhook` | IPN MercadoPago → crea/actualiza entitlement |

## Fase 6 — Worker DonWeb + caso ferretería Valparaíso

### Worker (Node + TypeScript, deployable en DonWeb)

Repo separado o carpeta `worker/` en el monorepo. Stack:
- Node 20, Express, `@supabase/supabase-js` con `SERVICE_ROLE_KEY`, `exceljs`, `csv-stringify`, `zod`, `pino`.
- Endpoints:
  - `POST /trigger` — autenticado por HMAC compartido con la Edge Function. Recibe `{run_id}`, encola/procesa.
  - `GET /health` — para chequeo desde la Edge Function.
  - `POST /export` — genera XLSX/CSV de un run ya completado.
- Concurrencia controlada (cola en memoria + límite N runs simultáneos; suficiente para arrancar).
- Reintentos: si Places falla, marca run `failed` con `error_message` y NO descuenta créditos.

### Módulos del motor (en el worker)

```
worker/src/engine/
  planner.ts            # rubro+comuna → keywords + grid de búsqueda
  sources/
    google-places.ts    # Text Search + Place Details, retry, paginación
    csv-import.ts
  fetcher.ts            # rate limit, retry exponencial
  normalizer.ts         # campos canónicos, comunas/regiones CL, teléfono E.164
  dedupe.ts             # place_id, luego (nombre normalizado + dirección)
  enrichment.ts         # extrae email/redes del sitio oficial (HTTP simple)
  quality.ts            # score 0-100
  export-builder.ts     # XLSX (exceljs) + CSV
  billing-gate.ts       # decrement atómico de entitlement
  supabase.ts           # cliente con service_role
  runner.ts             # orquesta: lee run → procesa → marca completed
```

### Comunicación Edge ↔ Worker

- Edge Function llama `POST ${DONWEB_WORKER_URL}/trigger` con header `X-Mapadata-Signature: HMAC-SHA256(run_id, MAPADATA_WORKER_SECRET)`.
- Si el worker no responde 200 en 3s, la Edge Function igual deja el run `pending`. Un cron del worker (cada 60s) escanea `pending` runs viejos y los retoma → resiliente a caídas del trigger.
- El worker actualiza `search_runs.progress_pct` cada N leads procesados → el cliente hace polling vía `mapadata-runs-status`.

### Seed y run de validación

1. Migration siembra `industry_keywords` con `ferreteria` → `["hardware_store", "ferreteria", "ferretería", "materiales construcción"]`.
2. Migration siembra bounding box de Valparaíso (lat/lng + radio para grid).
3. Test E2E: cliente autenticado con entitlement de 500 leads → `POST mapadata-runs-create {industry:"ferreteria", comuna:"Valparaiso", limit:500, formats:["xlsx","csv"]}` → recibe `run_id` en < 1s → polling → worker procesa ~2-5 min → 500 leads en BD + XLSX + CSV en Storage → descarga vía signed URL.

## Secrets

| Secret | Dónde |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Worker DonWeb (.env del servidor) |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker DonWeb |
| `SUPABASE_URL` | Worker DonWeb |
| `MAPADATA_WORKER_SECRET` | HMAC compartido: Edge Functions + Worker |
| `DONWEB_WORKER_URL` | Edge Functions (Supabase secret) |
| `MERCADOPAGO_ACCESS_TOKEN` | Edge Functions |
| `MERCADOPAGO_WEBHOOK_SECRET` | Edge Functions |

En Supabase registraré los necesarios para Edge Functions vía `add_secret`. Los del worker los gestionas tú en DonWeb (te dejo `.env.example` y README).

## Entregables de esta iteración

1. **Migration SQL** (schema `mapadata`, tablas, RLS, GRANTS, seed, vista).
2. **Storage bucket** `mapadata-exports`.
3. **11 Edge Functions** (API gateway delgada).
4. **Carpeta `worker/`** en el repo con:
   - `package.json`, `tsconfig.json`, `.env.example`, `README.md` (cómo desplegar en DonWeb: Node 20, PM2 o systemd, puerto, SSL).
   - Express server + endpoints `/trigger`, `/health`, `/export`.
   - Módulos del engine listados arriba.
   - Cron de respaldo para runs huérfanos.
   - Dockerfile opcional.
5. **UI mínima** en `/dashboard/tasks`: botón "Generar 500 ferreterías Valparaíso" + tabla de runs con polling de estado + botón descargar XLSX/CSV.
6. **README de integración** explicando el flujo Edge ↔ Worker y cómo agregar nuevos rubros/comunas.

## Fuera de alcance

- Frontend completo `/mapadata/*` (Fase 5, siguiente iteración).
- Source adapters extra (SII, datos públicos).
- Cola distribuida tipo Redis/BullMQ (el cron + memoria alcanza para el volumen inicial).
- Auto-deploy del worker a DonWeb (lo despliegas manualmente con el README).

## Antes de empezar necesito confirmación de

1. Apruebas que registre `GOOGLE_PLACES_API_KEY` (te abriré formulario; aunque el valor lo usa el worker, lo dejo también en Supabase por si una Edge Function necesita validar quotas o hacer geocoding ligero). Si prefieres que viva SOLO en DonWeb, lo omito en Supabase.
2. Apruebas que genere `MAPADATA_WORKER_SECRET` (random 64 chars) y `DONWEB_WORKER_URL` (me das la URL pública del worker; si aún no la tienes, dejamos un placeholder editable).
3. Los secrets de MercadoPago (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`): ¿los registramos ahora o el webhook queda para otra iteración?
