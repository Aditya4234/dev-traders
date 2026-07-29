import Redis from "ioredis";

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  return redis;
}

function initRedis(): void {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("[Redis] REDIS_URL not set, caching disabled");
    return;
  }
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        return Math.min(times * 200, 2000);
      },
    });
    redis.on("connect", () => console.log("[Redis] Connected"));
    redis.on("error", (err: Error) => console.error("[Redis] Error:", err.message));
  } catch (err) {
    console.error("[Redis] Failed to initialize:", err);
  }
}

const cached = (global as any).redisInit;
if (!cached) {
  initRedis();
  (global as any).redisInit = true;
}

export { getRedisClient, initRedis };

export async function cacheGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (!redis) return;
  try {
    if (ttlSeconds) await redis.setex(key, ttlSeconds, value);
    else await redis.set(key, value);
  } catch {
    // silently fail
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // silently fail
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // silently fail
  }
}

export async function getMetrics(): Promise<Record<string, string | number> | null> {
  if (!redis) return null;
  try {
    const info = await redis.info("stats");
    const result: Record<string, string> = {};
    info.split("\r\n").forEach((line) => {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        if (key && value) result[key.trim()] = value.trim();
      }
    });
    return result;
  } catch {
    return null;
  }
}
