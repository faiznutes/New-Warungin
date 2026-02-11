/**
 * Audit Middleware
 * Automatically logs API requests and data changes
 */

import { Request, Response, NextFunction } from 'express';
// import advancedAuditService from '../services/advanced-audit.service';
import { getTenantId } from '../utils/tenant';
import logger from '../utils/logger';

/**
 * Middleware to log API requests
 */
export const auditMiddleware = (action: string, resource: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Audit service removed
    next();
  };
};

/**
 * Middleware to log data changes (for PUT/PATCH/DELETE)
 */
export const auditDataChangeMiddleware = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Audit service removed
    next();
  };
};

