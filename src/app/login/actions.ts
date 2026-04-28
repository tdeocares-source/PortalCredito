"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const schema = z.object({
  email: z.string().email("Email inválido"),
  next: z.string().startsWith("/").optional(),
});

export type LoginState =
  | { ok: true; email: string }
  | { ok: false; error: string }
  | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const callbackUrl = new URL("/auth/callback", siteUrl);
  if (parsed.data.next) {
    callbackUrl.searchParams.set("next", parsed.data.next);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return {
      ok: false,
      error: "No pudimos enviar el email. Probá de nuevo en un momento.",
    };
  }

  return { ok: true, email: parsed.data.email };
}
