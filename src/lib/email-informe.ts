/**
 * Notificación al cliente de que su informe está listo.
 *
 * El email es deliberadamente liviano: anuncia que el informe está listo,
 * cuenta brevemente qué incluye, y empuja al cliente al portal con un
 * magic link. NO contiene los números — esos viven en el portal para que
 * podamos trackear engagement (visualizaciones, clicks, descargas).
 *
 * Restricciones de Resend (sandbox): mientras el dominio FROM no esté
 * verificado, los envíos solo llegan al email de la cuenta Resend. Con
 * brekto.com (u otro dominio verificado) se manda a cualquier destinatario.
 */

import { Resend } from "resend";

export type EnviarEmailInformeInput = {
  to: string;
  nombre: string;
  magicLinkUrl: string | null;
};

export async function enviarEmailInforme(input: EnviarEmailInformeInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurada en el entorno");
  }
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: `${input.nombre}, tu informe de Portal Crédito está listo`,
    html: renderHtml(input),
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "error"} — ${error.message}`);
  }
  return data;
}

function renderHtml(input: EnviarEmailInformeInput): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const loginUrl = `${siteUrl}/login`;

  const ctaHtml = input.magicLinkUrl
    ? `
      <div style="text-align:center;margin:32px 0;">
        <a href="${escapeHtml(input.magicLinkUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
          Ver mi informe
        </a>
        <div style="font-size:12px;color:#94a3b8;margin-top:12px;">
          El link expira en 1 hora. Si pasa el tiempo, podés pedir uno nuevo en
          <a href="${escapeHtml(loginUrl)}" style="color:#475569;">${escapeHtml(loginUrl)}</a>
        </div>
      </div>`
    : `
      <div style="text-align:center;margin:32px 0;">
        <p style="color:#475569;font-size:14px;">
          Para acceder a tu informe, andá a
          <a href="${escapeHtml(loginUrl)}" style="color:#0f172a;">${escapeHtml(loginUrl)}</a>
          y pedí un link con tu correo.
        </p>
      </div>`;

  return `<!doctype html>
<html lang="es">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#0f172a;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;">
    <h1 style="font-size:24px;margin:0 0 12px 0;line-height:1.3;">Hola ${escapeHtml(input.nombre)}, tu informe está listo</h1>
    <p style="color:#475569;font-size:15px;margin:0 0 24px 0;line-height:1.55;">
      Procesamos tus respuestas y armamos una estimación referencial de tu capacidad
      de crédito hipotecario, junto con tips personalizados para fortalecer tu perfil.
    </p>

    <div style="background:#f4f6f8;padding:20px 24px;border-radius:10px;margin-bottom:8px;">
      <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:10px;">En tu informe vas a encontrar</div>
      <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
        <li>El monto estimado en UF que un banco podría prestarte</li>
        <li>Tu cuota mensual máxima sugerida</li>
        <li>Tips concretos para mejorar tu perfil crediticio</li>
      </ul>
    </div>

    ${ctaHtml}

    <p style="margin-top:32px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;">
      Portal Crédito · Esta estimación es referencial y no constituye una pre-aprobación bancaria.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
