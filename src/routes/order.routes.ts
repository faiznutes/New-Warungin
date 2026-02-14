import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { supervisorStoreGuard } from '../middlewares/supervisor-store-guard';
import orderService from '../services/order.service';
import { createOrderSchema, updateOrderStatusSchema, getOrdersQuerySchema, updateOrderSchema } from '../validators/order.validator';
import { validate } from '../middlewares/validator';
import { requireTenantId } from '../utils/tenant';
import { z } from 'zod';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';
import { requireShift } from '../middlewares/shift-guard';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  supervisorStoreGuard(),
  subscriptionGuard,
  validate({ query: getOrdersQuerySchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.user!.role;
    const userPermissions = req.user!.permissions;
    const result = await orderService.getOrders(tenantId, req.query as any, userRole, userPermissions);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/orders/bulk-update-kitchen:
 *   put:
 *     summary: Bulk update kitchen status for multiple orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/bulk-update-kitchen',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'KITCHEN'),
  subscriptionGuard,
  validate({
    body: z.object({
      orderIds: z.array(z.string()).min(1),
      status: z.enum(['PENDING', 'COOKING', 'READY', 'SERVED'])
    })
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const { orderIds, status } = req.body;

    const results = await orderService.bulkUpdateKitchenStatus(tenantId, orderIds, status);
    res.json(results);
  })
);

/**
 * @swagger
 * /api/orders/stats/summary:
 *   get:
 *     summary: Get order statistics
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 averageOrderValue:
 *                   type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/stats/summary',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const { startDate, endDate } = req.query;
    const stats = await orderService.getOrderStats(
      tenantId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(stats);
  })
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const order = await orderService.getOrderById(req.params.id, tenantId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  })
);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               customerId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  subscriptionGuard,
  requireShift,
  validate({ body: createOrderSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.user!.id;
    const userRole = req.user!.role;
    // Get idempotency key from header (X-Idempotency-Key)
    const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;
    const order = await orderService.createOrder(req.body, userId, tenantId, idempotencyKey, userRole);
    res.status(201).json(order);
  })
);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, COMPLETED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/:id',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'), // Double check? This seems restrictive.
  requireShift,
  validate({ body: updateOrderSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const order = await orderService.getOrderById(req.params.id, tenantId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Pass all validated data to updateOrder service
    const updatedOrder = await orderService.updateOrder(req.params.id, req.body, tenantId);
    res.json(updatedOrder);
  })
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id/status',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  requireShift,
  validate({ body: updateOrderStatusSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const order = await orderService.updateOrderStatus(req.params.id, req.body, tenantId);
    res.json(order);
  })
);

/**
 * @swagger
 * /api/orders/{id}/kitchen-status:
 *   put:
 *     summary: Update kitchen status for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id/kitchen-status',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  subscriptionGuard,
  requireShift,
  validate({ body: z.object({ status: z.enum(['PENDING', 'COOKING', 'READY', 'SERVED']) }) }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const order = await orderService.getOrderById(req.params.id, tenantId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only update if order is sent to kitchen
    if (!order.sendToKitchen) {
      return res.status(400).json({ message: 'Order is not sent to kitchen' });
    }

    const updatedOrder = await orderService.updateOrder(req.params.id, {
      kitchenStatus: req.body.status,
    }, tenantId);
    res.json(updatedOrder);
  })
);

/**
 * @swagger
 * /api/orders/bulk-delete:
 *   post:
 *     summary: Bulk delete orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk-delete',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  subscriptionGuard,
  validate({ body: z.object({ orderIds: z.array(z.string()).min(1) }) }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.user!.role;

    // Only ADMIN_TENANT, SUPERVISOR and SUPER_ADMIN can delete orders
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN' && userRole !== 'SUPERVISOR') {
      return res.status(403).json({ message: 'Hanya admin atau supervisor yang dapat menghapus pesanan' });
    }

    const { orderIds } = req.body;
    const result = await orderService.bulkDeleteOrders(tenantId, orderIds);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/orders/bulk-refund:
 *   post:
 *     summary: Bulk refund orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk-refund',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  subscriptionGuard,
  validate({ body: z.object({ orderIds: z.array(z.string()).min(1) }) }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.user!.role;

    // Only ADMIN_TENANT, SUPERVISOR and SUPER_ADMIN can refund orders
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN' && userRole !== 'SUPERVISOR') {
      return res.status(403).json({ message: 'Hanya admin atau supervisor yang dapat melakukan refund' });
    }

    const { orderIds } = req.body;
    const result = await orderService.bulkRefundOrders(tenantId, orderIds);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete single order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authGuard,
  roleGuard('ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'),
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.user!.role;

    // Only ADMIN_TENANT, SUPERVISOR and SUPER_ADMIN can delete orders
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN' && userRole !== 'SUPERVISOR') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Hanya admin atau supervisor yang dapat menghapus pesanan'
      });
    }

    await orderService.deleteOrder(req.params.id, tenantId);
    res.status(204).send();
  })
);

export default router;
