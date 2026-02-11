/**
 * Stock Alert Routes
 * API endpoints for stock alerts and notifications
 */

import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { checkInventoryAccess } from '../middlewares/plan-feature-guard';
import { requireTenantId } from '../utils/tenant';
import stockAlertService from '../services/stock-alert.service';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/stock-alerts/low-stock:
 *   get:
 *     summary: Get low stock products
 *     tags: [Stock Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low stock products
 */
router.get(
  '/low-stock',
  authGuard,
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const products = await stockAlertService.getLowStockProducts(tenantId);
    res.json(products);
  })
);

/**
 * @swagger
 * /api/stock-alerts/stats:
 *   get:
 *     summary: Get stock alert statistics
 *     tags: [Stock Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock alert statistics
 */
router.get(
  '/stats',
  authGuard,
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const stats = await stockAlertService.getStockAlertStats(tenantId);
    res.json(stats);
  })
);

/**
 * @swagger
 * /api/stock-alerts/send:
 *   post:
 *     summary: Check and send stock alerts
 *     tags: [Stock Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock alerts sent
 */
router.post(
  '/send',
  authGuard,
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await stockAlertService.checkAndSendStockAlerts(tenantId);
    res.json(result);
  })
);

export default router;

