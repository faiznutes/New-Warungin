import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import twoFactorService from '../services/2fa.service';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import prisma from '../config/database';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

const enable2FASchema = z.object({
  token: z.string().length(6, 'Token harus 6 digit'),
});

const disable2FASchema = z.object({
  password: z.string().min(1, 'Password wajib diisi'),
});

/**
 * @swagger
 * /api/2fa/generate:
 *   post:
 *     summary: Generate 2FA secret and QR code
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/generate',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const user = req.user!;

    // Get tenant ID - for SUPER_ADMIN, try query param or user's tenantId
    // For other roles, use user's tenantId
    let tenantId: string | null = null;
    let tenantName: string | undefined = undefined;

    if (user.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN can specify tenantId via query, or use their own tenantId if they have one
      tenantId = (req.query.tenantId as string) || user.tenantId || null;
    } else {
      // For other roles, use tenantId from user
      tenantId = user.tenantId || (req as any).tenantId || null;
    }

    // Get tenant name for service name (optional - if tenantId exists)
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true },
      });
      tenantName = tenant?.name;
    }

    const result = await twoFactorService.generateSecret(
      userId,
      user.email,
      tenantName
    );

    res.json({
      secret: result.secret,
      qrCode: result.qrCode,
      backupCodes: result.backupCodes,
      message: 'Simpan backup codes di tempat yang aman!',
    });
  })
);

/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Enable 2FA for user
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/enable',
  authGuard,
  validate({ body: enable2FASchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { token } = req.body;

    await twoFactorService.enable2FA(userId, token);

    res.json({ message: '2FA berhasil diaktifkan' });
  })
);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA for user
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/disable',
  authGuard,
  validate({ body: disable2FASchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { password } = req.body;

    await twoFactorService.disable2FA(userId, password);

    res.json({ message: '2FA berhasil dinonaktifkan' });
  })
);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/verify',
  authGuard,
  validate({ body: enable2FASchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { token } = req.body;

    const isValid = await twoFactorService.verifyToken(userId, token);

    if (!isValid) {
      return res.status(401).json({ message: 'Token 2FA tidak valid' });
    }

    res.json({ message: 'Token 2FA valid' });
  })
);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Get 2FA status
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/status',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const isEnabled = await twoFactorService.is2FAEnabled(userId);
    const remainingBackupCodes = await twoFactorService.getRemainingBackupCodes(userId);

    res.json({
      enabled: isEnabled,
      remainingBackupCodes,
    });
  })
);

export default router;

