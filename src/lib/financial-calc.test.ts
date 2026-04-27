import { describe, expect, it } from "vitest";
import {
  calcularResumen,
  cuotaMaxima,
  liquidoEfectivo,
  ufAprobadas,
} from "./financial-calc";

describe("liquidoEfectivo", () => {
  it("returns 100% for dependiente", () => {
    expect(liquidoEfectivo(1_000_000, "dependiente")).toBe(1_000_000);
  });
  it("returns 70% for independiente", () => {
    expect(liquidoEfectivo(1_000_000, "independiente")).toBe(700_000);
  });
  it("returns 70% for mixto", () => {
    expect(liquidoEfectivo(1_000_000, "mixto")).toBe(700_000);
  });
});

describe("cuotaMaxima", () => {
  it("computes 30% of efectivo minus deudas", () => {
    expect(cuotaMaxima(1_000_000, 100_000)).toBe(200_000);
  });
  it("never goes below zero", () => {
    expect(cuotaMaxima(500_000, 1_000_000)).toBe(0);
  });
});

describe("ufAprobadas", () => {
  it("returns 0 when cuota is 0 or negative", () => {
    expect(ufAprobadas(0)).toBe(0);
    expect(ufAprobadas(-100)).toBe(0);
  });
  it("returns a positive UF amount rounded to nearest 10", () => {
    const uf = ufAprobadas(500_000);
    expect(uf).toBeGreaterThan(0);
    expect(uf % 10).toBe(0);
  });
});

describe("calcularResumen", () => {
  it("integrates the three calculations for a dependiente", () => {
    const r = calcularResumen({
      liquidoBruto: 2_000_000,
      tipoIngreso: "dependiente",
      deudasMensuales: 200_000,
    });
    expect(r.liquidoEfectivo).toBe(2_000_000);
    expect(r.cuotaMaxima).toBe(400_000);
    expect(r.ufAprobadas).toBeGreaterThan(0);
  });

  it("applies the 70% factor for independiente", () => {
    const r = calcularResumen({
      liquidoBruto: 2_000_000,
      tipoIngreso: "independiente",
      deudasMensuales: 0,
    });
    expect(r.liquidoEfectivo).toBe(1_400_000);
    expect(r.cuotaMaxima).toBe(420_000);
  });
});
