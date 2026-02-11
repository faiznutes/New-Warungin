import helmet from 'helmet';
import { Request, Response, NextFunction, Express } from 'express';
import rateLimit from 'express-rate-limit';
import env from '../config/env';
import logger from '../utils/logger';

export const setupSecurity = (app: Express): void => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Strict-Transport-Security (HSTS)
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: env.NODE_ENV === 'production', // Only enable preload in production
      },
    })
  );
};

const rateLimitConfigs: any = {
  STRICT: { windowMs: 5 * 60 * 1000, max: 5, message: 'Terlalu banyak percobaan' },
  STANDARD: { windowMs: 15 * 60 * 1000, max: 30, message: 'Terlalu banyak percobaan' },
  RELAXED: { windowMs: 60 * 60 * 1000, max: 100, message: 'Terlalu banyak percobaan' },
  SEARCH: { windowMs: 60 * 1000, max: 50, message: 'Terlalu banyak pencarian' },
  EXPORT: { windowMs: 60 * 60 * 1000, max: 20, message: 'Terlalu banyak export' },
  IMPORT: { windowMs: 60 * 60 * 1000, max: 10, message: 'Terlalu banyak import' },
};

export const createRateLimiter = (config: string = 'STANDARD') => {
  const cfg = rateLimitConfigs[config] || rateLimitConfigs.STANDARD;
  return rateLimit({
    windowMs: cfg.windowMs,
    max: cfg.max,
    keyGenerator: (req: Request) => (req as any).user?.id || req.ip || 'anonymous',
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', { ip: req.ip, userId: (req as any).user?.id });
      res.status(429).json({ error: cfg.message, retryAfter: (req as any).rateLimit?.resetTime });
    },
  });
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const xssPattern = /<[^>]*>|javascript:|onerror|onclick|onload/gi;

  const sanitizeObj = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(xssPattern, '').substring(0, 1000);
    }
    if (obj && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitizeObj(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  req.body = sanitizeObj(req.body);
  req.query = sanitizeObj(req.query);
  next();
};

export const validateSQLSafety = (req: Request, res: Response, next: NextFunction) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|--|;)\b)/gi;
  const input = JSON.stringify({ body: req.body, query: req.query });

  if (sqlPattern.test(input)) {
    logger.warn('Potential SQL injection attempt', { ip: req.ip, userId: (req as any).user?.id });
    return res.status(400).json({ error: 'Input tidak valid' });
  }
  next();
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter(f => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Field wajib diisi: ${missing.join(', ')}` });
    }
    next();
  };
};

export default { setupSecurity, createRateLimiter, sanitizeInput, validateSQLSafety, securityHeaders, validateRequiredFields };

