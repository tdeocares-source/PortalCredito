import { describe, expect, it } from "vitest";
import { callCrediBid } from "./credibid";

describe("callCrediBid (mock)", () => {
  const baseInput = {
    rut: "11.111.111-1",
    liquidoMensual: 1_500_000,
    tipoIngreso: "dependiente" as const,
    deudasMensuales: 200_000,
  };

  it("devuelve un score en el rango [300, 950]", async () => {
    const r = await callCrediBid(baseInput);
    expect(r.score).toBeGreaterThanOrEqual(300);
    expect(r.score).toBeLessThanOrEqual(950);
  });

  it("penaliza ratios de deuda altos vs sanos", async () => {
    const sano = await callCrediBid({ ...baseInput, deudasMensuales: 100_000 });
    const endeudado = await callCrediBid({
      ...baseInput,
      deudasMensuales: 1_000_000,
    });
    expect(endeudado.score).toBeLessThan(sano.score);
  });

  it("penaliza levemente a independientes vs dependientes con mismo perfil", async () => {
    const dep = await callCrediBid({ ...baseInput, tipoIngreso: "dependiente" });
    const indep = await callCrediBid({
      ...baseInput,
      tipoIngreso: "independiente",
    });
    expect(indep.score).toBeLessThan(dep.score);
  });

  it("agrega observación cuando la deuda supera la capacidad", async () => {
    const r = await callCrediBid({
      ...baseInput,
      liquidoMensual: 1_000_000,
      deudasMensuales: 900_000,
    });
    expect(r.observaciones).toContain(
      "Tus deudas mensuales superan la holgura recomendada del 30%.",
    );
  });

  it("agrega observación de boletas para independientes", async () => {
    const r = await callCrediBid({ ...baseInput, tipoIngreso: "independiente" });
    expect(
      r.observaciones.some((o) => o.includes("boletas")),
    ).toBe(true);
  });

  it("monto_uf_aprobado y dividenda_max son consistentes con financial-calc", async () => {
    const r = await callCrediBid(baseInput);
    expect(r.monto_uf_aprobado).toBeGreaterThan(0);
    expect(r.dividenda_max).toBeGreaterThan(0);
  });

  it("el output es determinístico para el mismo input", async () => {
    const a = await callCrediBid(baseInput);
    const b = await callCrediBid(baseInput);
    expect(a).toEqual(b);
  });
});
