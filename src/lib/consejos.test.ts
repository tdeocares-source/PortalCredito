import { describe, expect, it } from "vitest";
import { generarConsejos, type ConsejosInput } from "./consejos";

const BASE: ConsejosInput = {
  liquidoEfectivo: 1_500_000,
  deudasMensuales: 200_000, // ratio ~13%
  tipoIngreso: "dependiente",
  ahorroPie: "5_a_10m",
  mesGastosFuertes: "tengo_ahorro",
};

function tieneTip(
  tips: ReturnType<typeof generarConsejos>,
  fragmento: string,
): boolean {
  return tips.some(
    (t) =>
      t.titulo.toLowerCase().includes(fragmento.toLowerCase()) ||
      t.detalle.toLowerCase().includes(fragmento.toLowerCase()),
  );
}

describe("generarConsejos", () => {
  describe("carga financiera (deuda / ingreso)", () => {
    it("agrega tip cuando ratio > 35%", () => {
      const tips = generarConsejos({
        ...BASE,
        liquidoEfectivo: 1_000_000,
        deudasMensuales: 400_000, // 40%
      });
      expect(tieneTip(tips, "carga financiera")).toBe(true);
    });

    it("no agrega tip cuando ratio = 35% (límite exclusivo)", () => {
      const tips = generarConsejos({
        ...BASE,
        liquidoEfectivo: 1_000_000,
        deudasMensuales: 350_000,
      });
      expect(tieneTip(tips, "carga financiera")).toBe(false);
    });

    it("no agrega tip cuando ratio < 35%", () => {
      const tips = generarConsejos(BASE);
      expect(tieneTip(tips, "carga financiera")).toBe(false);
    });

    it("trata liquidoEfectivo = 0 como sobrecargado", () => {
      const tips = generarConsejos({
        ...BASE,
        liquidoEfectivo: 0,
        deudasMensuales: 100_000,
      });
      expect(tieneTip(tips, "carga financiera")).toBe(true);
    });
  });

  describe("ahorro pie", () => {
    it("agrega tip cuando no_ahorros", () => {
      const tips = generarConsejos({ ...BASE, ahorroPie: "no_ahorros" });
      expect(tieneTip(tips, "ahorro para el pie")).toBe(true);
    });

    it("agrega tip cuando hasta_2m", () => {
      const tips = generarConsejos({ ...BASE, ahorroPie: "hasta_2m" });
      expect(tieneTip(tips, "ahorro para el pie")).toBe(true);
    });

    it("no agrega tip cuando 5_a_10m", () => {
      const tips = generarConsejos({ ...BASE, ahorroPie: "5_a_10m" });
      expect(tieneTip(tips, "ahorro para el pie")).toBe(false);
    });

    it("no agrega tip cuando 20_a_30m", () => {
      const tips = generarConsejos({ ...BASE, ahorroPie: "20_a_30m" });
      expect(tieneTip(tips, "ahorro para el pie")).toBe(false);
    });
  });

  describe("mes con gastos fuertes / fondo de emergencia", () => {
    it("agrega tip cuando pido_credito", () => {
      const tips = generarConsejos({ ...BASE, mesGastosFuertes: "pido_credito" });
      expect(tieneTip(tips, "fondo de emergencia")).toBe(true);
    });

    it("agrega tip cuando quedo_justo", () => {
      const tips = generarConsejos({ ...BASE, mesGastosFuertes: "quedo_justo" });
      expect(tieneTip(tips, "fondo de emergencia")).toBe(true);
    });

    it("no agrega tip cuando tengo_ahorro", () => {
      const tips = generarConsejos({ ...BASE, mesGastosFuertes: "tengo_ahorro" });
      expect(tieneTip(tips, "fondo de emergencia")).toBe(false);
    });

    it("no agrega tip cuando holgura", () => {
      const tips = generarConsejos({ ...BASE, mesGastosFuertes: "holgura" });
      expect(tieneTip(tips, "fondo de emergencia")).toBe(false);
    });
  });

  describe("tipo de ingreso", () => {
    it("agrega tip de boletas para independiente", () => {
      const tips = generarConsejos({ ...BASE, tipoIngreso: "independiente" });
      expect(tieneTip(tips, "boletas")).toBe(true);
    });

    it("agrega tip de boletas para mixto", () => {
      const tips = generarConsejos({ ...BASE, tipoIngreso: "mixto" });
      expect(tieneTip(tips, "boletas")).toBe(true);
    });

    it("no agrega tip de boletas para dependiente", () => {
      const tips = generarConsejos({ ...BASE, tipoIngreso: "dependiente" });
      expect(tieneTip(tips, "boletas")).toBe(false);
    });
  });

  describe("default cuando perfil sólido", () => {
    it("retorna tip genérico cuando ningún disparador aplica", () => {
      const tips = generarConsejos(BASE);
      expect(tips).toHaveLength(1);
      expect(tieneTip(tips, "comportamiento de pago")).toBe(true);
    });
  });

  describe("cap de cantidad", () => {
    it("trunca a 4 tips máximo cuando todos los disparadores aplican", () => {
      const tips = generarConsejos({
        liquidoEfectivo: 100_000,
        deudasMensuales: 80_000, // ratio 80%
        tipoIngreso: "independiente",
        ahorroPie: "no_ahorros",
        mesGastosFuertes: "pido_credito",
      });
      expect(tips.length).toBeLessThanOrEqual(4);
      expect(tips.length).toBeGreaterThanOrEqual(2);
    });

    it("siempre devuelve al menos 1 tip", () => {
      const tips = generarConsejos(BASE);
      expect(tips.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("forma del output", () => {
    it("cada tip tiene titulo y detalle no vacíos", () => {
      const tips = generarConsejos({
        liquidoEfectivo: 100_000,
        deudasMensuales: 80_000,
        tipoIngreso: "independiente",
        ahorroPie: "no_ahorros",
        mesGastosFuertes: "pido_credito",
      });
      for (const tip of tips) {
        expect(tip.titulo).toBeTruthy();
        expect(tip.detalle).toBeTruthy();
        expect(tip.titulo.length).toBeGreaterThan(0);
        expect(tip.detalle.length).toBeGreaterThan(0);
      }
    });
  });
});
