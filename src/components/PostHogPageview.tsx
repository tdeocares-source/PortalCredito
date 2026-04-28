"use client";

/**
 * Captura $pageview en cada cambio de ruta del App Router.
 *
 * useSearchParams suspende en Next 16, así que el componente real va
 * dentro de un Suspense boundary (recomendación oficial de PostHog).
 *
 * Sanitiza la URL antes de capturarla: drop de token_hash y code para
 * no mandar tokens de auth a PostHog.
 */

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    let url = window.origin + pathname;
    const params = searchParams ? new URLSearchParams(searchParams) : null;
    if (params) {
      params.delete("token_hash");
      params.delete("code");
      const qs = params.toString();
      if (qs) url = `${url}?${qs}`;
    }

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PageView />
    </Suspense>
  );
}
