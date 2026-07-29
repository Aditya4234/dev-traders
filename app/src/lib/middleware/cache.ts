import { getRedisClient } from "@/lib/services/redis";

const inMemoryCache: Map<string, { data: string; expiry: number }> = new Map();

export async function getCache(key: string): Promise<string | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      const entry = inMemoryCache.get(key);
      if (entry && Date.now() < entry.expiry) return entry.data;
      return null;
    }
  }
  const entry = inMemoryCache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data;
  return null;
}

export async function setCache(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      if (ttlSeconds) await redis.setex(key, ttlSeconds, value);
      else await redis.set(key, value);
      return;
    } catch {
      // fall through to in-memory
    }
  }
  inMemoryCache.set(key, {
    data: value,
    expiry: Date.now() + (ttlSeconds || 300) * 1000,
  });
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } catch {
      // ignore
    }
  }
  for (const key of inMemoryCache.keys()) {
    if (key.includes(pattern.replace("*", ""))) {
      inMemoryCache.delete(key);
    }
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } catch {
      // ignore
    }
  }
  for (const key of inMemoryCache.keys()) {
    if (key.includes(pattern.replace("*", ""))) {
      inMemoryCache.delete(key);
    }
  }
}
