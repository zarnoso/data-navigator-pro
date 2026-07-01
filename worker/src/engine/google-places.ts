import { config } from "../config.js";
import type { RunPlan } from "./planner.js";

export interface RawPlace {
  place_id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  types?: string[];
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  primaryType?: string;
}

const FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.internationalPhoneNumber",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.types",
  "places.primaryType",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
].join(",");

/** Google Places API (New) — searchText con circular locationBias. */
export async function searchText(query: string, plan: RunPlan): Promise<RawPlace[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": config.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": FIELDS,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "es-CL",
      regionCode: "CL",
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: plan.center.lat, longitude: plan.center.lng },
          radius: plan.radiusM,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`places_error_${res.status}:${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { places?: Array<Record<string, unknown>> };
  const places = data.places ?? [];
  return places.map((p) => ({ place_id: p.id as string, ...(p as object) }) as RawPlace);
}
