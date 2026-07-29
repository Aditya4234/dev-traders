import { getRedisClient } from "@/lib/services/redis";

const inMemory: Map<string, { count: number; resetAt: number }> = new Map();

async function checkInMemory(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const entry = inMemory.get(key);
  if (!entry || now > entry.resetAt) {
    inMemory.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const current = await redis.incr(key);
      if (current === 1) await redis.pexpireat(key, Date.now() + windowMs);
      return current <= limit;
    } catch {
      return checkInMemory(key, limit, windowMs);
    }
  }
  return checkInMemory(key, limit, windowMs);
}
