// @ts-ignore
import NodeCache from "node-cache";

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
  const keys = cache.keys().filter(k => k.startsWith(pattern));
  for (const key of keys) cache.del(key);
}

export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
  };
}
