import { Router, Request, Response } from 'express';
import OutletService from '../services/outlet.service';
import { asyncHandler, successResponse, ApiError, ErrorCodes } from '../middleware/errorHandler';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { requireTenantId } from '../utils/tenant';
import logger from '../utils/logger';

const router = Router();

// Bulk update
router.post('/bulk/update', authGuard, roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'), subscriptionGuard, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const { outlets } = req.body;
    if (!Array.isArray(outlets) || outlets.length === 0) throw new ApiError(ErrorCodes.INVALID_INPUT, 'outlets harus array', 400);
    if (outlets.length > 100) throw new ApiError(ErrorCodes.INVALID_INPUT, 'Max 100 items', 400);
    
    const results = { success: 0, failed: 0, errors: [], updated: [] };
    for (const outlet of outlets) {
      try {
        if (!outlet.id) { results.errors.push({ error: 'ID required' }); results.failed++; continue; }
        const updated = await OutletService.updateOutlet(tenantId, outlet.id, outlet);
        results.updated.push(updated); results.success++;
      } catch (error: any) {
        results.errors.push({ outletId: outlet.id, error: error.message }); results.failed++;
      }
    }
    res.json(successResponse(req, `Bulk update: ${results.success} ok, ${results.failed} fail`, results));
  })
);

// Bulk delete
router.post('/bulk/delete', authGuard, roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'), subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const { outletIds } = req.body;
    if (!Array.isArray(outletIds) || outletIds.length === 0) throw new ApiError(ErrorCodes.INVALID_INPUT, 'outletIds required', 400);
    if (outletIds.length > 100) throw new ApiError(ErrorCodes.INVALID_INPUT, 'Max 100 items', 400);
    
    const results = { success: 0, failed: 0, deleted: [], errors: [] };
    for (const outletId of outletIds) {
      try {
        const deleted = await OutletService.deleteOutlet(tenantId, outletId);
        results.deleted.push(deleted); results.success++;
      } catch (error: any) {
        results.errors.push({ outletId, error: error.message }); results.failed++;
      }
    }
    res.json(successResponse(req, `Bulk delete: ${results.success} ok, ${results.failed} fail`, results));
  })
);

export default router;
