
-- =========================================================================
-- MAPADATA LEAD BUILDER — schema base
-- Tablas en `public` con prefijo `mapadata_` (equivalente funcional al schema mapadata)
-- =========================================================================

-- ---------- utility trigger ----------
CREATE OR REPLACE FUNCTION public.mapadata_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================================
-- 1) industry_keywords (catálogo público de rubros)
-- =========================================================================
CREATE TABLE public.mapadata_industry_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  google_places_types TEXT[] NOT NULL DEFAULT '{}',
  related_slugs TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mapadata_industry_keywords TO anon, authenticated;
GRANT ALL ON public.mapadata_industry_keywords TO service_role;
ALTER TABLE public.mapadata_industry_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industry_keywords_public_read" ON public.mapadata_industry_keywords
  FOR SELECT USING (true);
CREATE TRIGGER mapadata_industry_keywords_updated_at
  BEFORE UPDATE ON public.mapadata_industry_keywords
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 2) comuna_geos (catálogo público de comunas con bounding box)
-- =========================================================================
CREATE TABLE public.mapadata_comuna_geos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  region TEXT NOT NULL,
  region_code TEXT,
  center_lat NUMERIC(10,7) NOT NULL,
  center_lng NUMERIC(10,7) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 5000,
  grid_step_meters INTEGER NOT NULL DEFAULT 2500,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mapadata_comuna_geos TO anon, authenticated;
GRANT ALL ON public.mapadata_comuna_geos TO service_role;
ALTER TABLE public.mapadata_comuna_geos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comuna_geos_public_read" ON public.mapadata_comuna_geos
  FOR SELECT USING (true);
CREATE TRIGGER mapadata_comuna_geos_updated_at
  BEFORE UPDATE ON public.mapadata_comuna_geos
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 3) entitlements (créditos por usuario)
-- =========================================================================
CREATE TABLE public.mapadata_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  leads_available INTEGER NOT NULL DEFAULT 0,
  leads_consumed INTEGER NOT NULL DEFAULT 0,
  mp_payment_id TEXT,
  mp_external_reference TEXT,
  source TEXT NOT NULL DEFAULT 'mercadopago',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mapadata_entitlements_user_idx ON public.mapadata_entitlements(user_id);
CREATE UNIQUE INDEX mapadata_entitlements_mp_payment_idx
  ON public.mapadata_entitlements(mp_payment_id) WHERE mp_payment_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapadata_entitlements TO authenticated;
GRANT ALL ON public.mapadata_entitlements TO service_role;
ALTER TABLE public.mapadata_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entitlements_owner_read" ON public.mapadata_entitlements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- writes solo por service_role (worker / webhook)
CREATE TRIGGER mapadata_entitlements_updated_at
  BEFORE UPDATE ON public.mapadata_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 4) billing_events (auditoría MercadoPago)
-- =========================================================================
CREATE TABLE public.mapadata_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  provider TEXT NOT NULL DEFAULT 'mercadopago',
  event_type TEXT NOT NULL,
  external_id TEXT,
  external_reference TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mapadata_billing_events_user_idx ON public.mapadata_billing_events(user_id);
CREATE INDEX mapadata_billing_events_external_idx ON public.mapadata_billing_events(external_id);
GRANT SELECT ON public.mapadata_billing_events TO authenticated;
GRANT ALL ON public.mapadata_billing_events TO service_role;
ALTER TABLE public.mapadata_billing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_events_owner_read" ON public.mapadata_billing_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========================================================================
-- 5) search_queries (definición de búsqueda)
-- =========================================================================
CREATE TABLE public.mapadata_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT,
  industry_slug TEXT NOT NULL,
  comuna_slug TEXT NOT NULL,
  region TEXT,
  extra_keywords TEXT[] NOT NULL DEFAULT '{}',
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mapadata_search_queries_user_idx ON public.mapadata_search_queries(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapadata_search_queries TO authenticated;
GRANT ALL ON public.mapadata_search_queries TO service_role;
ALTER TABLE public.mapadata_search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_queries_owner_all" ON public.mapadata_search_queries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER mapadata_search_queries_updated_at
  BEFORE UPDATE ON public.mapadata_search_queries
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 6) search_runs (ejecución de un query)
-- =========================================================================
CREATE TABLE public.mapadata_search_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query_id UUID REFERENCES public.mapadata_search_queries(id) ON DELETE SET NULL,
  industry_slug TEXT NOT NULL,
  comuna_slug TEXT NOT NULL,
  region TEXT,
  requested_limit INTEGER NOT NULL,
  formats TEXT[] NOT NULL DEFAULT ARRAY['xlsx','csv'],
  status TEXT NOT NULL DEFAULT 'pending',
  -- valores válidos: pending | running | completed | failed | cancelled
  progress_pct INTEGER NOT NULL DEFAULT 0,
  leads_found INTEGER NOT NULL DEFAULT 0,
  leads_unique INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  worker_id TEXT,
  worker_started_at TIMESTAMPTZ,
  worker_finished_at TIMESTAMPTZ,
  error_message TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mapadata_search_runs_user_idx ON public.mapadata_search_runs(user_id);
