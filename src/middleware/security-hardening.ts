// Phase 31 - Security Hardening Middleware
// Comprehensive security protection for the Warungin application

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import DOMPurify from 'isomorphic-dompurify';
import { Redis } from 'ioredis';
import logger from '../utils/logger';
// @ts-expect-error - Optional dependency
import * as RedisStore from 'rate-limit-redis';
// @ts-expect-error - Optional dependency
import csrf from 'csurf';

export class SecurityHardening {
  private redis: Redis | undefined;

  constructor(redis?: Redis) {
    this.redis = redis;
  }

  /**
   * Helmet - Security HTTP headers
   * OWASP recommended headers for all Express apps
   */
  getHelmetMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    });
  }

  /**
   * Rate limiting - Prevent abuse and DDoS
   */
  getRateLimiters() {
    const createLimiter = (windowMs: number, maxRequests: number, message: string) => {
      if (this.redis) {
        // Redis-backed rate limiting for distributed systems
        return rateLimit({
          store: new RedisStore({
            client: this.redis,
            prefix: 'rl:',
          }),
          windowMs,
          max: maxRequests,
          message,
          standardHeaders: true,
          legacyHeaders: false,
          skip: (req: any) => req.user?.role === 'admin', // Skip rate limiting for admins
        });
      } else {
        // In-memory rate limiting (for single instance)
        return rateLimit({
          windowMs,
          max: maxRequests,
          message,
          standardHeaders: true,
          legacyHeaders: false,
        });
      }
    };

    return {
      // Global rate limiter (all requests)
      global: createLimiter(
        15 * 60 * 1000, // 15 minutes
        100, // 100 requests
        'Too many requests from this IP, please try again later.'
      ),

      // Authentication endpoints (very strict)
      auth: createLimiter(
        15 * 60 * 1000,
        5, // 5 attempts per 15 minutes
        'Too many login attempts, please try again later.'
      ),

      // API endpoints (moderate)
      api: createLimiter(
        1 * 60 * 1000, // 1 minute
        60, // 60 requests per minute
        'API rate limit exceeded'
      ),

      // Bulk operations (strict)
      bulkOps: createLimiter(
        1 * 60 * 1000,
        10, // 10 operations per minute
        'Bulk operations rate limit exceeded'
      ),

      // Import/Export (very strict)
      importExport: createLimiter(
        1 * 60 * 1000,
        5, // 5 operations per minute
        'Import/Export rate limit exceeded'
      ),

      // Search (moderate)
      search: createLimiter(
        1 * 60 * 1000,
        30, // 30 searches per minute
        'Search rate limit exceeded'
      ),
    };
  }

  /**
   * Input validation and sanitization
   */
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove script tags and dangerous content
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    }

    if (typeof input === 'object' && input !== null) {
      if (Array.isArray(input)) {
        return input.map(item => this.sanitizeInput(item));
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        // Sanitize keys too (prevent NoSQL injection)
        const cleanKey = mongoSanitize(key);
        sanitized[cleanKey] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Request validation middleware
   */
  validateRequest() {
    return (req: any, res: any, next: any) => {
      // Sanitize request body
      if (req.body) {
        req.body = this.sanitizeInput(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = this.sanitizeInput(req.query);
      }

      // Sanitize URL parameters
      if (req.params) {
        req.params = this.sanitizeInput(req.params);
      }

      // Validate content type
      if (req.is('json') === false && req.method !== 'GET' && req.method !== 'DELETE') {
        return res.status(400).json({
          error: 'Invalid Content-Type. Expected application/json',
        });
      }

      next();
    };
  }

  /**
   * SQL/NoSQL injection prevention
   */
  preventSQLInjection() {
    return (req: any, res: any, next: any) => {
      // Check for common SQL injection patterns
      const dangerousPatterns = [
        /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|EXECUTE)\b)/gi,
        /('|"|;|--|\*|\/\*|\*\/)/g,
      ];

      const checkValue = (value: string) => {
        if (typeof value !== 'string') return false;
        return dangerousPatterns.some(pattern => pattern.test(value));
      };

      // Check body
      if (req.body) {
        for (const [key, value] of Object.entries(req.body)) {
          if (checkValue(value as string)) {
            return res.status(400).json({
              error: 'Invalid input detected. Potential injection attempt.',
            });
          }
        }
      }

      // Check query
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (checkValue(value as string)) {
            return res.status(400).json({
              error: 'Invalid query parameter. Potential injection attempt.',
            });
          }
        }
      }

      next();
    };
  }

  /**
   * CSRF token middleware
   */
  csrfProtection() {
    return csrf({
      cookie: false, // Use session-based tokens instead of cookies
    });
  }

  /**
   * Secure response headers
   */
  secureHeaders() {
    return (req: any, res: any, next: any) => {
      // Prevent MIME sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Permissions Policy
      res.setHeader(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=()'
      );

      // Disable caching for sensitive data
      if (req.path.includes('auth') || req.path.includes('admin')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      next();
    };
  }

  /**
   * Log security events
   */
  logSecurityEvent(eventType: string, details: any, severity: 'info' | 'warning' | 'critical') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      eventType,
      details,
      severity,
    };

    logger.info('Security event logged', logEntry);

    // Send to monitoring system (Phase 30)
    if (this.redis) {
      this.redis.lpush(`security:logs:${severity}`, JSON.stringify(logEntry));
    }
  }

  /**
   * Account lockout after failed attempts
   */
  getAccountLockoutMiddleware() {
    return (req: any, res: any, next: any) => {
      if (req.path !== '/auth/login') {
        return next();
      }

      const userKey = `lockout:${req.body.email}`;

      if (this.redis) {
        this.redis.get(userKey, (err, lockoutCount) => {
          if (err) return next();

          if (lockoutCount && parseInt(lockoutCount) >= 5) {
            this.logSecurityEvent('account_lockout', {
              email: req.body.email,
              ip: req.ip,
            }, 'warning');

            return res.status(429).json({
              error: 'Account temporarily locked due to multiple failed login attempts',
            });
          }

          next();
        });
      } else {
        next();
      }
    };
  }

  /**
   * API key rotation middleware
   */
  rotateApiKey() {
    return (req: any, res: any, next: any) => {
      if (!req.user) return next();

      // Check if API key is older than 90 days
      const keyAge = Date.now() - req.user.apiKeyCreatedAt;
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

      if (keyAge > ninetyDaysMs) {
        this.logSecurityEvent('api_key_expired', {
          userId: req.user.id,
          keyAge,
        }, 'info');

        return res.status(401).json({
          error: 'API key has expired. Please rotate your key.',
        });
      }

      // Warning if key is older than 60 days
      if (keyAge > 60 * 24 * 60 * 60 * 1000) {
        res.setHeader('X-API-Key-Warning', 'API key will expire in 30 days');
      }

      next();
    };
  }

  /**
   * Get all security middlewares in recommended order
   */
  getAllMiddlewares() {
    const limiters = this.getRateLimiters();

    return [
      // 1. Security headers first
      this.getHelmetMiddleware(),

      // 2. Secure response headers
      this.secureHeaders(),

      // 3. Global rate limiting
      limiters.global,

      // 4. Input validation and sanitization
      this.validateRequest(),

      // 5. SQL/NoSQL injection prevention
      this.preventSQLInjection(),

      // 6. Account lockout protection
      this.getAccountLockoutMiddleware(),

      // 7. API key rotation
      this.rotateApiKey(),
    ];
  }

  /**
   * Get rate limiters by endpoint type
   */
  getLimiterForEndpoint(endpoint: string) {
    const limiters = this.getRateLimiters();

    if (endpoint.includes('auth')) {
      return limiters.auth;
    } else if (endpoint.includes('bulk')) {
      return limiters.bulkOps;
    } else if (endpoint.includes('import') || endpoint.includes('export')) {
      return limiters.importExport;
    } else if (endpoint.includes('search')) {
      return limiters.search;
    } else {
      return limiters.api;
    }
  }
}

export default SecurityHardening;
