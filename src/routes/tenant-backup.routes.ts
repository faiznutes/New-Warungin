/**
 * Tenant Backup Routes
 * Routes for tenants to preview their daily backup reports
 */

import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { requireTenantId } from '../utils/tenant';
import dailyBackupService from '../services/daily-backup.service';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/tenant/backup/preview:
 *   get:
 *     summary: Preview daily backup report (for tenant admin)
 *     tags: [Tenant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/preview',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role || (req as any).user?.role;

    // Only ADMIN_TENANT and SUPERVISOR can preview their backup
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPERVISOR') {
      res.status(403).json({ message: 'Access denied. Tenant admin only.' });
      return;
    }

    const tenantId = requireTenantId(req);

    // Generate preview (without sending email or creating log)
    const report = await dailyBackupService.generateDailyBackupPreview(tenantId);

    res.json({
      report,
      html: dailyBackupService.generateReportHTMLFromData(report),
    });
  })
);

/**
 * @swagger
 * /api/tenant/backup/latest:
 *   get:
 *     summary: Get latest backup log for tenant
 *     tags: [Tenant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/latest',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role || (req as any).user?.role;

    // Only ADMIN_TENANT and SUPERVISOR can view their backup
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPERVISOR') {
      res.status(403).json({ message: 'Access denied. Tenant admin only.' });
      return;
    }

    const tenantId = requireTenantId(req);

    const latestBackup = await dailyBackupService.getLatestBackup(tenantId);

    if (!latestBackup) {
      res.status(404).json({ message: 'No backup found' });
      return;
    }

    res.json(latestBackup);
  })
);

export default router;
