"use client";

/**
 * Identifica al usuario en PostHog cuando hay sesión activa.
 *
 * Recibe userId/email desde el RootLayout (que lee el user server-side).
 * Cuando el usuario clickea el magic link y aterriza autenticado, este
 * componente correlaciona la sesión anónima previa con el user_id real
 * (PostHog hace el "alias" automáticamente con identified_only).
 */

import { useEffect } from "react";
import posthog from "posthog-js";

export function PostHogIdentify({
  userId,
  email,
}: {
  userId: string | null;
  email: string | null;
}) {
  useEffect(() => {
    if (userId) {
      posthog.identify(userId, email ? { email } : undefined);
    }
  }, [userId, email]);

  return null;
}
