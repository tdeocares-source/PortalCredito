/**
 * Cliente Supabase con service_role key — bypasea RLS.
 *
 * USAR SOLO en server actions y route handlers (server-side). Nunca importar
 * desde un Client Component: la service_role key no puede llegar al browser.
 *
 * Por convención, cualquier escritura en `solicitudes`, `informes` o
 * `accesos_informe` pasa por este cliente. Las policies RLS de la migración
 * solo habilitan SELECT para `authenticated`, así que el cliente del browser
 * o el server-with-cookies no podrían escribir aunque quisieran.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno",
    );
  }

  cached = createClient<Database>(url, serviceKey, {
    auth: {
      // El cliente admin no maneja sesión de usuario.
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}
