/**
 * Envía el resumen del informe al cliente vía Resend.
 *
 * El email contiene:
 * - Resumen financiero (UF aprobado + cuota + tips)
 * - Botón "Ver mi informe completo" con un magic link de Supabase: al
 *   clickearlo, el cliente queda autenticado y aterriza en su informe.
 *
 * Si magicLinkUrl es null (generateLink falló), el email igual se manda
 * con el resumen, pero sin botón. El cliente puede ir a /login con su
 * correo para recibir un magic link manualmente.
 *
 * Restricciones del modo sandbox de Resend (mientras el dominio no esté
 * verificado): from debe ser onboarding@resend.dev y to solo puede ser el
 * email del owner de la cuenta Resend.
 */

import { Resend } from "resend";
import { formatCLP, formatUF } from "./financial-calc";

export type Tip = { titulo: string; detalle: string };

export type EnviarEmailInformeInput = {
  to: string;
  nombre: string;
  ufAprobadas: number;
  cuotaMaxima: number;
  liquidoEfectivo: number;
  tips: Tip[];
  resultadoUrl: string;
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
  const tipsHtml = input.tips
    .map(
      (t) => `
      <div style="background:#f4f6f8;padding:16px;border-radius:8px;margin-bottom:8px;">
        <div style="font-weight:600;color:#0f172a;">${escapeHtml(t.titulo)}</div>
        <div style="color:#475569;font-size:14px;margin-top:4px;line-height:1.5;">${escapeHtml(t.detalle)}</div>
      </div>`,
    )
    .join("");

  const ctaHtml = input.magicLinkUrl
    ? `
      <div style="text-align:center;margin:32px 0;">
        <a href="${escapeHtml(input.magicLinkUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;">
          Ver mi informe completo
        </a>
        <div style="font-size:12px;color:#94a3b8;margin-top:12px;">
          Este link expira en 1 hora. Si pasa el tiempo, podés pedir uno nuevo en
          <a href="${escapeHtml(input.resultadoUrl.replace(/\/wizard\/resultado.*$/, "/login"))}" style="color:#475569;">${escapeHtml(input.resultadoUrl.replace(/\/wizard\/resultado.*$/, "/login"))}</a>
        </div>
      </div>`
    : `
      <div style="text-align:center;margin:32px 0;">
        <p style="color:#475569;font-size:14px;">
          Para acceder a tu informe completo, andá a
          <a href="${escapeHtml(input.resultadoUrl.replace(/\/wizard\/resultado.*$/, "/login"))}" style="color:#0f172a;">${escapeHtml(input.resultadoUrl.replace(/\/wizard\/resultado.*$/, "/login"))}</a>
          y pedí un link con tu correo.
        </p>
      </div>`;

  return `<!doctype html>
<html lang="es">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#0f172a;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;">
    <h1 style="font-size:24px;margin:0 0 8px 0;line-height:1.3;">Hola ${escapeHtml(input.nombre)}, tu informe está listo</h1>
    <p style="color:#475569;font-size:14px;margin:0 0 24px 0;">
      Estimación referencial. El monto final lo entrega cada banco según su evaluación crediticia.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding-right:6px;width:50%;vertical-align:top;">
          <div style="border:1px solid #e2e8f0;padding:16px;border-radius:8px;">
            <div style="font-size:12px;color:#64748b;">Te podrían prestar hasta</div>
            <div style="font-size:22px;font-weight:600;margin-top:4px;">${escapeHtml(formatUF(input.ufAprobadas))}</div>
          </div>
        </td>
        <td style="padding-left:6px;width:50%;vertical-align:top;">
          <div style="border:1px solid #e2e8f0;padding:16px;border-radius:8px;">
            <div style="font-size:12px;color:#64748b;">Cuota máxima sugerida</div>
            <div style="font-size:22px;font-weight:600;margin-top:4px;">${escapeHtml(formatCLP(input.cuotaMaxima))}<span style="font-size:14px;color:#64748b;font-weight:400;"> / mes</span></div>
          </div>
        </td>
      </tr>
    </table>

    <h2 style="font-size:18px;margin:0 0 12px 0;">Cómo mejorar tu perfil crediticio</h2>
    ${tipsHtml}

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
