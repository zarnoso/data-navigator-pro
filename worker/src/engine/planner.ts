import { supabase } from "../supabase.js";

export interface RunPlan {
  runId: string;
  userId: string;
  industrySlug: string;
  comunaSlug: string;
  region: string | null;
  requestedLimit: number;
  formats: string[];
  keywords: string[];
  placeTypes: string[];
  center: { lat: number; lng: number };
  radiusM: number;
}

export async function buildPlan(runId: string): Promise<RunPlan> {
  const { data: run, error } = await supabase
    .from("mapadata_search_runs")
    .select("*")
    .eq("id", runId)
    .single();
  if (error || !run) throw new Error(`run_not_found:${runId}`);

  const [{ data: ind }, { data: com }] = await Promise.all([
    supabase.from("mapadata_industry_keywords").select("*").eq("slug", run.industry_slug).single(),
    supabase.from("mapadata_comuna_geos").select("*").eq("slug", run.comuna_slug).single(),
  ]);
  if (!ind) throw new Error(`unknown_industry:${run.industry_slug}`);
  if (!com) throw new Error(`unknown_comuna:${run.comuna_slug}`);

  return {
    runId: run.id,
    userId: run.user_id,
    industrySlug: run.industry_slug,
    comunaSlug: run.comuna_slug,
    region: run.region,
    requestedLimit: run.requested_limit,
    formats: run.formats ?? ["xlsx", "csv"],
    keywords: (ind.keywords as string[]) ?? [run.industry_slug],
    placeTypes: (ind.google_places_types as string[]) ?? [],
    center: { lat: Number(com.lat), lng: Number(com.lng) },
    radiusM: Number(com.radius_m ?? 5000),
  };
}
