/**
 * Stock Transfer Routes
 * API endpoints for managing stock transfers between outlets
 */

import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { supervisorStoresGuard } from '../middlewares/supervisor-store-guard';
import { checkInventoryAccess } from '../middlewares/plan-feature-guard';
import { validate } from '../middlewares/validator';
import { requireTenantId, requireUserId } from '../utils/tenant';
import stockTransferService from '../services/stock-transfer.service';
import { z } from 'zod';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';
import { logAction } from '../middlewares/audit-logger';

const router = Router();

const createStockTransferSchema = z.object({
  fromOutletId: z.string(),
  toOutletId: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
  })).min(1),
});

/**
 * @swagger
 * /api/stock-transfers:
 *   get:
 *     summary: Get all stock transfers
 *     tags: [Stock Transfers]
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
 *         name: outletId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of stock transfers
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
      outletId: req.query.outletId as string | undefined,
    };
    const result = await stockTransferService.getStockTransfers(tenantId, query);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/stock-transfers/{id}:
 *   get:
 *     summary: Get stock transfer by ID
 *     tags: [Stock Transfers]
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
 *         description: Stock transfer details
 */
router.get(
  '/:id',
  authGuard,
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const transfer = await stockTransferService.getStockTransferById(req.params.id, tenantId);
    res.json(transfer);
  })
);

/**
 * @swagger
 * /api/stock-transfers:
 *   post:
 *     summary: Create new stock transfer
 *     tags: [Stock Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromOutletId
 *               - toOutletId
 *               - items
 *             properties:
 *               fromOutletId:
 *                 type: string
 *               toOutletId:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *     responses:
 *       201:
 *         description: Stock transfer created
 */
router.post(
  '/',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  checkInventoryAccess,
  validate({ body: createStockTransferSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;

    try {
      const transfer = await stockTransferService.createStockTransfer(
        tenantId,
        userId,
        req.body
      );

      // Log audit for SPV actions
      await logAction(
        req,
        'CREATE',
        'stock_transfers',
        transfer.id,
        {
          transferNumber: transfer.transferNumber,
          fromOutletId: transfer.fromOutletId,
          toOutletId: transfer.toOutletId,
          itemsCount: transfer.items?.length || 0,
        },
        'SUCCESS'
      );

      res.status(201).json(transfer);
    } catch (error: unknown) {
      // Log audit attempt on failure
      await logAction(
        req,
        'CREATE',
        'stock_transfers',
        null,
        { error: (error as Error).message },
        'FAILED',
        (error as Error).message
      );
      // Re-throw to be caught by asyncHandler and handled centraly
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/stock-transfers/{id}/receive:
 *   post:
 *     summary: Receive stock transfer (update stock)
 *     tags: [Stock Transfers]
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
 *         description: Stock transfer received
 */
router.post(
  '/:id/receive',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const receivedDate = req.body.receivedDate ? new Date(req.body.receivedDate) : undefined;

    try {
      const transfer = await stockTransferService.receiveStockTransfer(
        req.params.id,
        tenantId,
        userId,
        receivedDate
      );

      // Log audit for SPV actions
      await logAction(
        req,
        'RECEIVE',
        'stock_transfers',
        transfer.id,
        {
          transferNumber: transfer.transferNumber,
          receivedDate: receivedDate?.toISOString(),
        },
        'SUCCESS'
      );

      res.json(transfer);
    } catch (error: unknown) {
      await logAction(
        req,
        'RECEIVE',
        'stock_transfers',
        req.params.id,
        { error: (error as Error).message },
        'FAILED',
        (error as Error).message
      );
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/stock-transfers/{id}/cancel:
 *   post:
 *     summary: Cancel stock transfer
 *     tags: [Stock Transfers]
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
 *         description: Stock transfer cancelled
 */
router.post(
  '/:id/cancel',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'),
  subscriptionGuard,
  checkInventoryAccess,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);

    try {
      const transfer = await stockTransferService.cancelStockTransfer(req.params.id, tenantId);

      // Log audit for SPV actions
      await logAction(
        req,
        'CANCEL',
        'stock_transfers',
        transfer.id,
        {
          transferNumber: transfer.transferNumber,
        },
        'SUCCESS'
      );

      res.json(transfer);
    } catch (error: unknown) {
      await logAction(
        req,
        'CANCEL',
        'stock_transfers',
        req.params.id,
        { error: (error as Error).message },
        'FAILED',
        (error as Error).message
      );
      throw error;
    }
  })
);

export default router;

