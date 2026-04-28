/**
 * Helper para loguear errores en server actions sin filtrar contexto sensible.
 *
 * Por qué existe: los errores de Supabase/Postgrest son objetos POJO con
 * propiedades como `details`, `hint`, `code`, `message` y a veces el row
 * conflictivo. `console.error("...", err)` serializa todo eso a los logs de
 * Netlify, donde podría leakear PII (RUT, sueldo) o pistas para un atacante.
 *
 * Esta función extrae solo `code` y `message`, que son seguros para
 * loggear y suficientes para debug.
 */

export function logSafeError(prefix: string, err: unknown): void {
  if (err === null || err === undefined) {
    console.error(prefix);
    return;
  }
  if (err instanceof Error) {
    console.error(prefix, { name: err.name, message: err.message });
    return;
  }
  if (typeof err === "object") {
    const obj = err as { code?: unknown; message?: unknown };
    console.error(prefix, {
      code: obj.code ?? null,
      message: obj.message ?? null,
    });
    return;
  }
  console.error(prefix, String(err));
}