CREATE INDEX mapadata_search_runs_status_idx ON public.mapadata_search_runs(status);
CREATE INDEX mapadata_search_runs_created_idx ON public.mapadata_search_runs(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapadata_search_runs TO authenticated;
GRANT ALL ON public.mapadata_search_runs TO service_role;
ALTER TABLE public.mapadata_search_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_runs_owner_read" ON public.mapadata_search_runs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- inserts y updates de runs solo por service_role (Edge Function + Worker)
CREATE TRIGGER mapadata_search_runs_updated_at
  BEFORE UPDATE ON public.mapadata_search_runs
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 7) leads (empresa normalizada)
-- =========================================================================
CREATE TABLE public.mapadata_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  source TEXT NOT NULL DEFAULT 'google_places',
  place_id TEXT,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  address TEXT,
  comuna TEXT,
  comuna_slug TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'CL',
  phone TEXT,
  phone_e164 TEXT,
  email TEXT,
  website TEXT,
  industry_slug TEXT,
  industry_label TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  rating NUMERIC(3,2),
  rating_count INTEGER,
  quality_score INTEGER NOT NULL DEFAULT 0,
  enrichment JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mapadata_leads_owner_idx ON public.mapadata_leads(owner_user_id);
CREATE INDEX mapadata_leads_comuna_idx ON public.mapadata_leads(comuna_slug);
CREATE INDEX mapadata_leads_industry_idx ON public.mapadata_leads(industry_slug);
CREATE UNIQUE INDEX mapadata_leads_owner_place_idx
  ON public.mapadata_leads(owner_user_id, place_id) WHERE place_id IS NOT NULL;
CREATE INDEX mapadata_leads_owner_namekey_idx
  ON public.mapadata_leads(owner_user_id, name_normalized, comuna_slug);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapadata_leads TO authenticated;
GRANT ALL ON public.mapadata_leads TO service_role;
ALTER TABLE public.mapadata_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_owner_read" ON public.mapadata_leads
  FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE TRIGGER mapadata_leads_updated_at
  BEFORE UPDATE ON public.mapadata_leads
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 8) run_leads (pivot run ↔ lead)
-- =========================================================================
CREATE TABLE public.mapadata_run_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.mapadata_search_runs(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.mapadata_leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_new_for_user BOOLEAN NOT NULL DEFAULT true,
  position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (run_id, lead_id)
);
CREATE INDEX mapadata_run_leads_run_idx ON public.mapadata_run_leads(run_id);
CREATE INDEX mapadata_run_leads_user_idx ON public.mapadata_run_leads(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapadata_run_leads TO authenticated;
GRANT ALL ON public.mapadata_run_leads TO service_role;
ALTER TABLE public.mapadata_run_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "run_leads_owner_read" ON public.mapadata_run_leads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========================================================================
-- 9) exports (archivos generados)
-- =========================================================================
CREATE TABLE public.mapadata_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.mapadata_search_runs(id) ON DELETE SET NULL,
  format TEXT NOT NULL,
  storage_path TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending | building | ready | failed
  error_message TEXT,
  bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mapadata_exports_user_idx ON public.mapadata_exports(user_id);
CREATE INDEX mapadata_exports_run_idx ON public.mapadata_exports(run_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapadata_exports TO authenticated;
GRANT ALL ON public.mapadata_exports TO service_role;
ALTER TABLE public.mapadata_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exports_owner_read" ON public.mapadata_exports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER mapadata_exports_updated_at
  BEFORE UPDATE ON public.mapadata_exports
  FOR EACH ROW EXECUTE FUNCTION public.mapadata_set_updated_at();

-- =========================================================================
-- 10) RPC: consumir créditos atómicamente (usado por el worker)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.mapadata_consume_credits(
  _user_id UUID,
  _amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _affected INTEGER;
BEGIN
  IF _amount <= 0 THEN RETURN true; END IF;

  WITH e AS (
    SELECT id, leads_available - leads_consumed AS remaining
    FROM public.mapadata_entitlements
    WHERE user_id = _user_id
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at ASC
  ),
  picked AS (
    SELECT id FROM e WHERE remaining >= _amount LIMIT 1
  )
  UPDATE public.mapadata_entitlements ent
  SET leads_consumed = ent.leads_consumed + _amount
  WHERE ent.id IN (SELECT id FROM picked);

  GET DIAGNOSTICS _affected = ROW_COUNT;
  RETURN _affected > 0;
END;
$$;
REVOKE ALL ON FUNCTION public.mapadata_consume_credits(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mapadata_consume_credits(UUID, INTEGER) TO service_role;

-- =========================================================================
-- 11) Seed: ferretería + Valparaíso
-- =========================================================================
INSERT INTO public.mapadata_industry_keywords (slug, display_name, keywords, google_places_types, related_slugs)
VALUES (
  'ferreteria',
  'Ferretería',
  ARRAY['ferretería', 'ferreteria', 'materiales de construcción', 'materiales construccion', 'tornillos pernos', 'pinturas y barnices'],
  ARRAY['hardware_store', 'home_goods_store'],
  ARRAY['materiales-construccion', 'pinturerias']
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.mapadata_comuna_geos (slug, display_name, region, region_code, center_lat, center_lng, radius_meters, grid_step_meters)
VALUES (
  'valparaiso',
  'Valparaíso',
  'Valparaíso',
  'V',
  -33.0472,
  -71.6127,
  8000,
  2500
)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- 12) Vista ferreterías Valparaíso (export friendly)
-- =========================================================================
CREATE OR REPLACE VIEW public.mapadata_v_ferreterias_valparaiso_export AS
SELECT
  l.id,
  l.name,
  l.phone_e164 AS telefono,
  l.email,
  l.website AS sitio_web,
  l.address AS direccion,
  l.comuna,
  l.region,
  l.rating,
  l.rating_count AS resenas,
  l.quality_score,
  l.created_at,
  l.owner_user_id
FROM public.mapadata_leads l
WHERE l.industry_slug = 'ferreteria'
  AND l.comuna_slug = 'valparaiso';

GRANT SELECT ON public.mapadata_v_ferreterias_valparaiso_export TO authenticated, service_role;
