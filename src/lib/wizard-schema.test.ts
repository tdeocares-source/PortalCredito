import { describe, expect, it } from "vitest";
import {
  AHORRO_PIE,
  CANAL_CONTACTO,
  CUANDO_INVERTIR,
  EMPTY_WIZARD,
  MES_GASTOS_FUERTES,
  PRIORIDAD_COMPRA,
  PROPOSITO,
  STEP_FIELDS,
  STEP_KEYS,
  TIPO_INGRESO,
  TOTAL_STEPS,
  wizardSchema,
  type WizardData,
} from "./wizard-schema";

const VALID: WizardData = {
  nombre: "Tomás",
  apellido: "Deocares",
  proposito: "vivir",
  cuandoInvertir: "lo_antes_posible",
  comunas: ["santiago"],
  canalPreferido: "correo",
  correo: "tomas@example.cl",
  celular: "+56912345678",
  tipoIngreso: "dependiente",
  liquidoMensual: 1_500_000,
  deudasMensuales: 200_000,
  ahorroPie: "5_a_10m",
  mesGastosFuertes: "tengo_ahorro",
  prioridadCompra: "equilibrio",
  rut: "11.111.111-1",
};

describe("wizardSchema", () => {
  describe("happy path", () => {
    it("acepta una solicitud completa válida", () => {
      const r = wizardSchema.safeParse(VALID);
      expect(r.success).toBe(true);
    });
  });

  describe("nombre / apellido", () => {
    it("rechaza nombre con menos de 2 caracteres", () => {
      const r = wizardSchema.safeParse({ ...VALID, nombre: "A" });
      expect(r.success).toBe(false);
    });

    it("rechaza apellido con menos de 2 caracteres", () => {
      const r = wizardSchema.safeParse({ ...VALID, apellido: "" });
      expect(r.success).toBe(false);
    });
  });

  describe("correo", () => {
    it("rechaza email mal formado", () => {
      const r = wizardSchema.safeParse({ ...VALID, correo: "no-es-email" });
      expect(r.success).toBe(false);
    });

    it("acepta emails válidos", () => {
      for (const correo of [
        "a@b.cl",
        "tomas.deocares@capitalinteligente.cl",
        "user+tag@gmail.com",
      ]) {
        const r = wizardSchema.safeParse({ ...VALID, correo });
        expect(r.success).toBe(true);
      }
    });
  });

  describe("celular", () => {
    it("rechaza celular sin formato chileno", () => {
      const r = wizardSchema.safeParse({ ...VALID, celular: "123" });
      expect(r.success).toBe(false);
    });

    it("acepta +56 9 con 8 dígitos (con o sin espacios)", () => {
      for (const celular of ["+56912345678", "+56 9 1234 5678"]) {
        const r = wizardSchema.safeParse({ ...VALID, celular });
        expect(r.success).toBe(true);
      }
    });
  });

  describe("rut", () => {
    it("rechaza RUT mal formado", () => {
      const r = wizardSchema.safeParse({ ...VALID, rut: "12345" });
      expect(r.success).toBe(false);
    });

    it("rechaza RUT con dígito verificador inválido", () => {
      const r = wizardSchema.safeParse({ ...VALID, rut: "11.111.111-2" });
      expect(r.success).toBe(false);
    });
  });

  describe("liquidoMensual", () => {
    it("rechaza cero", () => {
      const r = wizardSchema.safeParse({ ...VALID, liquidoMensual: 0 });
      expect(r.success).toBe(false);
    });

    it("rechaza negativo", () => {
      const r = wizardSchema.safeParse({ ...VALID, liquidoMensual: -100 });
      expect(r.success).toBe(false);
    });

    it("rechaza valores mayores a 99_999_999", () => {
      const r = wizardSchema.safeParse({ ...VALID, liquidoMensual: 100_000_000 });
      expect(r.success).toBe(false);
    });

    it("rechaza decimales (debe ser int)", () => {
      const r = wizardSchema.safeParse({ ...VALID, liquidoMensual: 1500.5 });
      expect(r.success).toBe(false);
    });
  });

  describe("deudasMensuales", () => {
    it("acepta cero (cliente sin deudas)", () => {
      const r = wizardSchema.safeParse({ ...VALID, deudasMensuales: 0 });
      expect(r.success).toBe(true);
    });

    it("rechaza negativo", () => {
      const r = wizardSchema.safeParse({ ...VALID, deudasMensuales: -1 });
      expect(r.success).toBe(false);
    });

    it("rechaza valores mayores a 99_999_999", () => {
      const r = wizardSchema.safeParse({
        ...VALID,
        deudasMensuales: 100_000_000,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("comunas", () => {
    it("rechaza array vacío", () => {
      const r = wizardSchema.safeParse({ ...VALID, comunas: [] });
      expect(r.success).toBe(false);
    });

    it("rechaza string vacío dentro del array", () => {
      const r = wizardSchema.safeParse({ ...VALID, comunas: [""] });
      expect(r.success).toBe(false);
    });

    it("acepta exactamente 10 comunas", () => {
      const comunas = Array.from({ length: 10 }, (_, i) => `comuna-${i}`);
      const r = wizardSchema.safeParse({ ...VALID, comunas });
      expect(r.success).toBe(true);
    });

    it("rechaza más de 10 comunas", () => {
      const comunas = Array.from({ length: 11 }, (_, i) => `comuna-${i}`);
      const r = wizardSchema.safeParse({ ...VALID, comunas });
      expect(r.success).toBe(false);
    });
  });

  describe("enums", () => {
    const cases: Array<{
      field: keyof WizardData;
      validValues: readonly string[];
    }> = [
      { field: "proposito", validValues: PROPOSITO },
      { field: "cuandoInvertir", validValues: CUANDO_INVERTIR },
      { field: "tipoIngreso", validValues: TIPO_INGRESO },
      { field: "ahorroPie", validValues: AHORRO_PIE },
      { field: "mesGastosFuertes", validValues: MES_GASTOS_FUERTES },
      { field: "prioridadCompra", validValues: PRIORIDAD_COMPRA },
      { field: "canalPreferido", validValues: CANAL_CONTACTO },
    ];

    for (const { field, validValues } of cases) {
      describe(field, () => {
        it("acepta todos los valores válidos del enum", () => {
          for (const value of validValues) {
            const r = wizardSchema.safeParse({ ...VALID, [field]: value });
            expect(r.success, `${field}=${value}`).toBe(true);
          }
        });

        it("rechaza valores fuera del enum", () => {
          const r = wizardSchema.safeParse({ ...VALID, [field]: "valor_inventado" });
          expect(r.success).toBe(false);
        });
      });
    }
  });
});

describe("STEP_KEYS y STEP_FIELDS", () => {
  it("STEP_KEYS tiene exactamente TOTAL_STEPS entradas", () => {
    expect(STEP_KEYS).toHaveLength(TOTAL_STEPS);
  });

  it("STEP_FIELDS tiene una entrada por cada step en STEP_KEYS", () => {
    for (const key of STEP_KEYS) {
      expect(STEP_FIELDS).toHaveProperty(key);
      expect(Array.isArray(STEP_FIELDS[key])).toBe(true);
    }
  });

  it("todos los campos referenciados en STEP_FIELDS existen en WizardData", () => {
    const validData = wizardSchema.parse(VALID);
    for (const fields of Object.values(STEP_FIELDS)) {
      for (const field of fields) {
        expect(validData).toHaveProperty(field);
      }
    }
  });
});

describe("EMPTY_WIZARD", () => {
  it("tiene los campos de texto inicializados como string vacío", () => {
    expect(EMPTY_WIZARD.nombre).toBe("");
    expect(EMPTY_WIZARD.apellido).toBe("");
    expect(EMPTY_WIZARD.correo).toBe("");
    expect(EMPTY_WIZARD.celular).toBe("");
    expect(EMPTY_WIZARD.rut).toBe("");
  });

  it("tiene comunas como array vacío", () => {
    expect(EMPTY_WIZARD.comunas).toEqual([]);
  });

  it("no pasa el schema completo (data incompleta esperada)", () => {
    const r = wizardSchema.safeParse(EMPTY_WIZARD);
    expect(r.success).toBe(false);
  });
});
