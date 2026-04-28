"use client";

/**
 * Inicializa PostHog en el browser y provee el cliente al resto de la app.
 *
 * Configuración relevante:
 * - capture_pageview: false → manejamos pageviews manualmente desde
 *   PostHogPageview (necesario en App Router porque el router no dispara
 *   navegaciones DOM tradicionales).
 * - person_profiles: "identified_only" → no creamos profile hasta que
 *   llamemos identify() (post-auth). Mantiene el conteo de "personas"
 *   limpio.
 * - session_recording.maskAllInputs: true → en grabaciones de sesión,
 *   los valores de TODOS los inputs (RUT, sueldo, deudas, etc.) se
 *   reemplazan por asteriscos. Cumple la regla de CLAUDE.md sobre
 *   datos sensibles.
 * - sanitize_properties → drop de query params de auth (token_hash, code)
 *   antes de mandar el evento. Protección extra para no logear tokens.
 */

import { useEffect, type ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false,
      person_profiles: "identified_only",
      session_recording: {
        maskAllInputs: true,
      },
      sanitize_properties: (properties) => {
        if (typeof properties.$current_url === "string") {
          try {
            const url = new URL(properties.$current_url);
            url.searchParams.delete("token_hash");
            url.searchParams.delete("code");
            properties.$current_url = url.toString();
          } catch {
            // URL malformada — dejar como está
          }
        }
        return properties;
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
