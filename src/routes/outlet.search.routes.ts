import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { successResponse, ApiError, ErrorCodes } from '../middlewares/errorHandler';
import outletSearchService from '../services/outlet.search.service';
import { asyncHandler } from '../utils/route-error-handler';
import { requireTenantId } from '../utils/tenant';

const router = Router();

router.post(
  '/search/advanced',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { filters = {}, options = {} } = req.body;
    const tenantId = requireTenantId(req);

    const results = await outletSearchService.search(tenantId, filters, { ...options, limit: Math.min(options.limit || 50, 100) });
    res.json(successResponse(req, 'Search berhasil', results));
  })
);

router.get(
  '/search/statistics',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const stats = await outletSearchService.getStatistics(tenantId);
    res.json(successResponse(req, 'Statistik berhasil diambil', stats));
  })
);

router.get(
  '/search/fulltext',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { q, limit = 20 } = req.query;
    if (!q) {
      throw new ApiError(ErrorCodes.VALIDATION_ERROR, 'Query wajib diisi', 400);
    }

    const tenantId = requireTenantId(req);
    const results = await outletSearchService.fullTextSearch(tenantId, String(q), Number(limit));
    res.json(successResponse(req, 'Pencarian berhasil', results));
  })
);

router.get(
  '/search/autocomplete',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { prefix = '', field = 'name' } = req.query;
    const tenantId = requireTenantId(req);
    const suggestions = await outletSearchService.getAutocomplete(tenantId, String(prefix), String(field));
    res.json(successResponse(req, 'Autocomplete berhasil', { suggestions }));
  })
);

export default router;
