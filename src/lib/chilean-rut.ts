/**
 * Utilidades para RUT chileno: limpiar, formatear, calcular y validar dígito
 * verificador (módulo 11).
 */

export type RutParts = {
  body: string;
  dv: string;
};

export function cleanRut(input: string): string {
  return input.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function splitRut(input: string): RutParts | null {
  const clean = cleanRut(input);
  if (clean.length < 2) return null;
  return { body: clean.slice(0, -1), dv: clean.slice(-1) };
}

export function computeDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const mod = 11 - (sum % 11);
  if (mod === 11) return "0";
  if (mod === 10) return "K";
  return mod.toString();
}

export function isValidRut(input: string): boolean {
  const parts = splitRut(input);
  if (!parts) return false;
  if (!/^\d+$/.test(parts.body)) return false;
  if (parts.body.length < 7 || parts.body.length > 8) return false;
  return computeDv(parts.body) === parts.dv;
}

export function formatRut(input: string): string {
  const clean = cleanRut(input);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const dotted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${dotted}-${dv}`;
}
