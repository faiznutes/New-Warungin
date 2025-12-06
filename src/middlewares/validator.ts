import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import logger from '../utils/logger';
import { sanitizeObject, sanitizeString } from '../utils/sanitize';

export const validate = (schemas: { body?: AnyZodObject; query?: AnyZodObject; params?: AnyZodObject }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input before validation
      if (schemas.body && req.body) {
        req.body = sanitizeObject(req.body);
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query && req.query) {
        // Sanitize query string values
        const sanitizedQuery: any = {};
        for (const key in req.query) {
          const value = req.query[key];
          if (typeof value === 'string') {
            sanitizedQuery[key] = sanitizeString(value);
          } else if (Array.isArray(value)) {
            sanitizedQuery[key] = value.map(v => typeof v === 'string' ? sanitizeString(v) : v);
          } else {
            sanitizedQuery[key] = value;
          }
        }
        req.query = sanitizedQuery;
        if (schemas.query) {
          req.query = await schemas.query.parseAsync(req.query);
        }
      }
      if (schemas.params && req.params) {
        // Sanitize params
        const sanitizedParams: any = {};
        for (const key in req.params) {
          sanitizedParams[key] = sanitizeString(req.params[key]);
        }
        req.params = sanitizedParams;
        if (schemas.params) {
          req.params = await schemas.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Log validation errors for debugging
        logger.error('Validation error', {
          path: req.path,
          method: req.method,
          errors: error.errors,
        });
        
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Data tidak valid. Silakan periksa field yang diisi.',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

