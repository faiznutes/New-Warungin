import { Router, Request, Response } from 'express';
import { authGuard, roleGuard, subscriptionGuard } from '../middlewares/auth';
import { asyncHandler, successResponse, ApiError, ErrorCodes } from '../middleware/errorHandler';
import { createRateLimiter, sanitizeInput } from '../middleware/security';
import importExportService from '../services/outlet.import-export.service';

const router = Router();

router.get(
  '/export/csv',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  createRateLimiter('EXPORT'),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
    const filters = req.query;

    const result = await importExportService.exportToCSV(tenantId, filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  })
);

router.post(
  '/import/csv',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  createRateLimiter('IMPORT'),
  sanitizeInput,
  asyncHandler(async (req: Request, res: Response) => {
    const { csvContent } = req.body;
    if (!csvContent) {
      throw new ApiError(ErrorCodes.VALIDATION_ERROR, 'CSV wajib diisi', 400);
    }

    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
    const result = await importExportService.importFromCSV(tenantId, csvContent);
    res.json(successResponse(req, 'Import berhasil', result));
  })
);

router.get(
  '/export/json',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  createRateLimiter('EXPORT'),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
    const format = req.query.format as 'detailed' | 'summary' || 'detailed';

    const result = await importExportService.exportToJSON(tenantId, format);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.json(result.data);
  })
);

export default router;
