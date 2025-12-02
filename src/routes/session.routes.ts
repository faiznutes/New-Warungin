import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import sessionService from '../services/session.service';
import { requireTenantId } from '../utils/tenant';
import logger from '../utils/logger';
import { handleRouteError } from '../utils/route-error-handler';

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
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const sessions = await sessionService.getUserSessions(userId);

      res.json({ sessions });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get user sessions', 'GET_USER_SESSIONS');
    }
  }
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
  async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.userId!;

      // Verify session belongs to user
      const session = await sessionService.getSession(sessionId);
      if (!session || session.userId !== userId) {
        const error = new Error('Session not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Session not found', 'REVOKE_SESSION');
        return;
      }

      await sessionService.revokeSession(sessionId);

      res.json({ message: 'Session berhasil di-revoke' });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to revoke session', 'REVOKE_SESSION');
    }
  }
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
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const currentSessionId = (req as any).sessionId; // Should be set by middleware

      const revokedCount = await sessionService.revokeAllUserSessions(userId, currentSessionId);

      res.json({
        message: `${revokedCount} session berhasil di-revoke`,
        revokedCount,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to revoke all sessions', 'REVOKE_ALL_SESSIONS');
    }
  }
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
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const count = await sessionService.getSessionCount(userId);

      res.json({ count });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get session count', 'GET_SESSION_COUNT');
    }
  }
);

export default router;

