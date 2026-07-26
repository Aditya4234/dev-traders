import { Request, Response, NextFunction } from "express";
import { cacheGet, cacheSet } from "../services/redis";

export function cacheMiddleware(ttlSeconds: number = 300) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const redis = require("../services/redis").getRedisClient();
    if (!redis) {
      next();
      return;
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await cacheGet(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(JSON.parse(cached));
        return;
      }
    } catch {
      // proceed without cache
    }

    const originalJson = res.json.bind(res);
    res.json = ((body: any) => {
      if (res.statusCode === 200 && body?.success) {
        cacheSet(key, JSON.stringify(body), ttlSeconds).catch(() => {});
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    }) as any;

    next();
  };
}

export function invalidateCache(pattern: string) {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { cacheDelPattern } = require("../services/redis");
    await cacheDelPattern(pattern).catch(() => {});
    next();
  };
}
