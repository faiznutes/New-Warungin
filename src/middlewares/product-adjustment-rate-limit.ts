/**
 * Rate Limit Middleware for Product Adjustments
 * Prevents abuse of product adjustment endpoint
 * Limit: 10 requests per minute per tenant per IP
 */

import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';
import { AuthRequest } from './auth';

const redis = getRedisClient();
const ADJUSTMENT_RATE_LIMIT = 10; // requests
const RATE_LIMIT_WINDOW = 60; // seconds (1 minute)

export const productAdjustmentRateLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Rate limit key: unique per tenant + user
    const rateLimitKey = `ratelimit:adjustment:${tenantId}:${userId}`;

    // Get current count
    const count = await redis.incr(rateLimitKey);

    // Set expiry on first request
    if (count === 1) {
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', ADJUSTMENT_RATE_LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, ADJUSTMENT_RATE_LIMIT - count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + RATE_LIMIT_WINDOW);

    // Check if exceeded
    if (count > ADJUSTMENT_RATE_LIMIT) {
      logger.warn(`Rate limit exceeded for product adjustments`, {
        tenantId,
        userId,
        currentCount: count,
        limit: ADJUSTMENT_RATE_LIMIT,
      });

      return res.status(429).json({
        message: 'Too many product adjustment requests. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW,
      });
    }

    next();
  } catch (error) {
    logger.error('Error in product adjustment rate limiter:', error);
    // Allow request if rate limiter fails
    next();
  }
};

export default productAdjustmentRateLimit;
