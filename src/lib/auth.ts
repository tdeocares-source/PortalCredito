/**
 * Helpers de auth para Server Components y Server Actions.
 *
 * El middleware ya protege las rutas /wizard y /informe, así que estos
 * helpers son la segunda línea de defensa: si por algún cambio futuro de
 * matcher una ruta protegida queda fuera, `requireUser()` corta igual.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
