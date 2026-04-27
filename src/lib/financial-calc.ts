/**
 * Cálculo del resumen financiero artificial.
 *
 * Provisorio mientras no esté la integración con CrediBid. La fórmula es
 * conservadora pero plausible para que los números mostrados al cliente sean
 * coherentes durante testing.
 */

export type TipoIngreso = "dependiente" | "independiente" | "mixto";

export const CALC_CONSTANTS = {
  /** Las boletas (independiente y mixto) se contemplan al 70%. */
  FACTOR_INDEPENDIENTE: 0.7,
  /** Carga máxima recomendada: 30% del líquido efectivo. */
  RATIO_CUOTA_INGRESO: 0.3,
  /**
   * Factor de conversión cuota mensual → préstamo total (CLP).
   * Aproxima un crédito a 25 años con tasa ~4.5% real.
   * loan_CLP ≈ cuota_mensual × 165
   */
  FACTOR_PRESTAMO_CUOTA: 165,
  /** Valor referencial UF para el placeholder. */
  UF_VALUE_CLP: 39000,
} as const;

export function liquidoEfectivo(
  liquidoBruto: number,
  tipoIngreso: TipoIngreso,
): number {
  const factor = tipoIngreso === "dependiente" ? 1 : CALC_CONSTANTS.FACTOR_INDEPENDIENTE;
  return Math.round(liquidoBruto * factor);
}

export function cuotaMaxima(liquidoEfectivoCLP: number, deudasMensuales: number): number {
  const cap = liquidoEfectivoCLP * CALC_CONSTANTS.RATIO_CUOTA_INGRESO;
  return Math.max(0, Math.round(cap - deudasMensuales));
}

export function ufAprobadas(cuotaMaxCLP: number): number {
  if (cuotaMaxCLP <= 0) return 0;
  const prestamoCLP = cuotaMaxCLP * CALC_CONSTANTS.FACTOR_PRESTAMO_CUOTA;
  const uf = prestamoCLP / CALC_CONSTANTS.UF_VALUE_CLP;
  return Math.round(uf / 10) * 10;
}

export type ResumenInput = {
  liquidoBruto: number;
  tipoIngreso: TipoIngreso;
  deudasMensuales: number;
};

export type Resumen = {
  liquidoEfectivo: number;
  cuotaMaxima: number;
  ufAprobadas: number;
};

export function calcularResumen(input: ResumenInput): Resumen {
  const efectivo = liquidoEfectivo(input.liquidoBruto, input.tipoIngreso);
  const cuota = cuotaMaxima(efectivo, input.deudasMensuales);
  return {
    liquidoEfectivo: efectivo,
    cuotaMaxima: cuota,
    ufAprobadas: ufAprobadas(cuota),
  };
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUF(uf: number): string {
  return `${new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(uf)} UF`;
}
