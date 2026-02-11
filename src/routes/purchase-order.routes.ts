import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { checkInventoryAccess } from '../middlewares/plan-feature-guard';
import { validate } from '../middlewares/validator';
import { requireTenantId, requireUserId } from '../utils/tenant';
import purchaseOrderService from '../services/purchase-order.service';
import { z } from 'zod';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

const createPurchaseOrderSchema = z.object({
  supplierId: z.string(),
  expectedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
  })).min(1),
});

const updatePurchaseOrderSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
  expectedDate: z.string().datetime().optional(),
  receivedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    receivedQuantity: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
  })).optional(),
});

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of purchase orders
 */
router.get(
  '/',
  authGuard,
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as string | undefined,
      supplierId: req.query.supplierId as string | undefined,
    };
    const result = await purchaseOrderService.getPurchaseOrders(tenantId, query);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order details
 */
router.get(
  '/:id',
  authGuard,
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(req.params.id, tenantId);
    res.json(purchaseOrder);
  })
);

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Create new purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - items
 *             properties:
 *               supplierId:
 *                 type: string
 *               expectedDate:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *     responses:
 *       201:
 *         description: Purchase order created
 */
router.post(
  '/',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  checkInventoryAccess,
  validate({ body: createPurchaseOrderSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;

    // Convert expectedDate from string to Date if provided
    const purchaseOrderData = {
      ...req.body,
      expectedDate: req.body.expectedDate ? new Date(req.body.expectedDate) : undefined,
    };

    const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
      tenantId,
      userId,
      purchaseOrderData
    );
    res.status(201).json(purchaseOrder);
  })
);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   put:
 *     summary: Update purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Purchase order updated
 */
router.put(
  '/:id',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  checkInventoryAccess,
  validate({ body: updatePurchaseOrderSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;

    // Convert dates from string to Date if provided
    const updateData = {
      ...req.body,
      expectedDate: req.body.expectedDate ? new Date(req.body.expectedDate) : undefined,
      receivedDate: req.body.receivedDate ? new Date(req.body.receivedDate) : undefined,
    };

    const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(
      req.params.id,
      tenantId,
      userId,
      updateData
    );
    res.json(purchaseOrder);
  })
);

/**
 * @swagger
 * /api/purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive purchase order (update stock)
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receivedDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase order received
 */
router.post(
  '/:id/receive',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const receivedDate = req.body.receivedDate ? new Date(req.body.receivedDate) : undefined;
    const purchaseOrder = await purchaseOrderService.receivePurchaseOrder(
      req.params.id,
      tenantId,
      userId,
      receivedDate
    );
    res.json(purchaseOrder);
  })
);

/**
 * @swagger
 * /api/purchase-orders/{id}/cancel:
 *   post:
 *     summary: Cancel purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order cancelled
 */
router.post(
  '/:id/cancel',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const purchaseOrder = await purchaseOrderService.cancelPurchaseOrder(req.params.id, tenantId);
    res.json(purchaseOrder);
  })
);

export default router;

