/**
 * Advanced Rate Limiter using Redis
 * Supports per-user and per-IP rate limiting
 */

import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
}

/**
 * Get client IP from request
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const firstIp = ips.split(',')[0].trim();
    return firstIp || 'unknown';
  }
  
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

/**
 * Get user ID from request (if authenticated)
 */
function getUserId(req: Request): string | null {
  const authReq = req as any;
  return authReq.userId || authReq.user?.id || null;
}

/**
 * Create rate limit key
 */
function createKey(prefix: string, identifier: string, window: number): string {
  const windowKey = Math.floor(Date.now() / window);
  return `ratelimit:${prefix}:${identifier}:${windowKey}`;
}

/**
 * Check and increment rate limit
 */
async function checkRateLimit(
  redis: any,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const current = await redis.incr(key);
  
  // Set expiration on first request
  if (current === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000));
  }
  
  const ttl = await redis.ttl(key);
  const resetTime = Date.now() + (ttl * 1000);
  const remaining = Math.max(0, maxRequests - current);
  
  return {
    allowed: current <= maxRequests,
    remaining,
    resetTime,
  };
}

/**
 * Create Redis-based rate limiter
 */
export function createRedisRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        // If Redis is not available, allow request but log warning
        logger.warn('Redis rate limiter: Redis not available, allowing request', {
          path: req.path,
        });
        return next();
      }
      
      const userId = getUserId(req);
      const clientIp = getClientIp(req);
      
      // Create keys for both IP and user (if authenticated)
      const ipKey = createKey(config.keyPrefix, `ip:${clientIp}`, config.windowMs);
      const userKey = userId ? createKey(config.keyPrefix, `user:${userId}`, config.windowMs) : null;
      
      // Check both limits
      const [ipLimit, userLimit] = await Promise.all([
        checkRateLimit(redis, ipKey, config.maxRequests, config.windowMs),
        userKey ? checkRateLimit(redis, userKey, config.maxRequests, config.windowMs) : { allowed: true, remaining: config.maxRequests, resetTime: Date.now() },
      ]);
      
      // Block if either limit is exceeded
      if (!ipLimit.allowed || !userLimit.allowed) {
        const resetTime = Math.max(ipLimit.resetTime, userLimit.resetTime);
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
        logger.warn('Rate limit exceeded', {
          path: req.path,
          ip: clientIp,
          userId: userId || 'anonymous',
          ipRemaining: ipLimit.remaining,
          userRemaining: userLimit.remaining,
          retryAfter,
        });
        
        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', Math.min(ipLimit.remaining, userLimit.remaining).toString());
        res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
        res.setHeader('Retry-After', retryAfter.toString());
        
        return res.status(429).json({
          error: 'Too many requests',
          message: config.message || 'Too many requests, please try again later.',
          retryAfter,
        });
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.min(ipLimit.remaining, userLimit.remaining).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Math.max(ipLimit.resetTime, userLimit.resetTime)).toISOString());
      
      next();
    } catch (error) {
      // On error, allow request but log
      logger.error('Redis rate limiter error', {
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
      });
      next();
    }
  };
}

/**
 * API Rate Limiter (per-user + per-IP)
 * 500 requests per 15 minutes
 */
export const redisApiLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500,
  keyPrefix: 'api',
  message: 'Too many requests from this IP or user, please try again later.',
});

/**
 * Auth Rate Limiter (stricter)
 * 20 requests per 15 minutes (production)
 * 50 requests per 15 minutes (development)
 */
export const redisAuthLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.NODE_ENV === 'production' ? 20 : 50,
  keyPrefix: 'auth',
  message: 'Too many login attempts, please try again later.',
});
