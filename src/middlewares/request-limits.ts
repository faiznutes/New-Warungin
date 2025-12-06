import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to limit request body size
 * Express already has body-parser limits, but we add explicit validation
 */
export const requestSizeLimiter = (maxSizeMB: number = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSizeBytes) {
        logger.warn('Request body too large', {
          size: `${(size / 1024 / 1024).toFixed(2)}MB`,
          maxSize: `${maxSizeMB}MB`,
          path: req.path,
          method: req.method,
        });
        return res.status(413).json({
          error: 'PAYLOAD_TOO_LARGE',
          message: `Request body exceeds maximum size of ${maxSizeMB}MB`,
        });
      }
    }

    next();
  };
};

/**
 * Middleware to limit response size
 * This is a best-effort check - actual response might be slightly larger
 */
export const responseSizeLimiter = (maxSizeMB: number = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseSize = 0;

    res.send = function (body: any) {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      responseSize = Buffer.byteLength(bodyString, 'utf8');

      if (responseSize > maxSizeBytes) {
        logger.warn('Response body too large', {
          size: `${(responseSize / 1024 / 1024).toFixed(2)}MB`,
          maxSize: `${maxSizeMB}MB`,
          path: req.path,
          method: req.method,
        });
        
        // Truncate response if too large
        const truncated = {
          error: 'RESPONSE_TOO_LARGE',
          message: `Response exceeds maximum size of ${maxSizeMB}MB. Please use pagination.`,
          truncated: true,
        };
        return originalSend.call(this, JSON.stringify(truncated));
      }

      return originalSend.call(this, body);
    };

    next();
  };
};
