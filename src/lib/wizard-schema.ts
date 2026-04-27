/**
 * Esquema completo del wizard, opciones de selección y mapa de campos por
 * paso (para la validación incremental). Una única fuente de verdad para tipos
 * y datos enumerados.
 */

import { z } from "zod";
import { isValidRut } from "./chilean-rut";
import { isValidPhone } from "./chilean-phone";

// ---------- Enums ----------
export const PROPOSITO = ["vivir", "invertir", "no_lo_tengo_claro"] as const;
export const CUANDO_INVERTIR = [
  "lo_antes_posible",
  "0_6_meses",
  "7_12_meses",
  "proximo_anio",
] as const;
export const TIPO_INGRESO = ["dependiente", "independiente", "mixto"] as const;
export const AHORRO_PIE = [
  "no_ahorros",
  "hasta_2m",
  "2_a_5m",
  "5_a_10m",
  "10_a_20m",
  "20_a_30m",
] as const;
export const MES_GASTOS_FUERTES = [
  "pido_credito",
  "quedo_justo",
  "tengo_ahorro",
  "holgura",
] as const;
export const PRIORIDAD_COMPRA = [
  "pagar_menos",
  "equilibrio",
  "buena_inversion",
  "maximizar",
] as const;
export const CANAL_CONTACTO = ["correo", "celular"] as const;

// ---------- Etiquetas mostradas al usuario ----------
type Option<T extends string> = { value: T; label: string };

export const PROPOSITO_OPTIONS: Option<(typeof PROPOSITO)[number]>[] = [
  { value: "vivir", label: "Vivir" },
  { value: "invertir", label: "Invertir" },
  { value: "no_lo_tengo_claro", label: "Aún no lo tengo claro" },
];

export const CUANDO_INVERTIR_OPTIONS: Option<(typeof CUANDO_INVERTIR)[number]>[] = [
  { value: "lo_antes_posible", label: "Lo antes posible" },
  { value: "0_6_meses", label: "Entre 0 y 6 meses" },
  { value: "7_12_meses", label: "Entre 7 y 12 meses" },
  { value: "proximo_anio", label: "El próximo año" },
];

export const TIPO_INGRESO_OPTIONS: Option<(typeof TIPO_INGRESO)[number]>[] = [
  { value: "dependiente", label: "Dependiente" },
  { value: "independiente", label: "Independiente" },
  { value: "mixto", label: "Mixto (dependiente + boletas)" },
];

export const AHORRO_PIE_OPTIONS: Option<(typeof AHORRO_PIE)[number]>[] = [
  { value: "no_ahorros", label: "No tengo ahorros" },
  { value: "hasta_2m", label: "Hasta $2.000.000" },
  { value: "2_a_5m", label: "Entre $2.000.000 y $5.000.000" },
  { value: "5_a_10m", label: "Entre $5.000.000 y $10.000.000" },
  { value: "10_a_20m", label: "Entre $10.000.000 y $20.000.000" },
  { value: "20_a_30m", label: "Entre $20.000.000 y $30.000.000" },
];

export const MES_GASTOS_FUERTES_OPTIONS: Option<(typeof MES_GASTOS_FUERTES)[number]>[] = [
  { value: "pido_credito", label: "Pido un crédito" },
  { value: "quedo_justo", label: "Quedo justo" },
  { value: "tengo_ahorro", label: "Tengo ahorros para cubrirlo" },
  { value: "holgura", label: "No me afecta, tengo holgura financiera" },
];

export const PRIORIDAD_COMPRA_OPTIONS: Option<(typeof PRIORIDAD_COMPRA)[number]>[] = [
  { value: "pagar_menos", label: "Pagar lo menos posible" },
  { value: "equilibrio", label: "Equilibrio entre ubicación y cuotas" },
  { value: "buena_inversion", label: "Buena inversión aunque sea más caro" },
  { value: "maximizar", label: "Maximizar la oportunidad" },
];

// ---------- Schema completo ----------
export const wizardSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  apellido: z.string().min(2, "Ingresa tu apellido"),
  proposito: z.enum(PROPOSITO, { message: "Selecciona una opción" }),
  cuandoInvertir: z.enum(CUANDO_INVERTIR, { message: "Selecciona una opción" }),
  comunas: z
    .array(z.string().min(1))
    .min(1, "Selecciona al menos una comuna")
    .max(10, "Máximo 10 comunas"),
  canalPreferido: z.enum(CANAL_CONTACTO, { message: "Selecciona cómo quieres recibirlo" }),
  correo: z.string().email("Email inválido"),
  celular: z.string().refine(isValidPhone, "Celular inválido (formato +56 9 XXXX XXXX)"),
  tipoIngreso: z.enum(TIPO_INGRESO, { message: "Selecciona una opción" }),
  liquidoMensual: z
    .number({ message: "Ingresa tu sueldo líquido" })
    .int()
    .positive("Debe ser mayor a 0")
    .max(99_999_999),
  deudasMensuales: z
    .number({ message: "Ingresa tus deudas mensuales" })
    .int()
    .nonnegative("No puede ser negativo")
    .max(99_999_999),
  ahorroPie: z.enum(AHORRO_PIE, { message: "Selecciona una opción" }),
  mesGastosFuertes: z.enum(MES_GASTOS_FUERTES, { message: "Selecciona una opción" }),
  prioridadCompra: z.enum(PRIORIDAD_COMPRA, { message: "Selecciona una opción" }),
  rut: z.string().refine(isValidRut, "RUT inválido"),
});

export type WizardData = z.infer<typeof wizardSchema>;

// ---------- Pasos ----------
export const STEP_KEYS = [
  "nombre",
  "proposito",
  "cuando",
  "comunas",
  "canal",
  "tipoIngreso",
  "liquido",
  "deudas",
  "ahorroPie",
  "mesGastosFuertes",
  "prioridadCompra",
  "final",
] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export const TOTAL_STEPS = STEP_KEYS.length;

/**
 * Campos de react-hook-form que cada paso debe validar al avanzar.
 * El paso `canal` y `final` validan condicionalmente según `canalPreferido`,
 * por lo que devolvemos los campos comunes y el step se encarga del resto.
 */
export const STEP_FIELDS: Record<StepKey, (keyof WizardData)[]> = {
  nombre: ["nombre", "apellido"],
  proposito: ["proposito"],
  cuando: ["cuandoInvertir"],
  comunas: ["comunas"],
  canal: ["canalPreferido"],
  tipoIngreso: ["tipoIngreso"],
  liquido: ["liquidoMensual"],
  deudas: ["deudasMensuales"],
  ahorroPie: ["ahorroPie"],
  mesGastosFuertes: ["mesGastosFuertes"],
  prioridadCompra: ["prioridadCompra"],
  final: ["rut"],
};

/** Valor inicial vacío para el form (todo undefined). */
export const EMPTY_WIZARD: Partial<WizardData> = {
  nombre: "",
  apellido: "",
  comunas: [],
  correo: "",
  celular: "",
  rut: "",
};
