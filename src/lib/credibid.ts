/**
 * Mock provisorio del API CrediBid.
 *
 * Cuando integremos CrediBid real, reemplazar la implementación de
 * `callCrediBid` manteniendo el mismo contrato (CrediBidInput → CrediBidResponse).
 * El resto del código (server action, BD, email) no debería cambiar.
 *
 * Decisión actual: no tunear el output del mock. Hasta que llegue el API real,
 * el monto_uf_aprobado y la dividenda_max coinciden con el cálculo local.
 */

import { calcularResumen, type TipoIngreso } from "./financial-calc";

export type CrediBidInput = {
  rut: string;
  liquidoMensual: number;
  tipoIngreso: TipoIngreso;
  deudasMensuales: number;
};

export type CrediBidResponse = {
  score: number;
  monto_uf_aprobado: number;
  dividenda_max: number;
  observaciones: string[];
};

export async function callCrediBid(
  input: CrediBidInput,
): Promise<CrediBidResponse> {
  // Latencia mínima para emular el HTTP a CrediBid.
  await new Promise((r) => setTimeout(r, 80));

  const resumen = calcularResumen({
    liquidoBruto: input.liquidoMensual,
    tipoIngreso: input.tipoIngreso,
    deudasMensuales: input.deudasMensuales,
  });

  return {
    score: computeMockScore(input, resumen.liquidoEfectivo),
    monto_uf_aprobado: resumen.ufAprobadas,
    dividenda_max: resumen.cuotaMaxima,
    observaciones: buildObservaciones(input, resumen),
  };
}

function computeMockScore(
  input: CrediBidInput,
  liquidoEfectivo: number,
): number {
  const ratioDeuda =
    input.liquidoMensual > 0
      ? input.deudasMensuales / input.liquidoMensual
      : 1;

  const base = 600;
  const liquidoBoost = Math.min(150, Math.round(liquidoEfectivo / 30000));
  const deudaPenalty = Math.min(200, Math.round(ratioDeuda * 400));
  const indepPenalty = input.tipoIngreso === "independiente" ? 30 : 0;

  return Math.max(
    300,
    Math.min(950, base + liquidoBoost - deudaPenalty - indepPenalty),
  );
}

function buildObservaciones(
  input: CrediBidInput,
  resumen: { cuotaMaxima: number; liquidoEfectivo: number },
): string[] {
  const obs: string[] = [];
  if (resumen.cuotaMaxima === 0) {
    obs.push("Tus deudas mensuales superan la holgura recomendada del 30%.");
  }
  if (input.tipoIngreso === "independiente") {
    obs.push(
      "Los bancos pueden pedir 12 meses de boletas para validar el ingreso.",
    );
  }
  return obs;
}
