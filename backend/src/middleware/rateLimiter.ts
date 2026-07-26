import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../services/redis";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator, message } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const redis = getRedisClient();
    const key = keyGenerator ? keyGenerator(req) : `${req.ip}:${req.route?.path || req.path}`;

    if (redis) {
      try {
        const redisKey = `ratelimit:${key}`;
        const current = await redis.incr(redisKey);
        if (current === 1) {
          await redis.pexpire(redisKey, windowMs);
        }

        const ttl = await redis.pttl(redisKey);
        res.setHeader("X-RateLimit-Limit", maxRequests);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current));
        res.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() + ttl));

        if (current > maxRequests) {
          res.status(429).json({
            success: false,
            message: message || "Too many requests, please try again later",
          });
          return;
        }

        next();
        return;
      } catch {
        // Fall through to in-memory
      }
    }

    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || now > entry.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      next();
      return;
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime));

    if (entry.count > maxRequests) {
      res.status(429).json({
        success: false,
        message: message || "Too many requests, please try again later",
      });
      return;
    }

    next();
  };
}

export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: "Too many API requests, please try again later",
});

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: "Too many auth attempts, please try again later",
});

export const searchLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 30,
  message: "Too many search requests, please try again later",
});

export const paymentLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: "Too many payment requests, please try again later",
});
