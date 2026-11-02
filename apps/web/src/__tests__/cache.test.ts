import { describe, it, expect, beforeEach } from "vitest";
import {
  getCached,
  setCache,
  clearCache,
  getOrSetCache,
  cacheMiddleware,
  getCacheStats,
} from "../../../api/services/cache";

describe("Cache Service & Methods", () => {
  beforeEach(() => {
    clearCache();
  });

  it("should store and retrieve data with getCached and setCache", () => {
    const key = "test:simple:1";
    expect(getCached(key)).toBeUndefined();

    setCache(key, { make: "Toyota", model: "Corolla" }, 60);
    expect(getCached(key)).toEqual({ make: "Toyota", model: "Corolla" });
  });

  it("should selectively invalidate keys matching a pattern with clearCache", () => {
    setCache("vehicles:1", { id: "1" });
    setCache("vehicles:2", { id: "2" });
    setCache("brokers:1", { id: "b1" });

    expect(getCached("vehicles:1")).toBeDefined();
    expect(getCached("brokers:1")).toBeDefined();

    clearCache("vehicles");

    expect(getCached("vehicles:1")).toBeUndefined();
    expect(getCached("vehicles:2")).toBeUndefined();
    expect(getCached("brokers:1")).toBeDefined();
  });

  it("should implement the Cache-Aside pattern via getOrSetCache", async () => {
    const key = "test:cache-aside:key";
    let dbCallCount = 0;

    const fetchFromDB = async () => {
      dbCallCount++;
      return { id: 101, title: "Listing 101", timestamp: Date.now() };
    };

    // 1st call: Cache miss -> invokes fetchFromDB
    const result1 = await getOrSetCache(key, fetchFromDB, 60);
    expect(result1.id).toBe(101);
    expect(dbCallCount).toBe(1);

    // 2nd call: Cache hit -> returns cached copy without invoking fetchFromDB
    const result2 = await getOrSetCache(key, fetchFromDB, 60);
    expect(result2).toEqual(result1);
    expect(dbCallCount).toBe(1);

    // Clear cache -> 3rd call invokes fetchFromDB again
    clearCache("test:cache-aside");
    const result3 = await getOrSetCache(key, fetchFromDB, 60);
    expect(result3.id).toBe(101);
    expect(dbCallCount).toBe(2);
  });

  it("should intercept and cache public requests via cacheMiddleware", () => {
    const middleware = cacheMiddleware(60);

    // Request 1: Unauthenticated GET request (Cache MISS)
    const req1: any = { method: "GET", path: "/api/vehicles/public", baseUrl: "", query: {} };
    let headers1: Record<string, string> = {};
    let jsonBody1: any = null;
    const res1: any = {
      statusCode: 200,
      setHeader: (k: string, v: string) => { headers1[k] = v; },
      json: (body: any) => { jsonBody1 = body; return body; },
    };
    let nextCalled1 = false;
    middleware(req1, res1, () => { nextCalled1 = true; });

    expect(nextCalled1).toBe(true);
    expect(headers1["X-Cache"]).toBe("MISS");
    res1.json({ vehicles: [{ id: "v1", brand: "BYD" }] });

    // Request 2: Same request (Cache HIT)
    const req2: any = { method: "GET", path: "/api/vehicles/public", baseUrl: "", query: {} };
    let headers2: Record<string, string> = {};
    let jsonBody2: any = null;
    const res2: any = {
      statusCode: 200,
      setHeader: (k: string, v: string) => { headers2[k] = v; },
      json: (body: any) => { jsonBody2 = body; return body; },
    };
    let nextCalled2 = false;
    middleware(req2, res2, () => { nextCalled2 = true; });

    expect(nextCalled2).toBe(false); // Served immediately without calling next()
    expect(headers2["X-Cache"]).toBe("HIT");
    expect(jsonBody2).toEqual({ vehicles: [{ id: "v1", brand: "BYD" }] });

    // Request 3: Authenticated user (must bypass cache to preserve user isolation)
    const reqAuth: any = {
      method: "GET",
      path: "/api/vehicles/public",
      baseUrl: "",
      query: {},
      user: { id: "user-123", role: "buyer" },
    };
    let nextCalledAuth = false;
    middleware(reqAuth, res2, () => { nextCalledAuth = true; });
    expect(nextCalledAuth).toBe(true);
  });

  it("should provide cache metrics through getCacheStats", () => {
    clearCache();
    setCache("key:1", "val1");
    setCache("key:2", "val2");

    const stats = getCacheStats();
    expect(stats.keys).toBe(2);
    expect(typeof stats.hits).toBe("number");
    expect(typeof stats.misses).toBe("number");
  });
});
