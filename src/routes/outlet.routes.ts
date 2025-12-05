import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import outletService from '../services/outlet.service';
import { validate } from '../middlewares/validator';
import { requireTenantId } from '../utils/tenant';
import { z } from 'zod';
import { handleRouteError } from '../utils/route-error-handler';
import { AuthRequest } from '../middlewares/auth';
import logger from '../utils/logger';

const router = Router();

const createOutletSchema = z.object({
  name: z.string().min(1, 'Nama outlet wajib diisi'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const updateOutletSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * @swagger
 * /api/outlets:
 *   get:
 *     summary: Get all outlets for current tenant
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of outlets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Outlet'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      // Get tenantId with better error handling
      const authReq = req as AuthRequest;
      const tenantId = requireTenantId(req);
      
      // Log for debugging
      logger.debug('Getting outlets', {
        tenantId,
        role: authReq.role,
        userId: authReq.userId,
        hasUser: !!authReq.user,
        userTenantId: authReq.user?.tenantId,
        reqTenantId: authReq.tenantId,
      });
      
      const outlets = await outletService.getOutlets(tenantId);
      
      // Log response for debugging
      logger.debug('GET /outlets response', {
        tenantId,
        outletsCount: outlets.length,
        outlets: outlets.map((o: any) => ({ id: o.id, name: o.name, isActive: o.isActive })),
      });
      
      // Get outlet limit info
      const { getTenantPlanFeatures } = await import('../services/plan-features.service');
      const features = await getTenantPlanFeatures(tenantId);
      const outletLimit = features.limits.outlets;
      const activeOutletsCount = outlets.filter((o: any) => o.isActive).length;
      
      const response = { 
        data: outlets,
        limit: {
          max: outletLimit,
          current: activeOutletsCount,
          remaining: outletLimit === -1 ? -1 : Math.max(0, outletLimit - activeOutletsCount),
          isUnlimited: outletLimit === -1,
        }
      };
      
      // Log final response
      logger.debug('GET /outlets final response', {
        tenantId,
        responseDataCount: response.data.length,
        responseLimit: response.limit,
      });
      
      res.json(response);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get outlets', 'GET_OUTLETS');
    }
  }
);

/**
 * @swagger
 * /api/outlets/auto-transfer:
 *   post:
 *     summary: Setup automatic stock transfer between outlets (Multi-Outlet Advanced)
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/auto-transfer',
  authGuard,
  subscriptionGuard,
  validate({
    body: z.object({
      fromOutletId: z.string(),
      toOutletId: z.string(),
      productId: z.string(),
      threshold: z.number().positive(), // Auto transfer when stock below this
      transferQuantity: z.number().positive(),
      enabled: z.boolean().default(true),
    }),
  }),
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      
      // Check if MULTI_OUTLET_ADVANCED addon is active
      const addonService = (await import('../services/addon.service')).default;
      const addons = await addonService.getTenantAddons(tenantId);
      const hasMultiOutletAdvanced = addons.some(
        (addon: any) => addon.addonType === 'MULTI_OUTLET_ADVANCED' && addon.status === 'active'
      );
      
      if (!hasMultiOutletAdvanced) {
        const error = new Error('MULTI_OUTLET_ADVANCED addon is required for automatic stock transfers');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'MULTI_OUTLET_ADVANCED addon is required for automatic stock transfers', 'CREATE_AUTO_TRANSFER');
        return;
      }

      const autoTransfer = await outletService.createAutoTransfer(tenantId, req.body);
      res.status(201).json({ data: autoTransfer });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to create auto transfer', 'CREATE_AUTO_TRANSFER');
    }
  }
);

/**
 * @swagger
 * /api/outlets/sync:
 *   post:
 *     summary: Sync stock across all outlets (Multi-Outlet Advanced)
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/sync',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      
      // Check if MULTI_OUTLET_ADVANCED addon is active
      const addonService = (await import('../services/addon.service')).default;
      const addons = await addonService.getTenantAddons(tenantId);
      const hasMultiOutletAdvanced = addons.some(
        (addon: any) => addon.addonType === 'MULTI_OUTLET_ADVANCED' && addon.status === 'active'
      );
      
      if (!hasMultiOutletAdvanced) {
        const error = new Error('MULTI_OUTLET_ADVANCED addon is required for real-time synchronization');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'MULTI_OUTLET_ADVANCED addon is required for real-time synchronization', 'SYNC_OUTLETS');
        return;
      }

      const syncResult = await outletService.syncAllOutlets(tenantId);
      res.json({ data: syncResult });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to sync outlets', 'SYNC_OUTLETS');
    }
  }
);

/**
 * @swagger
 * /api/outlets/{id}/reports:
 *   get:
 *     summary: Get reports for specific outlet (Multi-Outlet Advanced)
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/reports',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const outletId = req.params.id;
      
      // Check if MULTI_OUTLET_ADVANCED addon is active
      const addonService = (await import('../services/addon.service')).default;
      const addons = await addonService.getTenantAddons(tenantId);
      const hasMultiOutletAdvanced = addons.some(
        (addon: any) => addon.addonType === 'MULTI_OUTLET_ADVANCED' && addon.status === 'active'
      );
      
      if (!hasMultiOutletAdvanced) {
        const error = new Error('MULTI_OUTLET_ADVANCED addon is required for outlet-specific reports');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'MULTI_OUTLET_ADVANCED addon is required for outlet-specific reports', 'GET_OUTLET_REPORTS');
        return;
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const reports = await outletService.getOutletReports(tenantId, outletId, {
        startDate,
        endDate,
      });
      
      res.json({ data: reports });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get outlet reports', 'GET_OUTLET_REPORTS');
    }
  }
);

/**
 * @swagger
 * /api/outlets/{id}:
 *   get:
 *     summary: Get outlet by ID
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *     responses:
 *       200:
 *         description: Outlet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const outlet = await outletService.getOutlet(tenantId, req.params.id);
      res.json({ data: outlet });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get outlet', 'GET_OUTLET');
    }
  }
);

/**
 * @swagger
 * /api/outlets:
 *   post:
 *     summary: Create new outlet
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Outlet Pusat
 *               address:
 *                 type: string
 *                 example: "Jl. Raya No. 123"
 *               phone:
 *                 type: string
 *                 example: "0851-5504-3133"
 *     responses:
 *       201:
 *         description: Outlet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authGuard,
  subscriptionGuard,
  validate({ body: createOutletSchema }),
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const outlet = await outletService.createOutlet(tenantId, req.body);
      res.status(201).json({ data: outlet });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'OUTLET');
    }
  }
);

/**
 * @swagger
 * /api/outlets/{id}:
 *   put:
 *     summary: Update outlet
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Outlet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Outlet'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/:id',
  authGuard,
  subscriptionGuard,
  validate({ body: updateOutletSchema }),
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const outlet = await outletService.updateOutlet(tenantId, req.params.id, req.body);
      res.json({ data: outlet });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'OUTLET');
    }
  }
);

/**
 * @swagger
 * /api/outlets/{id}:
 *   delete:
 *     summary: Delete outlet (soft delete if has orders)
 *     tags: [Outlets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *     responses:
 *       200:
 *         description: Outlet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Outlet berhasil dihapus"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  '/:id',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      await outletService.deleteOutlet(tenantId, req.params.id);
      res.json({ message: 'Outlet berhasil dihapus' });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process request', 'OUTLET');
    }
  }
);


export default router;

