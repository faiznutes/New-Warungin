import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import settingsService from '../services/settings.service';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/settings/system:
 *   get:
 *     summary: Get system settings (Super Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/system',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const settings = await settingsService.getSystemSettings();
    res.json(settings);
  })
);

/**
 * @swagger
 * /api/settings/system:
 *   put:
 *     summary: Update system settings (Super Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/system',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const updatedSettings = await settingsService.updateSystemSettings(req.body);
    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  })
);

export default router;

