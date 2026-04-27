import { describe, expect, it } from "vitest";
import { cleanRut, computeDv, formatRut, isValidRut, splitRut } from "./chilean-rut";

describe("cleanRut", () => {
  it("strips dots, hyphens, spaces and uppercases K", () => {
    expect(cleanRut("12.345.678-k")).toBe("12345678K");
    expect(cleanRut(" 11.111.111-1 ")).toBe("111111111");
  });
});

describe("splitRut", () => {
  it("returns null for inputs shorter than 2 chars", () => {
    expect(splitRut("1")).toBeNull();
    expect(splitRut("")).toBeNull();
  });
  it("splits body and dv", () => {
    expect(splitRut("12345678-9")).toEqual({ body: "12345678", dv: "9" });
    expect(splitRut("11.111.111-K")).toEqual({ body: "11111111", dv: "K" });
  });
});

describe("computeDv", () => {
  it("matches known cases", () => {
    expect(computeDv("11111111")).toBe("1");
    expect(computeDv("12345678")).toBe("5");
    expect(computeDv("1")).toBe("9");
  });
});

describe("isValidRut", () => {
  it.each([
    ["11.111.111-1", true],
    ["12.345.678-5", true],
    ["12.345.678-9", false],
    ["", false],
    ["abc", false],
    ["1-9", false], // body too short
  ])("isValidRut(%s) === %s", (input, expected) => {
    expect(isValidRut(input)).toBe(expected);
  });
});

describe("formatRut", () => {
  it("inserts dots and hyphen", () => {
    expect(formatRut("123456785")).toBe("12.345.678-5");
    expect(formatRut("11111111K")).toBe("11.111.111-K");
  });
  it("handles short inputs gracefully", () => {
    expect(formatRut("")).toBe("");
    expect(formatRut("1")).toBe("1");
  });
});
