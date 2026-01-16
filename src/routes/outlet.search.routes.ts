import { Router, Request, Response } from 'express';
import { authGuard, roleGuard, subscriptionGuard, asyncHandler } from '../middleware';
import outletSearchService from '../services/outlet.search.service';
import { successResponse, errorResponse } from '../middleware/errorHandler';

const router = Router();

router.post(
  '/search/advanced',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  subscriptionGuard,
  asyncHandler(async (req: Request, res: Response) => {
    const { filters = {}, options = {} } = req.body;
    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

    const results = await outletSearchService.search(tenantId, filters, { ...options, limit: Math.min(options.limit || 50, 100) });
    res.json(successResponse(results, 'Search berhasil'));
  })
);

router.get(
  '/search/statistics',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
    const stats = await outletSearchService.getStatistics(tenantId);
    res.json(successResponse(stats, 'Statistik berhasil diambil'));
  })
);

router.get(
  '/search/fulltext',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json(errorResponse('Query wajib diisi', 'VALIDATION_ERROR'));

    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
    const results = await outletSearchService.fullTextSearch(tenantId, String(q), Number(limit));
    res.json(successResponse(results, 'Pencarian berhasil'));
  })
);

router.get(
  '/search/autocomplete',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: Request, res: Response) => {
    const { prefix = '', field = 'name' } = req.query;
    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
    const suggestions = await outletSearchService.getAutocomplete(tenantId, String(prefix), String(field));
    res.json(successResponse({ suggestions }, 'Autocomplete berhasil'));
  })
);

export default router;

