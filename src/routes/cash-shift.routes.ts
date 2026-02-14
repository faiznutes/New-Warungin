/**
 * Cash Shift Routes
 * Routes untuk manajemen uang modal dan rekap fisik kasir
 */

import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import cashShiftService from '../services/cash-shift.service';
import { requireTenantId } from '../utils/tenant';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';
import { auditLogger } from '../middlewares/audit-logger';

const router = Router();

const openShiftSchema = z.object({
  modalAwal: z.number().positive('Modal awal harus lebih besar dari 0'),
  catatan: z.string().optional(),
});

const closeShiftSchema = z.object({
  uangFisikTutup: z.number().min(0, 'Uang fisik tutup tidak boleh negatif'),
  catatan: z.string().optional(),
});

/**
 * @swagger
 * /api/cash-shift/open:
 *   post:
 *     summary: Buka shift kasir
 *     tags: [CashShift]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/open',
  authGuard,
  subscriptionGuard,
  validate({ body: openShiftSchema }),
  auditLogger('OPEN', 'cash_shifts'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const userRole = req.role!;

    // Hanya CASHIER yang bisa buka shift
    if (userRole !== 'CASHIER') {
      return res.status(403).json({ message: 'Hanya kasir yang dapat membuka shift' });
    }

    const { modalAwal, catatan } = req.body;

    const shift = await cashShiftService.openShift(tenantId, userId, modalAwal, catatan);

    res.json({
      success: true,
      message: 'Shift berhasil dibuka',
      data: shift,
    });
  })
);

/**
 * @swagger
 * /api/cash-shift/close:
 *   post:
 *     summary: Tutup shift kasir
 *     tags: [CashShift]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/close',
  authGuard,
  subscriptionGuard,
  validate({ body: closeShiftSchema }),
  auditLogger('CLOSE', 'cash_shifts'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const userRole = req.role!;

    // Hanya CASHIER yang bisa tutup shift
    if (userRole !== 'CASHIER') {
      return res.status(403).json({ message: 'Hanya kasir yang dapat menutup shift' });
    }

    const { uangFisikTutup, catatan } = req.body;

    if (!uangFisikTutup && uangFisikTutup !== 0) {
      return res.status(400).json({ message: 'Uang fisik tutup wajib diisi' });
    }

    const shift = await cashShiftService.closeShift(tenantId, userId, uangFisikTutup, catatan);

    res.json({
      success: true,
      message: 'Shift berhasil ditutup',
      data: shift,
    });
  })
);

/**
 * @swagger
 * /api/cash-shift/current:
 *   get:
 *     summary: Get shift aktif kasir
 *     tags: [CashShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/current',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const userRole = req.role!;

    // Hanya CASHIER yang bisa lihat shift
    if (userRole !== 'CASHIER') {
      return res.status(403).json({ message: 'Hanya kasir yang dapat melihat shift' });
    }

    const shift = await cashShiftService.getCurrentShift(tenantId, userId);

    if (!shift) {
      return res.json({
        success: true,
        data: null,
        message: 'Tidak ada shift aktif',
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
 * /api/cash-shift/history:
 *   get:
 *     summary: Get riwayat shift kasir
 *     tags: [CashShift]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/history',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userId = req.userId!;
    const userRole = req.role!;

    // CASHIER hanya bisa lihat shift sendiri, ADMIN_TENANT/SUPERVISOR bisa lihat semua
    const kasirId = (userRole === 'CASHIER') ? userId : (req.query.kasirId as string | undefined);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await cashShiftService.getShiftHistory(tenantId, kasirId, page, limit);

    res.json(result);
  })
);

export default router;
