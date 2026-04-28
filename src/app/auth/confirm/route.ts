/**
 * Confirmación de magic link via token_hash (flow SSR-friendly).
 *
 * Este endpoint es donde aterrizan los magic links que generamos server-side
 * con `admin.auth.admin.generateLink()` y que mandamos por nuestro Resend.
 * A diferencia de /auth/callback (que espera ?code=... del flow PKCE iniciado
 * desde el browser via signInWithOtp), acá usamos verifyOtp con el
 * token_hash que viene en la URL.
 *
 * Tras verificar, hace claim de las solicitudes huérfanas con el correo del
 * usuario autenticado (mismo comportamiento que /auth/callback).
 */

import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { logSafeError } from "@/lib/log";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/wizard";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

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
      logSafeError("auth/confirm: error reclamando solicitudes", claimErr);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
