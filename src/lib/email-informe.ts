/**
 * Envía el resumen del informe al cliente vía Resend.
 *
 * Restricciones mientras el dominio Resend no esté verificado:
 * - El FROM debe usar un dominio verificado o `onboarding@resend.dev`.
 * - El TO solo puede ser el email de la cuenta Resend (modo sandbox).
 * Cuando se verifique el dominio, ambas restricciones desaparecen.
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
    subject: `${input.nombre}, tu resumen de Portal Crédito`,
    html: renderHtml(input),
  });

  if (error) {
    throw new Error(`Resend: ${error.name ?? "error"} — ${error.message}`);
  }
  return data;
}

function renderHtml(input: EnviarEmailInformeInput): string {
  // Inline styles porque clientes de email son inconsistentes con CSS externo.
  const tipsHtml = input.tips
    .map(
      (t) => `
      <div style="background:#f4f6f8;padding:16px;border-radius:8px;margin-bottom:8px;">
        <div style="font-weight:600;color:#0f172a;">${escapeHtml(t.titulo)}</div>
        <div style="color:#475569;font-size:14px;margin-top:4px;line-height:1.5;">${escapeHtml(t.detalle)}</div>
      </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#0f172a;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;">
    <h1 style="font-size:24px;margin:0 0 8px 0;line-height:1.3;">Hola ${escapeHtml(input.nombre)}, este es tu resumen</h1>
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

    <p style="margin-top:24px;font-size:14px;color:#475569;">
      Podés volver a ver tu resumen acá:
      <br/>
      <a href="${escapeHtml(input.resultadoUrl)}" style="color:#0f172a;">${escapeHtml(input.resultadoUrl)}</a>
    </p>
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
