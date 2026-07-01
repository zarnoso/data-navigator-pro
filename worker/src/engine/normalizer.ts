import type { RawPlace } from "./google-places.js";
import type { RunPlan } from "./planner.js";

export interface NormalizedLead {
  place_id: string;
  name: string;
  address: string | null;
  phone_e164: string | null;
  phone_raw: string | null;
  website: string | null;
  email: string | null;
  types: string[];
  primary_type: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  reviews: number | null;
  business_status: string | null;
  region: string | null;
  comuna_slug: string;
  industry_slug: string;
  quality_score: number;
}

function toE164CL(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("56")) return `+${digits}`;
  if (digits.length === 9) return `+56${digits}`;
  if (digits.length === 8) return `+569${digits}`;
  return digits.length >= 7 ? `+${digits}` : null;
}

export function normalize(raw: RawPlace, plan: RunPlan): NormalizedLead | null {
  if (!raw.place_id || !raw.displayName?.text) return null;
  const phoneRaw = raw.internationalPhoneNumber ?? raw.nationalPhoneNumber ?? null;
  return {
    place_id: raw.place_id,
    name: raw.displayName.text.trim(),
    address: raw.formattedAddress ?? null,
    phone_e164: toE164CL(phoneRaw),
    phone_raw: phoneRaw,
    website: raw.websiteUri ?? null,
    email: null,
    types: raw.types ?? [],
    primary_type: raw.primaryType ?? null,
    lat: raw.location?.latitude ?? null,
    lng: raw.location?.longitude ?? null,
    rating: raw.rating ?? null,
    reviews: raw.userRatingCount ?? null,
    business_status: raw.businessStatus ?? null,
    region: plan.region,
    comuna_slug: plan.comunaSlug,
    industry_slug: plan.industrySlug,
    quality_score: 0,
  };
}

/** Score 0-100 basado en completitud + señales de actividad. */
export function score(lead: NormalizedLead): number {
  let s = 0;
  if (lead.phone_e164) s += 25;
  if (lead.website) s += 20;
  if (lead.address) s += 15;
  if (lead.rating && lead.rating >= 3.5) s += 10;
  if ((lead.reviews ?? 0) >= 5) s += 15;
  if (lead.business_status === "OPERATIONAL") s += 15;
  return Math.min(100, s);
}
