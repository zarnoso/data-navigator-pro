export function formatRut(value: string): string {
  let clean = value.replace(/[^0-9kK]/g, "");
  if (clean.length === 0) return "";
  
  const dv = clean.slice(-1).toUpperCase();
  const body = clean.slice(0, -1);
  
  if (body.length === 0) return clean;
  
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const clean = rut.replace(/[.\-]/g, "");
  if (clean.length < 2) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  
  if (!/^\d+$/.test(body)) return false;
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const expected = remainder === 0 ? "0" : remainder === 1 ? "K" : String(11 - remainder);
  
  return dv === expected;
}
