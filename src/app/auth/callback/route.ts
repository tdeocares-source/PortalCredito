/**
 * Callback del magic link.
 *
 * Tras crear la sesión, hace el "claim" de las solicitudes huérfanas
 * (user_id = null) cuyo correo_contacto coincide con el email del usuario
 * recién autenticado. De este modo:
 * - El cliente que completó el wizard sin auth recupera la propiedad de
 *   sus solicitudes en cuanto clickea el magic link del email.
 * - RLS empieza a permitirle leer su informe en /wizard/resultado.
 *
 * El claim usa el cliente admin (service_role) para pasar por arriba de
 * las policies que aún no aplicarían.
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/wizard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=invalid_code`);
  }

  // Claim de solicitudes huérfanas para este correo.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email && user?.id) {
    const admin = getSupabaseAdmin();
    const { error: claimErr } = await admin
      .from("solicitudes")
      .update({ user_id: user.id } as never)
      .eq("correo_contacto", user.email)
      .is("user_id", null);
    if (claimErr) {
      console.error("auth/callback: error reclamando solicitudes", claimErr);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
