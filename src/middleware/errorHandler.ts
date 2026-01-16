import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

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

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = ErrorStatusCodes[code] || 500,
    public details?: any
  ) {
    super(message);
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
 * Error Response Helper
 */
export const errorResponse = (req: Request, error: ApiError | Error): ApiResponse => {
  if (error instanceof ApiError) {
    return {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    };
  }

  // Handle unknown errors
  return {
    success: false,
    message: 'An unexpected error occurred',
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message || 'Unknown error',
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  };
};

/**
 * Error Handling Middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error: ApiError;

  // Handle known API errors
  if (err instanceof ApiError) {
    error = err;
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    error = new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      400,
      { fields: err.details }
    );
  }
  // Handle Prisma errors
  else if (err.code === 'P2002') {
    error = new ApiError(
      ErrorCodes.DUPLICATE_ENTRY,
      'Duplicate entry detected',
      409,
      { field: err.meta?.target?.[0] }
    );
  } else if (err.code === 'P2025') {
    error = new ApiError(
      ErrorCodes.NOT_FOUND,
      'Record not found',
      404
    );
  }
  // Handle custom validation messages from outlet service
  else if (err.message?.includes('Nama outlet')) {
    error = new ApiError(
      ErrorCodes.INVALID_INPUT,
      err.message,
      400,
      { field: 'name' }
    );
  } else if (err.message?.includes('Nomor telepon')) {
    error = new ApiError(
      ErrorCodes.INVALID_INPUT,
      err.message,
      400,
      { field: 'phone' }
    );
  } else if (err.message?.includes('Alamat')) {
    error = new ApiError(
      ErrorCodes.INVALID_INPUT,
      err.message,
      400,
      { field: 'address' }
    );
  } else if (err.message?.includes('Shift') || err.message?.includes('shift')) {
    error = new ApiError(
      ErrorCodes.INVALID_INPUT,
      err.message,
      400,
      { field: 'shiftConfig' }
    );
  } else if (err.message?.includes('Jam operasional') || err.message?.includes('Hari')) {
    error = new ApiError(
      ErrorCodes.INVALID_INPUT,
      err.message,
      400,
      { field: 'operatingHours' }
    );
  } else if (err.message?.includes('tidak memiliki akses')) {
    error = new ApiError(
      ErrorCodes.PERMISSION_DENIED,
      err.message,
      403
    );
  }
  // Handle Outlet not found
  else if (err.message?.includes('Outlet tidak ditemukan')) {
    error = new ApiError(
      ErrorCodes.OUTLET_NOT_FOUND,
      err.message,
      404
    );
  }
  // Default to internal error
  else {
    error = new ApiError(
      ErrorCodes.INTERNAL_ERROR,
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'Unknown error',
      500
    );
  }

  // Log error
  logger.error('API Error', {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    details: error.details,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
  });

  // Send response
  res.status(error.statusCode).json(errorResponse(req, error));
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

/**
 * Request Logging Middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Hook into res.send to log response
  const originalSend = res.send.bind(res);
  res.send = function (data: any) {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    return originalSend(data);
  };

  next();
};

/**
 * Request Validation Middleware Factory
 */
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const details = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        'Request validation failed',
        400,
        details
      );
    }

    req.body = value;
    next();
  };
};

export default {
  errorHandler,
  asyncHandler,
  requestLogger,
  validateRequest,
  successResponse,
  errorResponse,
  ApiError,
  ErrorCodes,
};
