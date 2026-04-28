"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { callCrediBid } from "@/lib/credibid";
import { calcularResumen } from "@/lib/financial-calc";
import { generarConsejos } from "@/lib/consejos";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { wizardSchema, type WizardData } from "@/lib/wizard-schema";
import { enviarEmailInforme } from "@/lib/email-informe";
import { logSafeError } from "@/lib/log";
import type { Json } from "@/lib/database.types";

// Rate limit: previene abuso del endpoint público.
// - 5 submits por IP / hora: bots y spam masivo
// - 3 magic links por correo / hora: phishing usando nuestro dominio FROM
const RATE_LIMIT_IP_MAX = 5;
const RATE_LIMIT_EMAIL_MAX = 3;
const RATE_LIMIT_WINDOW_SECONDS = 3600;

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // En Netlify/Vercel, x-forwarded-for tiene el IP del cliente al frente.
  // En dev (sin proxy) no está → "local".
  const xff = headersList.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return "local";
}

async function checkRateLimit(
  admin: ReturnType<typeof getSupabaseAdmin>,
  key: string,
  max: number,
): Promise<boolean> {
  const { data, error } = (await admin.rpc(
    "check_rate_limit" as never,
    {
      p_key: key,
      p_max: max,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    } as never,
  )) as { data: boolean | null; error: unknown };
  if (error) {
    // Fail-open: si la BD del rate limit falla, no bloqueamos al usuario
    // legítimo. El log alerta del problema.
    logSafeError("rate_limit: rpc fallo", error);
    return true;
  }
  return data === true;
}

export type SubmitSolicitudResult =
  | { ok: true; informeId: string; correo: string }
  | { ok: false; error: string };

/**
 * Persiste la solicitud + informe en BD (sin user_id), genera un magic link
 * de Supabase para el correo del cliente y manda un email con resumen + link.
 *
 * El cliente queda como "huérfano" (user_id = null) hasta que clickee el
 * magic link, momento en que /auth/callback hace el claim de sus solicitudes.
 *
 * El email es best-effort: si falla, se loggea pero el flow no rompe (la
 * solicitud queda persistida; el cliente puede pedir un nuevo magic link
 * desde /login con el mismo correo).
 */
export async function submitSolicitud(
  data: WizardData,
): Promise<SubmitSolicitudResult> {
  const parsed = wizardSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Los datos del formulario son inválidos." };
  }
  const w = parsed.data;
  const admin = getSupabaseAdmin();

  // Rate limit: por IP y por correo destinatario.
  const ip = await getClientIp();
  const ipOk = await checkRateLimit(admin, `submit:ip:${ip}`, RATE_LIMIT_IP_MAX);
  if (!ipOk) {
    return {
      ok: false,
      error: "Demasiadas solicitudes desde tu conexión. Intentá en una hora.",
    };
  }
  const correoNorm = w.correo.toLowerCase().trim();
  const emailOk = await checkRateLimit(
    admin,
    `submit:email:${correoNorm}`,
    RATE_LIMIT_EMAIL_MAX,
  );
  if (!emailOk) {
    return {
      ok: false,
      error: "Ya generamos varios informes para este correo. Esperá una hora.",
    };
  }

  // 1. Persistir solicitud huérfana.
  const solicitudInsert = {
    user_id: null,
    status: "enviada",
    correo_contacto: w.correo,
    nombre: w.nombre,
    apellido: w.apellido,
    proposito: w.proposito,
    cuando_invertir: w.cuandoInvertir,
    comunas: w.comunas,
    canal_preferido: w.canalPreferido,
    correo: w.correo,
    celular: w.celular,
    tipo_ingreso: w.tipoIngreso,
    liquido_mensual: w.liquidoMensual,
    deudas_mensuales: w.deudasMensuales,
    ahorro_pie: w.ahorroPie,
    mes_gastos_fuertes: w.mesGastosFuertes,
    prioridad_compra: w.prioridadCompra,
    rut: w.rut,
  };
  const { data: solicitud, error: solErr } = (await admin
    .from("solicitudes")
    .insert(solicitudInsert as never)
    .select("id")
    .single()) as { data: { id: string } | null; error: unknown };

  if (solErr || !solicitud) {
    logSafeError("submitSolicitud: error insertando solicitud", solErr);
    return { ok: false, error: "No pudimos guardar tu solicitud. Intentá de nuevo." };
  }

  // 2. Mock CrediBid + cálculo local + tips.
  const credi = await callCrediBid({
    rut: w.rut,
    liquidoMensual: w.liquidoMensual,
    tipoIngreso: w.tipoIngreso,
    deudasMensuales: w.deudasMensuales,
  });

  const resumen = calcularResumen({
    liquidoBruto: w.liquidoMensual,
    tipoIngreso: w.tipoIngreso,
    deudasMensuales: w.deudasMensuales,
  });

  const tips = generarConsejos({
    liquidoEfectivo: resumen.liquidoEfectivo,
    deudasMensuales: w.deudasMensuales,
    tipoIngreso: w.tipoIngreso,
    ahorroPie: w.ahorroPie,
    mesGastosFuertes: w.mesGastosFuertes,
  });

  // 3. Persistir informe.
  const informeInsert = {
    solicitud_id: solicitud.id,
    credibid_response: credi as unknown as Json,
    score: credi.score,
    monto_uf_aprobado: credi.monto_uf_aprobado,
    dividenda_max: credi.dividenda_max,
    liquido_efectivo: resumen.liquidoEfectivo,
    cuota_maxima: resumen.cuotaMaxima,
    tips: tips.map((t) => JSON.stringify(t)),
  };
  const { data: informe, error: infErr } = (await admin
    .from("informes")
    .insert(informeInsert as never)
    .select("id")
    .single()) as { data: { id: string } | null; error: unknown };

  if (infErr || !informe) {
    logSafeError("submitSolicitud: error insertando informe", infErr);
    return { ok: false, error: "No pudimos generar tu informe. Intentá de nuevo." };
  }

  await admin
    .from("solicitudes")
    .update({ status: "procesada" } as never)
    .eq("id", solicitud.id);

  // 4. Generar magic link via Admin API. Usamos `hashed_token` (no
  // `action_link`) porque action_link devuelve el token en el hash de la
  // URL (#access_token=...) que solo es visible en el browser. Con
  // hashed_token construimos una URL hacia /auth/confirm que lo verifica
  // server-side via supabase.auth.verifyOtp.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let magicLinkUrl: string | null = null;
  try {
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: w.correo,
    });
    if (linkErr) {
      logSafeError("submitSolicitud: generateLink falló", linkErr);
    } else {
      const hashedToken = linkData.properties?.hashed_token;
      if (hashedToken) {
        const next = encodeURIComponent(`/wizard/resultado?id=${informe.id}`);
        magicLinkUrl = `${siteUrl}/auth/confirm?token_hash=${hashedToken}&type=magiclink&next=${next}`;
      }
    }
  } catch (err) {
    logSafeError("submitSolicitud: generateLink exception", err);
  }

  // 5. Email best-effort. Liviano: solo anuncia el informe + magic link.
  // Los números viven en el portal para forzar el click (engagement).
  try {
    await enviarEmailInforme({
      to: w.correo,
      nombre: w.nombre,
      magicLinkUrl,
    });
  } catch (err) {
    logSafeError("submitSolicitud: error enviando email (no fatal)", err);
  }

  revalidatePath("/wizard/resultado");
  return { ok: true, informeId: informe.id, correo: w.correo };
}
