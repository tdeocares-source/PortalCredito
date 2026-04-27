import { describe, expect, it } from "vitest";
import { cleanPhone, formatPhone, isValidPhone } from "./chilean-phone";

describe("cleanPhone", () => {
  it("normalizes common Chilean mobile formats to 569XXXXXXXX", () => {
    expect(cleanPhone("+56 9 1234 5678")).toBe("56912345678");
    expect(cleanPhone("912345678")).toBe("56912345678");
    expect(cleanPhone("12345678")).toBe("56912345678");
    expect(cleanPhone("56912345678")).toBe("56912345678");
  });
});

describe("isValidPhone", () => {
  it.each([
    ["+56 9 1234 5678", true],
    ["56912345678", true],
    ["912345678", true],
    ["12345678", true],
    ["", false],
    ["123", false],
    ["+56 2 1234 5678", false], // landline
    ["abcd1234", false],
  ])("isValidPhone(%s) === %s", (input, expected) => {
    expect(isValidPhone(input)).toBe(expected);
  });
});

describe("formatPhone", () => {
  it("formats valid input as +56 9 XXXX XXXX", () => {
    expect(formatPhone("56912345678")).toBe("+56 9 1234 5678");
    expect(formatPhone("912345678")).toBe("+56 9 1234 5678");
  });
  it("returns input unchanged when invalid", () => {
    expect(formatPhone("abc")).toBe("abc");
  });
});
