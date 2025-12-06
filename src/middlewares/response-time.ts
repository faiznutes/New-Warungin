import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to audit response times
 * Logs slow requests and tracks performance metrics
 */
export const responseTimeAudit = (
  slowThreshold: number = 1000, // 1 second default
  logSlowRequests: boolean = true
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      const isSlow = duration > slowThreshold;

      // Log slow requests
      if (isSlow && logSlowRequests) {
        logger.warn('Slow request detected', {
          path: req.path,
          method: req.method,
          duration: `${duration}ms`,
          threshold: `${slowThreshold}ms`,
          statusCode: res.statusCode,
          query: Object.keys(req.query).length > 0 ? req.query : undefined,
        });
      }

      // Add response time header
      res.setHeader('X-Response-Time', `${duration}ms`);

      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};
