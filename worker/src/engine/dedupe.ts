import type { NormalizedLead } from "./normalizer.js";

export function dedupe(leads: NormalizedLead[]): NormalizedLead[] {
  const seenPlace = new Set<string>();
  const seenName = new Set<string>();
  const out: NormalizedLead[] = [];
  for (const l of leads) {
    if (seenPlace.has(l.place_id)) continue;
    const key = `${l.name.toLowerCase().trim()}|${(l.address ?? "").toLowerCase().trim()}`;
    if (seenName.has(key)) continue;
    seenPlace.add(l.place_id);
    seenName.add(key);
    out.push(l);
  }
  return out;
}
