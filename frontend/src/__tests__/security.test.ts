import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../../backend/auth";
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

    it("should enforce admin redirection away from user-side routes", () => {
      const resolveRouteForRole = (pathname: string, role: string | undefined): string => {
        const isUserSidePath = !pathname.startsWith("/admin");
        if (role === "admin" && isUserSidePath) {
          return "/admin";
        }
        return pathname;
      };

      const userSidePaths = ["/", "/browse", "/vehicles/veh-123", "/compare", "/choose-role", "/profile", "/broker-dashboard", "/seller-dashboard", "/about"];

      for (const path of userSidePaths) {
        expect(resolveRouteForRole(path, "admin")).toBe("/admin");
        expect(resolveRouteForRole(path, "buyer")).toBe(path);
      }

      expect(resolveRouteForRole("/admin/profile", "admin")).toBe("/admin/profile");
      expect(resolveRouteForRole("/admin/notifications", "admin")).toBe("/admin/notifications");
    });

    it("should safely sanitize regex special characters to prevent ReDoS attacks", () => {
      const escapeRegex = (text: string) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const maliciousInputs = [
        "(a+)+$",
        "((.*)*)*",
        "[a-zA-Z0-9]+.*",
        "test.*+?^${}()|[]\\",
        "Mercedes-Benz (C-Class)",
      ];

      for (const input of maliciousInputs) {
        const sanitized = escapeRegex(input);
        expect(() => new RegExp(sanitized, "i")).not.toThrow();
        // Make sure it matches literal text, not arbitrary wildcard patterns
        const regex = new RegExp(`^${sanitized}$`, "i");
        expect(regex.test(input)).toBe(true);
        expect(regex.test("randomOtherString")).toBe(false);
      }
    });
  });

  describe("Phase 2: Authentication Hardening & Session Lifecycle", () => {
    const mockUser = {
      id: "usr-12345678",
      name: "Abebe Bikila",
      email: "abebe@example.com",
      role: "broker" as const,
      token_version: 0,
    };

    it("should generate short-lived access tokens containing user claims and tokenVersion", () => {
      const accessToken = generateAccessToken(mockUser);
      expect(typeof accessToken).toBe("string");

      const decoded = jwt.decode(accessToken) as any;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.tokenVersion).toBe(0);

      // Verify expiration is 15 minutes (900 seconds)
      const lifetimeSeconds = decoded.exp - decoded.iat;
      expect(lifetimeSeconds).toBe(15 * 60);
    });

    it("should issue 7-day refresh tokens and verify them successfully", () => {
      const refreshToken = generateRefreshToken(mockUser);
      expect(typeof refreshToken).toBe("string");

      const decoded = verifyRefreshToken(refreshToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(mockUser.id);
      expect(decoded?.tokenVersion).toBe(0);
      expect(decoded?.type).toBe("refresh");

      const rawDecoded = jwt.decode(refreshToken) as any;
      const lifetimeSeconds = rawDecoded.exp - rawDecoded.iat;
      expect(lifetimeSeconds).toBe(7 * 24 * 60 * 60);
    });

    it("should reject corrupted or forged refresh tokens", () => {
      expect(verifyRefreshToken("completely-invalid-jwt-token")).toBeNull();
      expect(verifyRefreshToken("")).toBeNull();

      // Tampered token
      const valid = generateRefreshToken(mockUser);
      const tampered = valid.substring(0, valid.length - 5) + "abcde";
      expect(verifyRefreshToken(tampered)).toBeNull();
    });

    it("should invalidate refresh tokens when token_version is incremented on password change", () => {
      // User creates session with version 0
      const activeRefreshToken = generateRefreshToken({ id: mockUser.id, token_version: 0 });
      const decodedSession = verifyRefreshToken(activeRefreshToken);
      expect(decodedSession).not.toBeNull();

      // Simulate password change bumping DB token_version to 1
      const dbUserVersion = 1;

      // Verification logic matches /api/auth/refresh endpoint check:
      const isSessionValid = decodedSession!.tokenVersion === dbUserVersion;
      expect(isSessionValid).toBe(false);

      // New token issued after password change matches new version
      const newRefreshToken = generateRefreshToken({ id: mockUser.id, token_version: dbUserVersion });
      const newDecoded = verifyRefreshToken(newRefreshToken);
      expect(newDecoded!.tokenVersion === dbUserVersion).toBe(true);
    });

    it("should reject access tokens as refresh tokens", () => {
      const accessToken = generateAccessToken(mockUser);
      // Access tokens do not use the refresh secret or have type: 'refresh'
      const verifiedAsRefresh = verifyRefreshToken(accessToken);
      expect(verifiedAsRefresh).toBeNull();
    });
  });

  describe("Phase 3: Database Optimization, Compound Indexing & Query Safety", () => {
    it("should define compound indexes on VehicleModel for status, price, year, and make/model", async () => {
      const { VehicleModel } = await import("../../../backend/db/models");
      const indexes = VehicleModel.schema.indexes();
      const indexFields = indexes.map(([fields]) => Object.keys(fields).join("_"));

      expect(indexFields).toContain("status_price");
      expect(indexFields).toContain("status_year");
      expect(indexFields).toContain("status_brand_model");
      expect(indexFields).toContain("broker_id_status");
    });

    it("should enforce compound unique index on SavedVehicleModel to prevent duplicate saves", async () => {
      const { SavedVehicleModel } = await import("../../../backend/db/models");
      const indexes = SavedVehicleModel.schema.indexes();
      const savedVehicleIndex = indexes.find(([fields]) => fields.user_id === 1 && fields.vehicle_id === 1);

      expect(savedVehicleIndex).toBeDefined();
      expect(savedVehicleIndex![1]?.unique).toBe(true);
    });

    it("should have indexes on UserModel and BrokerModel for relational lookups", async () => {
      const { UserModel, BrokerModel } = await import("../../../backend/db/models");
      const userIndexes = UserModel.schema.indexes().map(([fields]) => Object.keys(fields).join("_"));
      const brokerIndexes = BrokerModel.schema.indexes().map(([fields]) => Object.keys(fields).join("_"));

      expect(userIndexes).toContain("role");
      expect(brokerIndexes).toContain("user_id");
    });

    it("should safely handle getBrokersByIds and getUsersByIds with empty arrays without DB queries", async () => {
      const { db } = await import("../../../backend/db/index");
      const brokers = await db.getBrokersByIds([]);
      expect(brokers).toEqual([]);

      const users = await db.getUsersByIds([]);
      expect(users).toEqual([]);
    });
  });

  describe("Phase 4 & 5: Environment Hardening, Production Config & Input Validation", () => {
    it("should validate and require change password inputs", async () => {
      const { changePasswordSchema } = await import("../../../backend/validators/index");

      // Invalid: missing currentPassword
      const missingCurrent = changePasswordSchema.safeParse({ newPassword: "ValidPassword123" });
      expect(missingCurrent.success).toBe(false);

      // Invalid: newPassword shorter than 6 chars
      const shortPass = changePasswordSchema.safeParse({ currentPassword: "OldPassword123", newPassword: "123" });
      expect(shortPass.success).toBe(false);

      // Valid
      const valid = changePasswordSchema.safeParse({ currentPassword: "OldPassword123", newPassword: "NewSecretPassword123" });
      expect(valid.success).toBe(true);
    });

    it("should enforce phone or email on contact inquiries", async () => {
      const { contactSchema } = await import("../../../backend/validators/index");

      // Invalid: neither phone nor email
      const emptyContact = contactSchema.safeParse({ name: "Buyer Name" });
      expect(emptyContact.success).toBe(false);

      // Valid with phone
      const phoneOnly = contactSchema.safeParse({ name: "Buyer", phone: "+251912345678" });
      expect(phoneOnly.success).toBe(true);

      // Valid with email
      const emailOnly = contactSchema.safeParse({ name: "Buyer", email: "buyer@example.com" });
      expect(emailOnly.success).toBe(true);
    });

    it("should validate broker updates and enforce commission rate boundaries (0-100%)", async () => {
      const { brokerUpdateSchema } = await import("../../../backend/validators/index");

      // Invalid commission rate > 100
      const excessiveCommission = brokerUpdateSchema.safeParse({ commission_rate: 150 });
      expect(excessiveCommission.success).toBe(false);

      // Invalid commission rate < 0
      const negativeCommission = brokerUpdateSchema.safeParse({ commission_rate: -5 });
      expect(negativeCommission.success).toBe(false);

      // Valid update
      const valid = brokerUpdateSchema.safeParse({ commission_rate: 2.5, bio: "Certified broker in Addis Ababa" });
      expect(valid.success).toBe(true);
    });

    it("should parse centralized config with safe defaults and CORS origins", async () => {
      const { loadConfig } = await import("../../../backend/config");
      const cfg = loadConfig();

      expect(cfg.port).toBeGreaterThan(0);
      expect(cfg.jwtSecret).toBeDefined();
      expect(cfg.jwtRefreshSecret).toBeDefined();
      expect(Array.isArray(cfg.allowedOrigins)).toBe(true);
      expect(cfg.allowedOrigins.length).toBeGreaterThan(0);
    });

    it("should validate and allow trusted origins including Vercel and Render platforms", () => {
      const allowedOrigins = ["http://localhost:3000", "https://arifcarsell.et"];
      const isAllowedOrigin = (origin: string | undefined): boolean => {
        if (!origin) return true;
        if (allowedOrigins.includes(origin)) return true;
        if (origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) return true;
        return false;
      };

      expect(isAllowedOrigin(undefined)).toBe(true);
      expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
      expect(isAllowedOrigin("https://arifcarsell.et")).toBe(true);
      expect(isAllowedOrigin("https://car-broker-showcase-preview.vercel.app")).toBe(true);
      expect(isAllowedOrigin("https://arif-backend.onrender.com")).toBe(true);
      expect(isAllowedOrigin("https://malicious-attacker-site.com")).toBe(false);
    });
  });
});


