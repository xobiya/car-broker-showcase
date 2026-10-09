import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../../backend/auth";
import { registerSchema, userUpdateSchema, vehicleUpdateSchema } from "../../../backend/validators/index";

describe("Security & Authentication Hardening", () => {
  it("should securely hash and verify passwords using async bcrypt", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash signature

    const isMatch = await comparePassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword("WrongPassword!", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should forbid registration with 'admin' role to prevent privilege escalation", () => {
    const adminAttempt = {
      name: "Attacker",
      email: "attacker@test.com",
      password: "password123",
      role: "admin",
    };

    const result = registerSchema.safeParse(adminAttempt);
    expect(result.success).toBe(false);
  });

  it("should allow registration with buyer, broker, or seller", () => {
    for (const role of ["buyer", "broker", "seller"] as const) {
      const validPayload = {
        name: "Legit User",
        email: `user_${role}@test.com`,
        password: "password123",
        role,
      };
      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    }
  });

  it("should disallow injecting role or verified into userUpdateSchema", () => {
    const exploitPayload = {
      name: "Normal User",
      role: "admin",
      verified: true,
    };

    const parsed = userUpdateSchema.safeParse(exploitPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      // Zod schema strip/only includes defined keys
      expect((parsed.data as any).role).toBeUndefined();
      expect((parsed.data as any).verified).toBeUndefined();
      expect(parsed.data.name).toBe("Normal User");
    }
  });

  it("should disallow injecting status into vehicleUpdateSchema", () => {
    const exploitPayload = {
      price: 1500000,
      status: "approved",
      rejection_reason: null,
    };

    const parsed = vehicleUpdateSchema.safeParse(exploitPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data as any).status).toBeUndefined();
      expect((parsed.data as any).rejection_reason).toBeUndefined();
      expect(parsed.data.price).toBe(1500000);
    }
  });
});
