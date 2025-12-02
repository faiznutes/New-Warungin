import { Request } from 'express';
import { AuthRequest } from '../middlewares/auth';
import logger from './logger';

/**
 * Get tenantId from request
 * For SUPER_ADMIN: uses tenantId from query parameter
 * For other roles: uses tenantId from user object
 */
export const getTenantId = (req: Request | AuthRequest): string | null => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const role = user?.role || authReq.role;
  
  // SUPER_ADMIN can specify tenantId via query parameter
  if (role === 'SUPER_ADMIN') {
    const queryTenantId = req.query.tenantId as string;
    if (queryTenantId) {
      return queryTenantId;
    }
    // If no tenantId in query, return null (will cause error)
    return null;
  }
  
  // For other roles, use tenantId from user
  // Check both req.user.tenantId and req.tenantId (from auth middleware)
  const tenantId = user?.tenantId || authReq.tenantId;
  
  if (!tenantId) {
    logger.error('Tenant ID not found in request', {
      role,
      hasUser: !!user,
      userTenantId: user?.tenantId,
      reqTenantId: authReq.tenantId,
      userId: user?.id,
    });
  }
  
  return tenantId || null;
};

/**
 * Get userId from request
 */
export const requireUserId = (req: Request | AuthRequest): string => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const userId = user?.id || authReq.userId;
  if (!userId) {
    throw new Error('User ID is required. Please authenticate first.');
  }
  return userId;
};

/**
 * Validate that tenantId exists (required for all roles except SUPER_ADMIN without selected tenant)
 */
export const requireTenantId = (req: Request | AuthRequest): string => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  const role = user?.role || authReq.role;
  const tenantId = getTenantId(req);
  
  if (!tenantId) {
    // For SUPER_ADMIN, provide more helpful message
    if (role === 'SUPER_ADMIN') {
      throw new Error('Tenant ID is required. Please select a tenant first.');
    }
    // For other roles, this should not happen (tenantId should be in token)
    throw new Error('Tenant ID is required. Please contact administrator if this error persists.');
  }
  
  return tenantId;
};

