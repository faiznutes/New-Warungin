/**
 * Supervisor Store Guard Middleware
 * 
 * Enforces that supervisors can only access stores they are assigned to
 * This prevents supervisors from viewing/modifying data from unauthorized stores
 * 
 * Usage: router.get('/orders', authGuard, supervisorStoreGuard(), orderController)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import logger from '../utils/logger';

export interface SupervisorPermissions {
  allowedStoreIds?: string[];
  role?: string;
}

/**
 * Create a supervisor store guard middleware
 * Validates that the requested store is in the supervisor's allowedStoreIds
 * 
 * For endpoints that require a storeId parameter (e.g., /orders?storeId=xyz)
 */
export const supervisorStoreGuard = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only apply to SUPERVISOR role
      // SUPER_ADMIN and ADMIN_TENANT bypass this check
      if (req.role !== 'SUPERVISOR') {
        return next();
      }

      // Extract storeId from different possible sources
      let storeId: string | null = null;

      // Try query parameter first (most common)
      if (req.query.storeId) {
        const queryStoreId = req.query.storeId;
        if (typeof queryStoreId === 'string') {
          storeId = queryStoreId;
        } else if (Array.isArray(queryStoreId) && typeof queryStoreId[0] === 'string') {
          storeId = queryStoreId[0];
        }
      }

      // Try body (for POST/PUT requests)
      if (!storeId && (req.body?.storeId || req.body?.store_id)) {
        storeId = req.body.storeId || req.body.store_id;
      }

      // Try route params (e.g., /stores/:storeId)
      if (!storeId && req.params?.storeId) {
        storeId = req.params.storeId;
      }

      // If no storeId in request, allow (endpoint doesn't require store filtering)
      if (!storeId) {
        return next();
      }

      // Get supervisor's allowed stores from permissions
      interface UserWithPermissions {
        permissions?: SupervisorPermissions;
      }
      const userPermissions = (req as unknown as UserWithPermissions).permissions || {};
      const allowedStoreIds = (userPermissions as SupervisorPermissions).allowedStoreIds || [];

      // Validate that supervisor is allowed to access this store
      if (!Array.isArray(allowedStoreIds) || !allowedStoreIds.includes(storeId)) {
        logger.warn('Supervisor store access denied', {
          userId: req.userId,
          requestedStoreId: storeId,
          allowedStoreIds,
          path: req.path,
          method: req.method,
        });

        // Return 403 Forbidden with clear error message
        res.status(403).json({
          error: 'Forbidden: Store access not allowed',
          message: `You do not have access to store "${storeId}". Contact admin to get access to this store.`,
          code: 'STORE_ACCESS_DENIED',
          requestedStore: storeId,
          allowedStores: allowedStoreIds,
        });
        return;
      }

      // Supervisor is allowed - continue
      logger.debug('Supervisor store access granted', {
        userId: req.userId,
        storeId,
        path: req.path,
      });

      next();
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error in supervisor store guard', {
        error: err.message,
        userId: req.userId,
        path: req.path,
      });

      // On error, deny access to be safe
      res.status(403).json({
        error: 'Access control check failed',
        message: 'Could not verify store access permissions',
      });
    }
  };
};

/**
 * Alternative: Validate multiple stores (for bulk operations)
 * Usage: router.post('/bulk-order', authGuard, supervisorStoresGuard(), bulkOrderController)
 */
export const supervisorStoresGuard = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.role !== 'SUPERVISOR') {
        return next();
      }

      // Extract storeIds from body (for bulk operations)
      const storeIds: string[] = req.body?.storeIds || req.body?.store_ids || [];

      if (!Array.isArray(storeIds) || storeIds.length === 0) {
        // No store IDs specified, allow
        return next();
      }

      // Get supervisor's allowed stores
      interface UserWithPermissions {
        permissions?: SupervisorPermissions;
      }
      const userPermissions = (req as unknown as UserWithPermissions).permissions || {};
      const allowedStoreIds = (userPermissions as SupervisorPermissions).allowedStoreIds || [];

      // Check all requested stores are in allowed list
      const unauthorizedStores = storeIds.filter(id => !allowedStoreIds.includes(id));

      if (unauthorizedStores.length > 0) {
        logger.warn('Supervisor bulk operation denied on unauthorized stores', {
          userId: req.userId,
          unauthorizedStores,
          allowedStoreIds,
          path: req.path,
        });

        res.status(403).json({
          error: 'Forbidden: Some stores not allowed',
          message: `You do not have access to stores: ${unauthorizedStores.join(', ')}`,
          code: 'STORE_ACCESS_DENIED',
          unauthorizedStores,
          allowedStores: allowedStoreIds,
        });
        return;
      }

      logger.debug('Supervisor bulk store access granted', {
        userId: req.userId,
        storeIds,
        path: req.path,
      });

      next();
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error in supervisor stores guard', {
        error: err.message,
        userId: req.userId,
        path: req.path,
      });

      res.status(403).json({
        error: 'Access control check failed',
        message: 'Could not verify store access permissions',
      });
    }
  };
};

/**
 * Helper: Auto-filter store-specific data for supervisors
 * Instead of denying access, filters results to only show supervisor's stores
 * 
 * Usage:
 * const orders = await getOrders();
 * const filtered = filterByPermissions(orders, req.user?.permissions);
 */
export const filterByPermissions = (
  data: any[],
  permissions: SupervisorPermissions | undefined
): any[] => {
  if (!permissions || !Array.isArray(permissions.allowedStoreIds)) {
    return data;
  }

  return data.filter((item) => {
    const itemStoreId = item.storeId || item.store_id;
    return permissions.allowedStoreIds!.includes(itemStoreId);
  });
};
