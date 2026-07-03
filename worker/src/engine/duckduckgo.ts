/**
 * Fallback gratuito: scraping vía DuckDuckGo HTML + fetch de sitios oficiales.
 * Extrae RUT chileno, teléfonos, emails y redes sociales con regex.
 * Se usa como complemento cuando Google Places devuelve pocos resultados.
 */
import * as cheerio from "cheerio";
import crypto from "node:crypto";
import pino from "pino";
import type { NormalizedLead } from "./normalizer.js";
import type { RunPlan } from "./planner.js";

const log = pino({ name: "ddg" });

// ---------- Regex Chile ----------
const RUT_RE = /\b(\d{1,2}\.\d{3}\.\d{3}-[\dkK])\b/g;
const PHONE_RE = /(?:\+?56\s?)?(?:9\s?\d{4}\s?\d{4}|2\s?\d{3,4}\s?\d{4}|(?:\d{2,3})\s?\d{3}\s?\d{3,4})/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const LINKEDIN_RE = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:company|in)\/[^\s"'<>]+/gi;
const INSTAGRAM_RE = /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+/gi;

const UA = "Mozilla/5.0 (compatible; MapadataBot/1.0; +https://mapadata.cl)";
const FETCH_TIMEOUT_MS = 8000;

async function fetchText(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "es-CL,es;q=0.9" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("56")) return `+${digits}`;
  if (digits.length === 9) return `+56${digits}`;
  if (digits.length === 8) return `+569${digits}`;
  return null;
}

function extractContacts(html: string) {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const rut = (text.match(RUT_RE) ?? [])[0] ?? null;
  const phones = Array.from(new Set((text.match(PHONE_RE) ?? []).map(normalizePhone).filter(Boolean))) as string[];
  const emails = Array.from(
    new Set(
      (text.match(EMAIL_RE) ?? [])
        .map((e) => e.toLowerCase())
        .filter((e) => !/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(e))
        .filter((e) => !e.includes("sentry") && !e.includes("wixpress")),
    ),
  );
  const linkedin = (html.match(LINKEDIN_RE) ?? [])[0] ?? null;
  const instagram = (html.match(INSTAGRAM_RE) ?? [])[0] ?? null;
  return { rut, phones, emails, linkedin, instagram };
}

/** Consulta DuckDuckGo HTML y devuelve [{title, url}] de resultados orgánicos. */
async function searchDuckDuckGo(query: string, limit: number): Promise<Array<{ title: string; url: string }>> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = await fetchText(url);
  if (!html) return [];
  const $ = cheerio.load(html);
  const results: Array<{ title: string; url: string }> = [];
  $("a.result__a").each((_, el) => {
    const title = $(el).text().trim();
    let href = $(el).attr("href") ?? "";
    // DDG envuelve el link real en uddg=
    const m = href.match(/[?&]uddg=([^&]+)/);
    if (m) href = decodeURIComponent(m[1]);
    if (!href.startsWith("http")) return;
    // Filtrar dominios genéricos que no son sitios de empresa
    const bad = /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|twitter\.com|x\.com|wikipedia\.org|amarillas\.cl|paginas\.cl|yelp\.|tripadvisor\.|guioteca|emol\.com)/i;
    if (bad.test(href)) return;
    results.push({ title, url: href });
  });
  return results.slice(0, limit);
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Punto de entrada: devuelve leads normalizados desde DDG + scrape de sitios. */
export async function fetchLeadsDuckDuckGo(plan: RunPlan, limit: number): Promise<NormalizedLead[]> {
  const queries = plan.keywords.slice(0, 3).map((k) => `${k} ${plan.comunaSlug.replace(/-/g, " ")} chile contacto`);
  const collected: Array<{ title: string; url: string }> = [];
  for (const q of queries) {
    if (collected.length >= limit * 2) break;
    try {
      const items = await searchDuckDuckGo(q, 20);
      collected.push(...items);
    } catch (e) {
      log.warn({ q, err: (e as Error).message }, "ddg_search_failed");
    }
  }

  // dedupe por dominio
  const byDomain = new Map<string, { title: string; url: string }>();
  for (const it of collected) {
    const d = domainOf(it.url);
    if (!byDomain.has(d)) byDomain.set(d, it);
  }
  const sites = Array.from(byDomain.values()).slice(0, limit);

  const leads: NormalizedLead[] = [];
  const CONCURRENCY = 6;
  for (let i = 0; i < sites.length; i += CONCURRENCY) {
    const batch = sites.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (s) => {
        const domain = domainOf(s.url);
        const home = await fetchText(s.url);
        const contactUrl = `${new URL(s.url).origin}/contacto`;
        const contact = await fetchText(contactUrl);
        const html = [home, contact].filter(Boolean).join("\n");
        if (!html) return null;
        const c = extractContacts(html);
        if (!c.phones.length && !c.emails.length && !c.rut) return null;
        const placeId = `ddg:${crypto.createHash("sha1").update(domain).digest("hex").slice(0, 20)}`;
        const lead: NormalizedLead = {
          place_id: placeId,
          name: s.title.replace(/\s+\|.*$/, "").trim() || domain,
          address: null,
          phone_e164: c.phones[0] ?? null,
          phone_raw: c.phones[0] ?? null,
          website: `${new URL(s.url).origin}/`,
          email: c.emails[0] ?? null,
          types: [],
          primary_type: null,
          lat: null,
          lng: null,
          rating: null,
          reviews: null,
          business_status: null,
          region: plan.region,
          comuna_slug: plan.comunaSlug,
          industry_slug: plan.industrySlug,
          quality_score: 0,
        };
        return lead;
      }),
    );
    for (const r of results) if (r) leads.push(r);
  }
  log.info({ found: leads.length, from: sites.length }, "ddg_scrape_done");
  return leads;
}
