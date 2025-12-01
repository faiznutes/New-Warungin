import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import passwordService from '../services/password.service';
import { updatePasswordSchema } from '../validators/password.validator';
import { validate } from '../middlewares/validator';
import logger from '../utils/logger';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/password/check-strength:
 *   post:
 *     summary: Check password strength
 *     tags: [Password]
 */
router.post(
  '/check-strength',
  async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (!password || typeof password !== 'string') {
        const error = new Error('Password is required');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'Password is required', 'CHECK_PASSWORD_STRENGTH');
        return;
      }

      const strength = passwordService.checkStrength(password);

      res.json({
        score: strength.score,
        feedback: strength.feedback,
        meetsRequirements: strength.meetsRequirements,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to check password strength', 'CHECK_PASSWORD_STRENGTH');
    }
  }
);

/**
 * @swagger
 * /api/password/update:
 *   post:
 *     summary: Update password
 *     tags: [Password]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/update',
  authGuard,
  validate({ body: updatePasswordSchema as any }),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { oldPassword, newPassword } = req.body;

      await passwordService.updatePassword(userId, oldPassword, newPassword);

      res.json({ message: 'Password berhasil diubah' });
    } catch (error: unknown) {
      logger.error('Error updating password', { error: (error as Error).message, userId: req.userId });
      handleRouteError(res, error, 'Failed to update password', 'UPDATE_PASSWORD');
    }
  }
);

/**
 * @swagger
 * /api/password/must-change:
 *   get:
 *     summary: Check if password must be changed
 *     tags: [Password]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/must-change',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const mustChange = await passwordService.mustChangePassword(userId);

      res.json({ mustChange });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to check must change password', 'CHECK_MUST_CHANGE_PASSWORD');
    }
  }
);

export default router;

