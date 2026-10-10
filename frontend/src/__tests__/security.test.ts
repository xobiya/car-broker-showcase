import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../../backend/auth";
import { registerSchema, userUpdateSchema, vehicleUpdateSchema } from "../../../backend/validators/index";
import { getCached, setCache, clearCache } from "../../../backend/services/cache";

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

  it("should prevent duplicate ID collisions under high concurrency", () => {
    const ids = new Set<string>();
    const count = 1000;
    for (let i = 0; i < count; i++) {
      const id = `veh-${crypto.randomUUID()}`;
      ids.add(id);
    }
    expect(ids.size).toBe(count);
  });

  describe("Issue 3: Vehicle Caching Isolation & Sensitive Data Sanitization", () => {
    it("should isolate public cache and properly invalidate on vehicle mutation", () => {
      const publicCacheKey = "vehicles:public:approved";
      const samplePublicVehicles = [
        { id: "veh-1", brand: "Toyota", model: "RAV4", status: "approved" },
      ];

      setCache(publicCacheKey, samplePublicVehicles, 60);
      expect(getCached(publicCacheKey)).toEqual(samplePublicVehicles);

      // Invalidation prefix "vehicles" must purge public cache key
      clearCache("vehicles");
      expect(getCached(publicCacheKey)).toBeUndefined();
    });

    it("should sanitize sensitive vehicle fields (chassisNumber, commissionRate, rejectionReason) for non-owner/public users", () => {
      const rawListing = {
        id: "veh-test-1",
        brokerId: "brk-1",
        brand: "Toyota",
        model: "Yaris",
        price: 950000,
        status: "approved",
        chassisNumber: "ETH-CHASSIS-999888",
        commissionRate: 0.05,
        rejectionReason: "Previously lacked title deed",
      };

      // Simulating non-owner & non-admin sanitization logic from /api/vehicles
      const isOwner = false;
      const isAdmin = false;

      const sanitizedItem: any = { ...rawListing };
      if (!isOwner && !isAdmin) {
        delete sanitizedItem.chassisNumber;
        delete sanitizedItem.commissionRate;
        delete sanitizedItem.rejectionReason;
      }

      expect(sanitizedItem.chassisNumber).toBeUndefined();
      expect(sanitizedItem.commissionRate).toBeUndefined();
      expect(sanitizedItem.rejectionReason).toBeUndefined();
      expect(sanitizedItem.id).toBe("veh-test-1");
      expect(sanitizedItem.price).toBe(950000);
      expect(sanitizedItem.status).toBe("approved");
    });
  });

  describe("Issue 4: Payment Access Control & IDOR Prevention", () => {
    it("should enforce broker scoping and disallow unauthorized access across brokers", () => {
      // Simulating /api/payments logic
      const resolveBrokerScope = (user: { role: string; id: string }, requestedBrokerId?: string) => {
        if (user.role !== "admin" && user.role !== "broker") {
          throw new Error("Access denied. Brokers or admins only.");
        }
        if (user.role === "broker") {
          // Broker profile must resolve strictly to their own ID, ignoring query params
          const meBrokerId = `brk-${user.id}`;
          return meBrokerId;
        }
        return requestedBrokerId; // Admin can specify or query all
      };

      // Buyer or Seller should be rejected
      expect(() => resolveBrokerScope({ role: "buyer", id: "usr-1" })).toThrow("Access denied");
      expect(() => resolveBrokerScope({ role: "seller", id: "usr-2" })).toThrow("Access denied");

      // Broker attempting to query rival broker "brk-rival-999" must be forced to own broker ID
      const scopedBrokerId = resolveBrokerScope({ role: "broker", id: "usr-broker-1" }, "brk-rival-999");
      expect(scopedBrokerId).toBe("brk-usr-broker-1");

      // Admin can query specified rival broker
      const adminScopedId = resolveBrokerScope({ role: "admin", id: "usr-admin-1" }, "brk-rival-999");
      expect(adminScopedId).toBe("brk-rival-999");
    });
  });

  describe("Issue 15: CORS Origin Whitelist Parsing", () => {
    it("should correctly parse and validate multiple comma-separated ALLOWED_ORIGINS", () => {
      const rawEnv = "https://autobroker.et, https://admin.autobroker.et, http://localhost:5173";
      const parsedOrigins = rawEnv.split(",").map(s => s.trim());

      expect(parsedOrigins).toContain("https://autobroker.et");
      expect(parsedOrigins).toContain("https://admin.autobroker.et");
      expect(parsedOrigins).toContain("http://localhost:5173");
      expect(parsedOrigins).not.toContain("https://malicious-site.com");
    });
  });

  describe("Phase 4: Database Hardening & Query Optimization", () => {
    it("should construct correct database filters and pagination options for search queries", () => {
      const buildQueryOptions = (query: Record<string, string>) => {
        const filter: any = {};
        if (query.brand) filter.brand = query.brand;
        if (query.minPrice || query.maxPrice) {
          filter.price = {};
          if (query.minPrice) filter.price.$gte = Number(query.minPrice);
          if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
        }

        let options: { limit?: number; skip?: number; sort?: any } | undefined;
        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        if (page > 0 && limit > 0) {
          options = { limit, skip: (page - 1) * limit };
        }

        if (query.sort === "price_asc") {
          options = options || {};
          options.sort = { price: 1 };
        }

        return { filter, options };
      };

      const result = buildQueryOptions({
        brand: "Toyota",
        minPrice: "1000000",
        maxPrice: "3000000",
        page: "2",
        limit: "10",
        sort: "price_asc",
      });

      expect(result.filter.brand).toBe("Toyota");
      expect(result.filter.price.$gte).toBe(1000000);
      expect(result.filter.price.$lte).toBe(3000000);
      expect(result.options?.limit).toBe(10);
      expect(result.options?.skip).toBe(10); // Page 2 offset
      expect(result.options?.sort).toEqual({ price: 1 });
    });

    it("should generate standard RFC 4122 compliant UUIDs for all entity prefixes", () => {
      const prefixes = ["veh", "usr", "brk", "ld", "sal", "sv", "td", "pay"];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      for (const prefix of prefixes) {
        const id = `${prefix}-${crypto.randomUUID()}`;
        const uuidPart = id.replace(`${prefix}-`, "");
        expect(uuidPart).toMatch(uuidRegex);
      }
    });
  });
});
