// @ts-ignore
import NodeCache from "node-cache";
import type { Request, Response, NextFunction } from "express";

const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
  if (ttl) cache.set(key, value, ttl);
  else cache.set(key, value);
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.flushAll();
    return;
  }
  const keys = cache.keys().filter((k) => k.startsWith(pattern));
  for (const key of keys) cache.del(key);
}

export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
  };
}

/**
 * Cache Method (Cache-Aside Pattern)
 * Checks the in-memory cache for the given key. If found, returns the cached value.
 * Otherwise, invokes fetchFn, caches the non-null result for ttl seconds, and returns it.
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== undefined) {
    return cached;
  }
  const fresh = await fetchFn();
  if (fresh !== undefined && fresh !== null) {
    setCache(key, fresh, ttl);
  }
  return fresh;
}

/**
 * Express Cache Middleware Method
 * Automatically caches successful (2xx) responses for public/unauthenticated GET requests.
 * Attaches X-Cache: HIT or X-Cache: MISS headers for observability.
 */
export function cacheMiddleware(
  ttlSeconds: number = 300,
  keyGenerator?: (req: Request) => string
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache safe GET/HEAD methods
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    // Do not cache authenticated user-specific sessions to preserve strict data isolation
    if ((req as any).user) {
      return next();
    }

    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `route:${req.baseUrl || ""}${req.path}:${JSON.stringify(req.query)}`;

    const cachedBody = getCached<any>(cacheKey);
    if (cachedBody !== undefined) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedBody);
    }

    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body !== undefined) {
        setCache(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
}
