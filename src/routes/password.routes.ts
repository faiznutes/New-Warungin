import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import passwordService from '../services/password.service';
import { updatePasswordSchema } from '../validators/password.validator';
import { validate } from '../middlewares/validator';
import { asyncHandler } from '../utils/route-error-handler';

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
  asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required' });
    }

    const strength = passwordService.checkStrength(password);

    res.json({
      score: strength.score,
      feedback: strength.feedback,
      meetsRequirements: strength.meetsRequirements,
    });
  })
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { oldPassword, newPassword } = req.body;

    await passwordService.updatePassword(userId, oldPassword, newPassword);

    res.json({ message: 'Password berhasil diubah' });
  })
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const mustChange = await passwordService.mustChangePassword(userId);

    res.json({ mustChange });
  })
);

export default router;

