import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import settingsService from '../services/settings.service';
import { handleRouteError } from '../utils/route-error-handler';

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
  async (req: Request, res: Response, next) => {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Access denied. Super Admin only.' });
      }

      const settings = await settingsService.getSystemSettings();
      res.json(settings);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to load system settings', 'GET_SYSTEM_SETTINGS');
    }
  }
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
  async (req: Request, res: Response, next) => {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Access denied. Super Admin only.' });
      }

      const updatedSettings = await settingsService.updateSystemSettings(req.body);
      res.json({
        message: 'Settings updated successfully',
        settings: updatedSettings,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to update system settings', 'UPDATE_SYSTEM_SETTINGS');
    }
  }
);

export default router;

