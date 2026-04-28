"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { callCrediBid } from "@/lib/credibid";
import { calcularResumen } from "@/lib/financial-calc";
import { generarConsejos } from "@/lib/consejos";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { wizardSchema, type WizardData } from "@/lib/wizard-schema";
import { enviarEmailInforme } from "@/lib/email-informe";
import type { Json } from "@/lib/database.types";

export type SubmitSolicitudResult =
  | { ok: true; informeId: string }
  | { ok: false; error: string };

/**
 * Persiste la solicitud en BD, llama al mock CrediBid, calcula el resumen
 * local + tips, inserta el informe y dispara el email al cliente. Devuelve
 * el id del informe para que el cliente navegue a /wizard/resultado?id=...
 *
 * El email es best-effort: si Resend falla, se loggea pero el flow no rompe
 * (el informe ya quedó persistido y el cliente puede verlo igualmente).
 */
export async function submitSolicitud(
  data: WizardData,
): Promise<SubmitSolicitudResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Tu sesión expiró. Volvé a iniciar." };
  }

  const parsed = wizardSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Los datos del formulario son inválidos." };
  }
  const w = parsed.data;
  const admin = getSupabaseAdmin();

  // 1. Persistir solicitud (estado enviada).
  const solicitudInsert = {
    user_id: user.id,
    status: "enviada",
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

  // 2. Llamar mock CrediBid + cálculo local + tips.
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

  // 3. Persistir informe. Tips se serializan como JSON dentro de text[]
  // (compromiso para no cambiar el schema; cada elemento es un JSON.stringify
  // del Tip). Al leer, se hace JSON.parse de cada entrada.
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

  // 4. Avanzar status de la solicitud.
  await admin
    .from("solicitudes")
    .update({ status: "procesada" } as never)
    .eq("id", solicitud.id);

  // 5. Email best-effort.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const resultadoUrl = `${siteUrl}/wizard/resultado?id=${informe.id}`;
  try {
    await enviarEmailInforme({
      to: w.correo,
      nombre: w.nombre,
      ufAprobadas: resumen.ufAprobadas,
      cuotaMaxima: resumen.cuotaMaxima,
      liquidoEfectivo: resumen.liquidoEfectivo,
      tips,
      resultadoUrl,
    });
  } catch (err) {
    console.error("submitSolicitud: error enviando email (no fatal)", err);
  }

  revalidatePath("/wizard/resultado");
  return { ok: true, informeId: informe.id };
}
