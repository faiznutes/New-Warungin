import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

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
 * Enhanced error logging with request context
 */
function logErrorWithContext(
  err: Error | unknown,
  req: Request,
  context: string = 'UNHANDLED_ERROR'
) {
  const error = err instanceof Error ? err : new Error(String(err));
  const errorDetails = {
    context,
    message: error.message,
    name: error.name,
    stack: error.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body && Object.keys(req.body).length > 0 ? '[REDACTED]' : undefined,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin,
    },
    code: (error as any).code,
    statusCode: (error as any).statusCode,
    meta: (error as any).meta,
  };

  logger.error(`Error [${context}]:`, errorDetails);
}

export const errorHandler = (
  err: Error | AppError | ZodError | unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Convert unknown error to Error
  let error: Error | AppError | ZodError;
  if (!(err instanceof Error) && !(err instanceof ZodError) && !(err instanceof AppError)) {
    error = new Error(String(err));
  } else {
    error = err as Error | AppError | ZodError;
  }
  // Zod validation errors
  if (error instanceof ZodError) {
    logErrorWithContext(error, req, 'VALIDATION_ERROR');
    
    if (!res.headersSent) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return;
  }

  // Custom AppError
  if (error instanceof AppError) {
    logErrorWithContext(error, req, 'APP_ERROR');
    
    if (!res.headersSent) {
      res.status(error.statusCode).json({
        error: error.message,
      });
    }
    return;
  }

  // Prisma errors - check for Prisma error by code property
  if (error && typeof error === 'object' && 'code' in error && typeof (error as any).code === 'string' && (error as any).code.startsWith('P')) {
    logErrorWithContext(error, req, 'PRISMA_ERROR');
    
    if (!res.headersSent) {
      // Handle specific Prisma error codes
      const prismaError = error as any;
      switch (prismaError.code) {
        case 'P1001':
        case 'P1002':
          // Connection errors
          res.status(503).json({
            error: 'Database connection failed',
            message: 'Unable to connect to database. Please try again.',
            code: prismaError.code,
          });
          break;
        case 'P2002':
          // Unique constraint violation
          res.status(409).json({
            error: 'Duplicate entry',
            message: 'A record with this information already exists.',
            code: prismaError.code,
          });
          break;
        case 'P2025':
          // Record not found
          res.status(404).json({
            error: 'Record not found',
            message: 'The requested record could not be found.',
            code: prismaError.code,
          });
          break;
        default:
          // Other Prisma errors
          res.status(500).json({
            error: 'Database error',
            message: process.env.NODE_ENV === 'production'
              ? 'A database error occurred. Please try again.'
              : prismaError.message || error.message,
            code: prismaError.code,
          });
      }
    }
    return;
  }

  // Prisma validation errors - check by error message pattern
  if (error.message && error.message.includes('Invalid `prisma')) {
    logErrorWithContext(error, req, 'PRISMA_VALIDATION_ERROR');
    
    if (!res.headersSent) {
      res.status(400).json({
        error: 'Invalid data',
        message: process.env.NODE_ENV === 'production'
          ? 'The provided data is invalid.'
          : error.message,
      });
    }
    return;
  }

  // Unknown errors - comprehensive logging
  logErrorWithContext(error, req, 'UNKNOWN_ERROR');
  
  // Ensure response hasn't been sent
  if (!res.headersSent) {
    const statusCode = (error as any).statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(statusCode).json({
      error: statusCode === 500 && !isDevelopment
        ? 'Internal server error'
        : error.message || 'An unexpected error occurred',
      message: statusCode === 500 && !isDevelopment
        ? 'An unexpected error occurred. Please try again.'
        : error.message || 'An unexpected error occurred',
      ...(isDevelopment && {
        stack: error.stack,
        name: error.name,
        code: (error as any).code,
      }),
    });
  } else {
    // If headers already sent, log warning
    logger.warn('Error handler called but response already sent:', {
      path: req.path,
      method: req.method,
      error: error.message,
      stack: error.stack,
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
