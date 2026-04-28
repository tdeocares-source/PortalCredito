import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logSafeError } from "./log";

describe("logSafeError", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("loguea solo prefix cuando err es null", () => {
    logSafeError("test:", null);
    expect(consoleSpy).toHaveBeenCalledWith("test:");
  });

  it("loguea solo prefix cuando err es undefined", () => {
    logSafeError("test:", undefined);
    expect(consoleSpy).toHaveBeenCalledWith("test:");
  });

  it("extrae name y message de Error", () => {
    const err = new Error("boom");
    logSafeError("test:", err);
    expect(consoleSpy).toHaveBeenCalledWith("test:", {
      name: "Error",
      message: "boom",
    });
  });

  it("extrae solo code y message de objetos POJO", () => {
    const postgrestErr = {
      code: "23505",
      message: "duplicate key value",
      details: "Key (correo)=(victim@gmail.com) already exists.", // sensible
      hint: "Try a different correo",
    };
    logSafeError("test:", postgrestErr);
    expect(consoleSpy).toHaveBeenCalledWith("test:", {
      code: "23505",
      message: "duplicate key value",
    });
    // El details (con email víctima) NO se loggea
    const loggedSecondArg = consoleSpy.mock.calls[0]?.[1];
    expect(loggedSecondArg).not.toHaveProperty("details");
    expect(loggedSecondArg).not.toHaveProperty("hint");
  });

  it("acepta objetos sin code/message (rellena con null)", () => {
    logSafeError("test:", { foo: "bar" });
    expect(consoleSpy).toHaveBeenCalledWith("test:", {
      code: null,
      message: null,
    });
  });

  it("convierte primitivos a string", () => {
    logSafeError("test:", 42);
    expect(consoleSpy).toHaveBeenCalledWith("test:", "42");
  });
});
