import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import retentionService from '../services/retention.service';
import { requireTenantId } from '../utils/tenant';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { logAction } from '../middlewares/audit-logger';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

const applyRetentionSchema = z.object({
  days: z.number().int().positive().optional().default(730), // 2 years default for SUPER_ADMIN
});

const applyAllRetentionSchema = z.object({
  policy: z.object({
    orders: z.number().int().positive().optional(),
    transactions: z.number().int().positive().optional(),
    reports: z.number().int().positive().optional(),
    auditLogs: z.number().int().positive().optional(),
    contactSubmissions: z.number().int().positive().optional(),
    demoRequests: z.number().int().positive().optional(),
  }).optional(),
});

/**
 * @swagger
 * /api/retention/stats:
 *   get:
 *     summary: Get retention policy statistics
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: policy
 *         schema:
 *           type: string
 *         description: JSON string of retention policy
 *     responses:
 *       200:
 *         description: Retention statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     eligible: { type: integer }
 *                 transactions:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     eligible: { type: integer }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/stats',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can view retention stats
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can view retention statistics' });
        return;
      }
      
      const tenantId = req.query.tenantId as string || requireTenantId(req);
      const policy = req.query.policy ? JSON.parse(req.query.policy as string) : undefined;
      const stats = await retentionService.getRetentionStats(tenantId, policy);
      res.json(stats);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/orders:
 *   post:
 *     summary: Apply retention policy for orders
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 default: 365
 *                 description: Number of days to retain orders
 *     responses:
 *       200:
 *         description: Retention policy applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       403:
 *         description: Forbidden - Only admin can apply retention
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/orders',
  authGuard,
  validate({ body: applyRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { days = 730 } = req.body; // Default 2 years for SUPER_ADMIN
      const maxDays = 730; // 2 years max
      const retentionDays = days && days <= maxDays ? days : maxDays;
      
      const tenantId = req.body.tenantId || requireTenantId(req);
      const deletedCount = await retentionService.applyOrdersRetention(tenantId, retentionDays);
      await logAction(req, 'RETENTION', 'orders', null, { days, deletedCount }, 'SUCCESS');
      res.json({
        message: `Deleted ${deletedCount} orders based on retention policy`,
        deletedCount,
      });
    } catch (error: unknown) {
      await logAction(req, 'RETENTION', 'orders', null, { error: (error as Error).message }, 'FAILED', (error as Error).message);
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/transactions:
 *   post:
 *     summary: Apply retention policy for transactions
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 default: 365
 *     responses:
 *       200:
 *         description: Retention policy applied successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/transactions',
  authGuard,
  validate({ body: applyRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { days = 730 } = req.body; // Default 2 years
      const maxDays = 730; // 2 years max
      const retentionDays = days && days <= maxDays ? days : maxDays;
      
      const tenantId = req.body.tenantId || requireTenantId(req);
      const deletedCount = await retentionService.applyTransactionsRetention(tenantId, retentionDays);
      await logAction(req, 'RETENTION', 'transactions', null, { days, deletedCount }, 'SUCCESS');
      res.json({
        message: `Deleted ${deletedCount} transactions based on retention policy`,
        deletedCount,
      });
    } catch (error: unknown) {
      await logAction(req, 'RETENTION', 'transactions', null, { error: (error as Error).message }, 'FAILED', (error as Error).message);
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/reports:
 *   post:
 *     summary: Apply retention policy for reports
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 default: 180
 *     responses:
 *       200:
 *         description: Retention policy applied successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/reports',
  authGuard,
  validate({ body: applyRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { days = 730 } = req.body; // Default 2 years
      const maxDays = 730; // 2 years max
      const retentionDays = days && days <= maxDays ? days : maxDays;
      
      const tenantId = req.body.tenantId || requireTenantId(req);
      const deletedCount = await retentionService.applyReportsRetention(tenantId, retentionDays);
      res.json({
        message: `Deleted ${deletedCount} reports based on retention policy`,
        deletedCount,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/audit-logs:
 *   post:
 *     summary: Apply retention policy for audit logs
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 default: 90
 *     responses:
 *       200:
 *         description: Retention policy applied successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/audit-logs',
  authGuard,
  validate({ body: applyRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tenantId = requireTenantId(req);
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { days = 730 } = req.body; // Default 2 years
      const maxDays = 730; // 2 years max
      const retentionDays = days && days <= maxDays ? days : maxDays;
      
      const tenantId = req.body.tenantId || requireTenantId(req);
      const deletedCount = await retentionService.applyAuditLogsRetention(tenantId, retentionDays);
      res.json({
        message: `Deleted ${deletedCount} audit logs based on retention policy`,
        deletedCount,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/contact-submissions:
 *   post:
 *     summary: Apply retention policy for contact submissions
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 default: 90
 *     responses:
 *       200:
 *         description: Retention policy applied successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/contact-submissions',
  authGuard,
  validate({ body: applyRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { days = 90 } = req.body;
      
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { days = 730 } = req.body; // Default 2 years
      const maxDays = 730; // 2 years max
      const retentionDays = days && days <= maxDays ? days : maxDays;
      
      const deletedCount = await retentionService.applyContactSubmissionsRetention(retentionDays);
      res.json({
        message: `Deleted ${deletedCount} contact submissions based on retention policy`,
        deletedCount,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/demo-requests:
 *   post:
 *     summary: Apply retention policy for demo requests
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 default: 90
 *     responses:
 *       200:
 *         description: Retention policy applied successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/demo-requests',
  authGuard,
  validate({ body: applyRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { days = 90 } = req.body;
      
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { days = 730 } = req.body; // Default 2 years
      const maxDays = 730; // 2 years max
      const retentionDays = days && days <= maxDays ? days : maxDays;
      
      const deletedCount = await retentionService.applyDemoRequestsRetention(retentionDays);
      res.json({
        message: `Deleted ${deletedCount} demo requests based on retention policy`,
        deletedCount,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

/**
 * @swagger
 * /api/retention/all:
 *   post:
 *     summary: Apply all retention policies
 *     tags: [Retention]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policy:
 *                 type: object
 *                 properties:
 *                   orders:
 *                     type: integer
 *                     minimum: 1
 *                   transactions:
 *                     type: integer
 *                     minimum: 1
 *                   reports:
 *                     type: integer
 *                     minimum: 1
 *                   auditLogs:
 *                     type: integer
 *                     minimum: 1
 *                   contactSubmissions:
 *                     type: integer
 *                     minimum: 1
 *                   demoRequests:
 *                     type: integer
 *                     minimum: 1
 *     responses:
 *       200:
 *         description: All retention policies applied successfully
 *       403:
 *         description: Forbidden
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/all',
  authGuard,
  validate({ body: applyAllRetentionSchema }),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      const { policy } = req.body;
      
      // Only SUPER_ADMIN can apply retention (2 years back)
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can apply retention policies' });
        return;
      }
      
      // Ensure max 2 years (730 days) for all retention operations
      const defaultPolicy = {
        orders: 730,
        transactions: 730,
        reports: 730,
        auditLogs: 730,
        contactSubmissions: 730,
        demoRequests: 730,
      };
      
      const finalPolicy = policy ? {
        orders: Math.min(policy.orders || 730, 730),
        transactions: Math.min(policy.transactions || 730, 730),
        reports: Math.min(policy.reports || 730, 730),
        auditLogs: Math.min(policy.auditLogs || 730, 730),
        contactSubmissions: Math.min(policy.contactSubmissions || 730, 730),
        demoRequests: Math.min(policy.demoRequests || 730, 730),
      } : defaultPolicy;
      
      const tenantId = req.body.tenantId || requireTenantId(req);
      const result = await retentionService.applyAllRetentionPolicies(tenantId, finalPolicy);
      res.json({
        message: 'Applied all retention policies',
        ...result,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'RETENTION');
    }
  }
);

export default router;

