/**
 * Shift Guard Middleware
 * Memastikan kasir/dapur sudah buka shift sebelum akses app
 * SPV bisa akses semua toko tanpa shift requirement
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import storeShiftService from '../services/store-shift.service';
import { requireTenantId } from '../utils/tenant';
import logger from '../utils/logger';

/**
 * Middleware to check if shift is open for CASHIER and KITCHEN
 * SPV can bypass this check
 */
export const requireShift = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const userRole = user?.role;
    const assignedStoreId = user?.assignedStoreId || (req as any).assignedStoreId;

    // SPV can bypass shift check - they can access all stores without shift
    if (userRole === 'SUPERVISOR') {
      return next();
    }

    // ADMIN_TENANT and SUPER_ADMIN can bypass shift check
    if (userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Only CASHIER and KITCHEN need shift check
    if (userRole !== 'CASHIER' && userRole !== 'KITCHEN') {
      return next();
    }

    // If no assigned store, allow access (will be handled by store selector)
    if (!assignedStoreId) {
      return next();
    }

    const tenantId = requireTenantId(req);

    // Check if there's an open shift for this store
    const currentShift = await storeShiftService.getCurrentShift(tenantId, assignedStoreId);

    if (!currentShift) {
      // For CASHIER, redirect to cash-shift page
      if (userRole === 'CASHIER') {
        res.status(403).json({
          error: 'SHIFT_REQUIRED',
          message: 'Shift belum dibuka. Silakan buka shift terlebih dahulu.',
          redirectTo: '/app/cashier/cash-shift',
        });
        return;
      }

      // For KITCHEN, show error but allow access (they can see orders but can't process)
      if (userRole === 'KITCHEN') {
        logger.warn('Kitchen user accessing without open shift', {
          userId: user.id,
          tenantId,
          outletId: assignedStoreId,
        });
        // Allow access but add warning header
        res.setHeader('X-Shift-Warning', 'Shift belum dibuka untuk store ini');
        return next();
      }
    }

    // Attach shift info to request for use in routes
    (req as any).currentShift = currentShift;
    (req as any).storeShiftId = currentShift?.id;

    next();
  } catch (error: any) {
    logger.error('Error in shift guard:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to validate shift status',
    });
    return;
  }
};

/**
 * Middleware to check if shift is open for specific store (for SPV)
 */
export const requireShiftForStore = (outletIdParam: string = 'outletId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const userRole = user?.role;

      // SPV can bypass shift check
      if (userRole === 'SUPERVISOR') {
        return next();
      }

      // ADMIN_TENANT and SUPER_ADMIN can bypass shift check
      if (userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') {
        return next();
      }

      const outletId = req.params[outletIdParam] || req.body[outletIdParam] || req.query[outletIdParam];

      if (!outletId) {
        return next();
      }

      const tenantId = requireTenantId(req);
      const currentShift = await storeShiftService.getCurrentShift(tenantId, outletId);

      if (!currentShift) {
        res.status(403).json({
          error: 'SHIFT_REQUIRED',
          message: 'Shift belum dibuka untuk store ini.',
        });
        return;
      }

      (req as any).currentShift = currentShift;
      (req as any).storeShiftId = currentShift.id;

      next();
    } catch (error: any) {
      logger.error('Error in shift guard for store:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate shift status for store',
      });
      return;
    }
  };
};
