/**
 * Store Shift Routes
 * Routes untuk manajemen shift global per store (buka toko)
 */

import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { supervisorStoreGuard } from '../middlewares/supervisor-store-guard';
import storeShiftService from '../services/store-shift.service';
import { requireTenantId, requireUserId } from '../utils/tenant';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';

const router = Router();

const openShiftSchema = z.object({
  outletId: z.string().min(1, 'Outlet ID wajib diisi'),
  shiftType: z.string().min(1, 'Shift type wajib diisi'),
  modalAwal: z.number().min(0).optional(),
  catatan: z.string().optional(),
});

/**
 * @swagger
 * /api/store-shift/current:
 *   get:
 *     summary: Get current open shift for a store
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/current',
  authGuard,
  subscriptionGuard,
  supervisorStoreGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const outletId = req.query.outletId as string;

    if (!outletId) {
      return res.status(400).json({ message: 'Outlet ID is required' });
    }

    const shift = await storeShiftService.getCurrentShift(tenantId, outletId);

    if (!shift) {
      return res.json({
        success: true,
        data: null,
        message: 'Tidak ada shift aktif untuk store ini',
      });
    }

    res.json({
      success: true,
      data: shift,
    });
  })
);

/**
 * @swagger
 * /api/store-shift/open:
 *   post:
 *     summary: Open a new shift for a store
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/open',
  authGuard,
  subscriptionGuard,
  validate({ body: openShiftSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = requireUserId(req);
    const userRole = req.role!;

    // Only ADMIN_TENANT, SUPERVISOR, and CASHIER can open shift
    if (!['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'].includes(userRole)) {
      return res.status(403).json({ message: 'Hanya Admin Tenant, Supervisor, atau Kasir yang dapat membuka shift' });
    }

    const shift = await storeShiftService.openShift(tenantId, userId, req.body);

    res.json({
      success: true,
      message: `Shift ${req.body.shiftType} berhasil dibuka`,
      data: shift,
    });
  })
);

/**
 * @swagger
 * /api/store-shift/close:
 *   post:
 *     summary: Close a shift
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/close',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = requireUserId(req);
    const userRole = req.role!;
    const { shiftId, outletId } = req.body;

    if (!shiftId || !outletId) {
      return res.status(400).json({ message: 'Shift ID dan Outlet ID wajib diisi' });
    }

    // Only ADMIN_TENANT, SUPERVISOR, and CASHIER can close shift
    if (!['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'].includes(userRole)) {
      return res.status(403).json({ message: 'Hanya Admin Tenant, Supervisor, atau Kasir yang dapat menutup shift' });
    }

    const shift = await storeShiftService.closeShift(tenantId, outletId, shiftId, userId);

    res.json({
      success: true,
      message: 'Shift berhasil ditutup',
      data: shift,
    });
  })
);

/**
 * @swagger
 * /api/store-shift/open:
 *   get:
 *     summary: Get all open shifts
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/open',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const outletId = req.query.outletId as string | undefined;

    const shifts = await storeShiftService.getOpenShifts(tenantId, outletId);

    res.json({
      success: true,
      data: shifts,
    });
  })
);

/**
 * @swagger
 * /api/store-shift/history:
 *   get:
 *     summary: Get shift history
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/history',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const outletId = req.query.outletId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await storeShiftService.getShiftHistory(tenantId, outletId, page, limit);

    res.json(result);
  })
);

/**
 * @swagger
 * /api/store-shift/active-users:
 *   get:
 *     summary: Get active users in a shift (for kitchen/dapur)
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/active-users',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const outletId = req.query.outletId as string;
    const shiftId = req.query.shiftId as string | undefined;

    if (!outletId) {
      return res.status(400).json({ message: 'Outlet ID is required' });
    }

    const users = await storeShiftService.getActiveUsersInShift(tenantId, outletId, shiftId);

    res.json({
      success: true,
      data: users,
    });
  })
);

/**
 * @swagger
 * /api/store-shift/today:
 *   get:
 *     summary: Get today's shifts for a store
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/today',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const outletId = req.query.outletId as string;

    if (!outletId) {
      return res.status(400).json({ message: 'Outlet ID is required' });
    }

    const shifts = await storeShiftService.getTodayShifts(tenantId, outletId);

    res.json({
      success: true,
      data: shifts,
    });
  })
);

/**
 * @swagger
 * /api/store-shift/{id}/details:
 *   get:
 *     summary: Get shift details with filters
 *     tags: [StoreShift]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeOrders
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeStockTransfers
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeProductAdjustments
 *         schema:
 *           type: boolean
 */
router.get(
  '/:id/details',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const shiftId = req.params.id;
    const filters = {
      includeOrders: req.query.includeOrders !== 'false',
      includeStockTransfers: req.query.includeStockTransfers !== 'false',
      includeProductAdjustments: req.query.includeProductAdjustments !== 'false',
    };

    const details = await storeShiftService.getShiftDetails(tenantId, shiftId, filters);

    res.json({
      success: true,
      data: details,
    });
  })
);

export default router;

