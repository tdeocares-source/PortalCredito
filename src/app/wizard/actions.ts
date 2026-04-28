"use server";

import { revalidatePath } from "next/cache";
import { callCrediBid } from "@/lib/credibid";
import { calcularResumen } from "@/lib/financial-calc";
import { generarConsejos } from "@/lib/consejos";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { wizardSchema, type WizardData } from "@/lib/wizard-schema";
import { enviarEmailInforme } from "@/lib/email-informe";
import type { Json } from "@/lib/database.types";

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
    console.error("submitSolicitud: error insertando solicitud", solErr);
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
    console.error("submitSolicitud: error insertando informe", infErr);
    return { ok: false, error: "No pudimos generar tu informe. Intentá de nuevo." };
  }

  await admin
    .from("solicitudes")
    .update({ status: "procesada" } as never)
    .eq("id", solicitud.id);

  // 4. Generar magic link via Admin API (no manda email; lo mandamos
  // nosotros con el contenido custom).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const resultadoUrl = `${siteUrl}/wizard/resultado?id=${informe.id}`;

  let magicLinkUrl: string | null = null;
  try {
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: w.correo,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(`/wizard/resultado?id=${informe.id}`)}`,
      },
    });
    if (linkErr) {
      console.error("submitSolicitud: generateLink falló", linkErr);
    } else {
      magicLinkUrl = linkData.properties?.action_link ?? null;
    }
  } catch (err) {
    console.error("submitSolicitud: generateLink exception", err);
  }

  // 5. Email best-effort. Si falló generateLink, mandamos igual (sin botón
  // de magic link, solo el resumen). El cliente puede ir a /login con su
  // correo para recibir un nuevo link.
  try {
    await enviarEmailInforme({
      to: w.correo,
      nombre: w.nombre,
      ufAprobadas: resumen.ufAprobadas,
      cuotaMaxima: resumen.cuotaMaxima,
      liquidoEfectivo: resumen.liquidoEfectivo,
      tips,
      resultadoUrl,
      magicLinkUrl,
    });
  } catch (err) {
    console.error("submitSolicitud: error enviando email (no fatal)", err);
  }

  revalidatePath("/wizard/resultado");
  return { ok: true, informeId: informe.id, correo: w.correo };
}
