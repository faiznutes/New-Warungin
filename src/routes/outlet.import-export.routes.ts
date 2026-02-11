import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { successResponse, ApiError, ErrorCodes } from '../middlewares/errorHandler';
import { createRateLimiter, sanitizeInput } from '../middlewares/security';
import importExportService from '../services/outlet.import-export.service';
import { asyncHandler } from '../utils/route-error-handler';
import { requireTenantId } from '../utils/tenant';

const router = Router();

router.get(
  '/export/csv',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  createRateLimiter('EXPORT'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { csvContent } = req.body;
    if (!csvContent) {
      throw new ApiError(ErrorCodes.VALIDATION_ERROR, 'CSV wajib diisi', 400);
    }

    const tenantId = requireTenantId(req);
    const result = await importExportService.importFromCSV(tenantId, csvContent);
    res.json(successResponse(req, 'Import berhasil', result));
  })
);

router.get(
  '/export/json',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPER_ADMIN'),
  createRateLimiter('EXPORT'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const format = req.query.format as 'detailed' | 'summary' || 'detailed';

    const result = await importExportService.exportToJSON(tenantId, format);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.json(result.data);
  })
);

export default router;
