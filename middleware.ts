/**
 * Middleware de auth + protección de rutas.
 *
 * 1. Refresca la sesión Supabase en cada request (necesario para que las
 *    cookies de auth no expiren en navegaciones largas).
 * 2. Redirige a /login si una ruta protegida (/wizard, /informe) se visita
 *    sin sesión, preservando el destino original via ?next=...
 * 3. Redirige a /wizard si /login se visita ya autenticado.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca la sesión leyendo el user (efecto colateral: si hubo refresh,
  // setAll grabó las cookies nuevas en supabaseResponse).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // /wizard es público (lead-gen sin fricción). El informe (resultado) requiere
  // auth — el cliente entra con magic link enviado al final del wizard.
  const isProtected =
    pathname.startsWith("/wizard/resultado") || pathname.startsWith("/informe");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/wizard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Excluye assets estáticos y rutas internas de Next.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
