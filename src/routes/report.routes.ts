import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import reportService from '../services/report.service';
import { requireTenantId } from '../utils/tenant';
import { checkExportReportsAddon } from '../middlewares/addon-guard';
import logger from '../utils/logger';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/reports/global:
 *   get:
 *     summary: Get global reports (Super Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get(
  '/global',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only Super Admin can access global reports
      if (!user || user.role !== 'SUPER_ADMIN') {
        const error = new Error('Access denied. Super Admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Super Admin only.', 'GLOBAL_REPORT');
        return;
      }

      const { startDate, endDate } = req.query;
      
      // Validate date format if provided
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          const error = new Error('Invalid startDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid startDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        start.setHours(0, 0, 0, 0);
      }
      
      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          const error = new Error('Invalid endDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid endDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        end.setHours(23, 59, 59, 999);
      }
      
      // Validate date range
      if (start && end && start > end) {
        const error = new Error('startDate must be before or equal to endDate.');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'startDate must be before or equal to endDate.', 'GLOBAL_REPORT');
        return;
      }

      const report = await reportService.getGlobalReport(start, end);
      return res.json(report);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to load global report', 'GLOBAL_REPORT');
    }
  }
);

/**
 * @swagger
 * /api/reports/tenant:
 *   get:
 *     summary: Get tenant-specific reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [sales, products, customers]
 */
router.get(
  '/tenant',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    let tenantId: string | undefined;
    try {
      tenantId = requireTenantId(req);
      const { startDate, endDate, reportType, period, format } = req.query;

      // Check if export format is requested (requires EXPORT_REPORTS addon)
      if (format && (format === 'CSV' || format === 'PDF' || format === 'EXCEL')) {
        // Check addon for export
        const addons = await (await import('../services/addon.service')).default.getTenantAddons(tenantId);
        const hasExportAddon = addons.some(
          (addon) => addon.addonType === 'EXPORT_REPORTS' && addon.status === 'active'
        );
        
        if (!hasExportAddon) {
          const error = new Error('Export Laporan addon is required to export reports');
          (error as any).statusCode = 403;
          handleRouteError(res, error, 'Export Laporan addon is required to export reports', 'EXPORT_REPORT');
          return;
        }
      }

      // Validate date format if provided
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          const error = new Error('Invalid startDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid startDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        start.setHours(0, 0, 0, 0);
      }
      
      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          const error = new Error('Invalid endDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid endDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        end.setHours(23, 59, 59, 999);
      }
      
      // Validate date range
      if (start && end && start > end) {
        const error = new Error('startDate must be before or equal to endDate.');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'startDate must be before or equal to endDate.', 'GLOBAL_REPORT');
        return;
      }
      
      const type = (reportType as string) || 'sales';
      const periodType = (period as string) || 'all';

      // Use new report service methods
      let report: any;
      switch (type) {
        case 'sales':
          report = await reportService.generateSalesReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
            format: format as any,
          });
          break;
        case 'products':
          report = await reportService.generateProductReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
            format: format as any,
          });
          break;
        case 'customers':
          report = await reportService.generateCustomerReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
            format: format as any,
          });
          break;
        case 'inventory':
          report = await reportService.generateInventoryReport(tenantId, {
            format: format as any,
          });
          break;
        case 'financial':
          report = await reportService.generateFinancialReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
            format: format as any,
          });
          break;
        default:
          // Fallback to old method
          report = await reportService.getTenantReport(tenantId, start, end, type);
      }

      return res.json(report);
    } catch (error: unknown) {
      const { handleRouteError } = await import('../utils/route-error-handler');
      handleRouteError(res, error, 'Failed to load tenant report', 'TENANT_REPORT');
    }
  }
);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get tenant reports (alias for /tenant)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    let tenantId: string | undefined;
    try {
      tenantId = requireTenantId(req);
      const { startDate, endDate, type, period } = req.query;

      // Validate date format if provided
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          const error = new Error('Invalid startDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid startDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        start.setHours(0, 0, 0, 0);
      }
      
      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          const error = new Error('Invalid endDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid endDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        end.setHours(23, 59, 59, 999);
      }
      
      // Validate date range
      if (start && end && start > end) {
        const error = new Error('startDate must be before or equal to endDate.');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'startDate must be before or equal to endDate.', 'GLOBAL_REPORT');
        return;
      }
      
      const reportType = (type as string) || 'sales';
      const periodType = (period as string) || 'all';

      // Use new report service methods for consistency
      let report: any;
      switch (reportType) {
        case 'sales':
          report = await reportService.generateSalesReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
          });
          break;
        case 'products':
          report = await reportService.generateProductReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
          });
          break;
        case 'customers':
          report = await reportService.generateCustomerReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
          });
          break;
        case 'inventory':
          report = await reportService.generateInventoryReport(tenantId, {});
          break;
        case 'financial':
          report = await reportService.generateFinancialReport(tenantId, {
            startDate: start?.toISOString(),
            endDate: end?.toISOString(),
            period: periodType as any,
          });
          break;
        default:
          // Fallback to old method for backward compatibility
          report = await reportService.getTenantReport(tenantId, start, end, reportType);
      }

      return res.json(report);
    } catch (error: unknown) {
      const { handleRouteError } = await import('../utils/route-error-handler');
      handleRouteError(res, error, 'Failed to load report', 'REPORT');
    }
  }
);

/**
 * @swagger
 * /api/reports/global/export/pdf:
 *   get:
 *     summary: Export global report as PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/global/export/pdf',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only Super Admin can access global reports
      if (user.role !== 'SUPER_ADMIN') {
        const error = new Error('Access denied. Super Admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Super Admin only.', 'EXPORT_GLOBAL_REPORT');
        return;
      }

      const { startDate, endDate } = req.query;
      
      // Validate date format if provided
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          const error = new Error('Invalid startDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid startDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        start.setHours(0, 0, 0, 0);
      }
      
      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          const error = new Error('Invalid endDate format. Use YYYY-MM-DD.');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Invalid endDate format. Use YYYY-MM-DD.', 'GLOBAL_REPORT');
          return;
        }
        end.setHours(23, 59, 59, 999);
      }
      
      // Validate date range
      if (start && end && start > end) {
        const error = new Error('startDate must be before or equal to endDate.');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'startDate must be before or equal to endDate.', 'GLOBAL_REPORT');
        return;
      }

      const report = await reportService.getGlobalReport(start, end);
      
      // Generate HTML for PDF (this method is safe and won't throw)
      const html = reportService.generateGlobalReportPDF(report, start, end);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="laporan-global-${startDate || 'all'}-${endDate || 'all'}.html"`);
      return res.send(html);
    } catch (error: unknown) {
      const { handleRouteError } = await import('../utils/route-error-handler');
      handleRouteError(res, error, 'Failed to export PDF', 'EXPORT_PDF');
    }
  }
);

export default router;

