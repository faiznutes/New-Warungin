import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import sessionService from '../services/session.service';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all active sessions for current user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const sessions = await sessionService.getUserSessions(userId);

    res.json({ sessions });
  })
);

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:sessionId',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.params;
    const userId = req.userId!;

    // Verify session belongs to user
    const session = await sessionService.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await sessionService.revokeSession(sessionId);

    res.json({ message: 'Session berhasil di-revoke' });
  })
);

/**
 * @swagger
 * /api/sessions/revoke-all:
 *   post:
 *     summary: Revoke all sessions except current
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/revoke-all',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const currentSessionId = (req as any).sessionId; // Should be set by middleware

    const revokedCount = await sessionService.revokeAllUserSessions(userId, currentSessionId);

    res.json({
      message: `${revokedCount} session berhasil di-revoke`,
      revokedCount,
    });
  })
);

/**
 * @swagger
 * /api/sessions/count:
 *   get:
 *     summary: Get active session count
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/count',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const count = await sessionService.getSessionCount(userId);

    res.json({ count });
  })
);

export default router;

