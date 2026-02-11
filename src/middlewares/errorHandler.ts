import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import { sanitizeError, sanitizeForLogging } from '../utils/log-sanitizer';

/**
 * Standardized API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

/**
 * Error codes for different types of errors
 */
export const ErrorCodes = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Authentication/Authorization Errors (401/403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Resource Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  OUTLET_NOT_FOUND: 'OUTLET_NOT_FOUND',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',

  // Business Logic Errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_STATE: 'INVALID_STATE',

  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_ERROR: 'SERVICE_ERROR',
};

/**
 * HTTP Status Codes for Error Types
 */
const ErrorStatusCodes: Record<string, number> = {
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_FIELD]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.INVALID_TOKEN]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.PERMISSION_DENIED]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.OUTLET_NOT_FOUND]: 404,
  [ErrorCodes.TENANT_NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.DUPLICATE_ENTRY]: 409,
  [ErrorCodes.INVALID_STATE]: 409,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.SERVICE_ERROR]: 500,
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom API Error Class (Legacy support)
 */
export class ApiError extends AppError {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = ErrorStatusCodes[code] || 500,
    public details?: any
  ) {
    super(message, statusCode);
    this.name = 'ApiError';
  }
}

/**
 * Success Response Helper
 */
export const successResponse = <T>(req: Request, message: string, data?: T): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    path: req.path,
  };
};

/**
 * Async Error Wrapper Middleware
 * Wraps route handlers to catch async errors
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request/Response size limiters (Moving from deleted file if needed, or assuming they are in request-limits.ts)



/**
 * Enhanced error logging with request context
 */
function logErrorWithContext(
  err: Error,
  req: Request,
  context: string = 'UNHANDLED_ERROR'
) {
  // Sanitize error and request data before logging
  const sanitizedError = sanitizeError(err);
  const errorDetails = sanitizeForLogging({
    context,
    message: sanitizedError.message,
    name: sanitizedError.name,
    stack: sanitizedError.stack,
    path: req.path,
    method: req.method,
    query: sanitizeForLogging(req.query),
    body: req.body && Object.keys(req.body).length > 0 ? sanitizeForLogging(req.body) : undefined,
    headers: sanitizeForLogging({
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin,
    }),
    code: sanitizedError.code,
    statusCode: (err as any).statusCode,
    meta: sanitizeForLogging((err as any).meta),
  });

  logger.error(`Error [${context}]:`, errorDetails);
}

export const errorHandler = (
  err: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    logErrorWithContext(err, req, 'VALIDATION_ERROR');

    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    logErrorWithContext(err, req, 'APP_ERROR');

    if (!res.headersSent) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logErrorWithContext(err, req, 'PRISMA_ERROR');

    if (!res.headersSent) {
      // Handle specific Prisma error codes
      switch (err.code) {
        case 'P1001':
        case 'P1002':
          // Connection errors
          res.status(503).json({
            success: false,
            error: 'Database connection failed',
            message: 'Unable to connect to database. Please try again.',
            code: err.code,
            timestamp: new Date().toISOString(),
            path: req.path,
          });
          break;
        case 'P2002':
          // Unique constraint violation
          res.status(409).json({
            success: false,
            error: 'Duplicate entry',
            message: 'A record with this information already exists.',
            code: err.code,
            timestamp: new Date().toISOString(),
            path: req.path,
          });
          break;
        case 'P2025':
          // Record not found
          res.status(404).json({
            success: false,
            error: 'Record not found',
            message: 'The requested record could not be found.',
            code: err.code,
            timestamp: new Date().toISOString(),
            path: req.path,
          });
          break;
        default:
          // Other Prisma errors
          res.status(500).json({
            success: false,
            error: 'Database error',
            message: process.env.NODE_ENV === 'production'
              ? 'A database error occurred. Please try again.'
              : err.message,
            code: err.code,
            timestamp: new Date().toISOString(),
            path: req.path,
          });
      }
    }
    return;
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    logErrorWithContext(err, req, 'PRISMA_VALIDATION_ERROR');

    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        error: 'Invalid data',
        message: process.env.NODE_ENV === 'production'
          ? 'The provided data is invalid.'
          : err.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
    return;
  }

  // Unknown errors - comprehensive logging
  logErrorWithContext(err, req, 'UNKNOWN_ERROR');

  // Ensure response hasn't been sent
  if (!res.headersSent) {
    const statusCode = (err as any).statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 && !isDevelopment
        ? 'Internal server error'
        : err.message || 'An unexpected error occurred',
      message: statusCode === 500 && !isDevelopment
        ? 'An unexpected error occurred. Please try again.'
        : err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(isDevelopment && {
        stack: err.stack,
        name: err.name,
        code: (err as any).code,
      }),
    });
  } else {
    // If headers already sent, log warning
    logger.warn('Error handler called but response already sent:', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack,
    });
  }
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found:', {
    path: req.path,
    method: req.method,
    query: req.query,
  });

  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};
