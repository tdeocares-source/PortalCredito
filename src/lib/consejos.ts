/**
 * Reglas para generar consejos de mejora de perfil crediticio a partir de las
 * respuestas del wizard. Genera entre 2 y 4 consejos por sesión.
 */

import type { TipoIngreso } from "./financial-calc";

export type AhorroPie =
  | "no_ahorros"
  | "hasta_2m"
  | "2_a_5m"
  | "5_a_10m"
  | "10_a_20m"
  | "20_a_30m";

export type MesGastosFuertes = "pido_credito" | "quedo_justo" | "tengo_ahorro" | "holgura";

export type ConsejosInput = {
  liquidoEfectivo: number;
  deudasMensuales: number;
  tipoIngreso: TipoIngreso;
  ahorroPie: AhorroPie;
  mesGastosFuertes: MesGastosFuertes;
};

type Consejo = {
  titulo: string;
  detalle: string;
};

export function generarConsejos(input: ConsejosInput): Consejo[] {
  const consejos: Consejo[] = [];
  const cargaFinanciera = input.liquidoEfectivo > 0
    ? input.deudasMensuales / input.liquidoEfectivo
    : 1;

  if (cargaFinanciera > 0.35) {
    consejos.push({
      titulo: "Reduce tu carga financiera mensual",
      detalle:
        "Tus deudas mensuales superan el 35% de tu ingreso efectivo. Consolidar deudas " +
        "o prepagar las de mayor tasa libera capacidad para una cuota hipotecaria.",
    });
  }

  if (input.ahorroPie === "no_ahorros" || input.ahorroPie === "hasta_2m") {
    consejos.push({
      titulo: "Construye tu ahorro para el pie",
      detalle:
        "Los bancos suelen pedir entre 10% y 20% del valor de la propiedad como pie. " +
        "Una cuenta de ahorro automática con aporte mensual fijo acelera este proceso.",
    });
  }

  if (input.mesGastosFuertes === "pido_credito" || input.mesGastosFuertes === "quedo_justo") {
    consejos.push({
      titulo: "Arma un fondo de emergencia",
      detalle:
        "Tener entre 3 y 6 meses de gastos en una cuenta líquida evita endeudarte ante " +
        "imprevistos y mejora cómo evalúan tu perfil los bancos.",
    });
  }

  if (input.tipoIngreso === "independiente" || input.tipoIngreso === "mixto") {
    consejos.push({
      titulo: "Mantén tus boletas y declaraciones al día",
      detalle:
        "Como trabajador independiente, los bancos consideran tu renta al 70%. " +
        "Boletas constantes los últimos 12 meses y operación renta vigente mejoran ese " +
        "porcentaje y tu monto aprobado.",
    });
  }

  if (consejos.length === 0) {
    consejos.push({
      titulo: "Mantén tu comportamiento de pago",
      detalle:
        "Tu perfil financiero está sólido. Conserva pagos puntuales y buen historial " +
        "para seguir mejorando las condiciones que te ofrezcan los bancos.",
    });
  }

  return consejos.slice(0, 4);
}
