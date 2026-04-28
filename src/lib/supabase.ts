/**
 * Cliente Supabase para el browser (Client Components).
 *
 * Usa la anon/publishable key + RLS, así que solo puede leer las filas que
 * pertenezcan al usuario autenticado. Las escrituras pasan por server actions
 * que usan el cliente admin (`supabase-admin.ts`).
 */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
