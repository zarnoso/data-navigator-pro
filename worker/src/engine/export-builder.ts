import ExcelJS from "exceljs";
import { stringify } from "csv-stringify/sync";
import type { NormalizedLead } from "./normalizer.js";

const COLS: Array<{ key: keyof NormalizedLead; header: string; width?: number }> = [
  { key: "name", header: "Nombre", width: 40 },
  { key: "industry_slug", header: "Rubro", width: 18 },
  { key: "comuna_slug", header: "Comuna", width: 18 },
  { key: "region", header: "Región", width: 18 },
  { key: "address", header: "Dirección", width: 50 },
  { key: "phone_e164", header: "Teléfono", width: 18 },
  { key: "website", header: "Sitio web", width: 35 },
  { key: "email", header: "Email", width: 30 },
  { key: "rating", header: "Rating", width: 10 },
  { key: "reviews", header: "Reseñas", width: 10 },
  { key: "quality_score", header: "Calidad", width: 10 },
  { key: "place_id", header: "Place ID", width: 30 },
  { key: "lat", header: "Lat", width: 12 },
  { key: "lng", header: "Lng", width: 12 },
];

export async function buildXlsx(leads: NormalizedLead[], title: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Mapadata";
  const ws = wb.addWorksheet(title.slice(0, 30));
  ws.columns = COLS.map((c) => ({ header: c.header, key: c.key as string, width: c.width }));
  ws.getRow(1).font = { bold: true };
  for (const l of leads) ws.addRow(l);
  const ab = await wb.xlsx.writeBuffer();
  return Buffer.from(ab);
}

export function buildCsv(leads: NormalizedLead[]): Buffer {
  const rows = leads.map((l) => COLS.map((c) => l[c.key] ?? ""));
  const csv = stringify([COLS.map((c) => c.header), ...rows], { bom: true });
  return Buffer.from(csv, "utf8");
}
