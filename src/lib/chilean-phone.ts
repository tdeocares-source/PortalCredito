/**
 * Utilidades para celular chileno (móviles, formato +56 9 XXXX XXXX).
 *
 * Forma canónica: 11 dígitos comenzando con "569" (sin "+", para almacenar).
 * Para mostrar: "+56 9 XXXX XXXX".
 */

const CANONICAL = /^569\d{8}$/;

export function cleanPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("56") && digits.length === 11) return digits;
  if (digits.startsWith("9") && digits.length === 9) return `56${digits}`;
  if (digits.length === 8) return `569${digits}`;
  return digits;
}

export function isValidPhone(input: string): boolean {
  return CANONICAL.test(cleanPhone(input));
}

export function formatPhone(input: string): string {
  const clean = cleanPhone(input);
  if (!CANONICAL.test(clean)) return input;
  return `+56 9 ${clean.slice(3, 7)} ${clean.slice(7)}`;
}
