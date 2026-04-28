/**
 * Cliente Supabase para Server Components, Route Handlers y Server Actions.
 *
 * Usa anon/publishable key + cookies de la sesión Supabase para que las
 * lecturas pasen por RLS con `auth.uid()` del usuario actual. Para escrituras
 * que necesiten bypass de RLS, usar `supabase-admin.ts`.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          // Server Components no permiten escribir cookies y `set()` lanza.
          // En Server Actions / Route Handlers sí funciona; el middleware se
          // encarga del refresh de sesión cuando estamos en RSC.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignorable cuando estamos en un Server Component
          }
        },
      },
    },
  );
}
