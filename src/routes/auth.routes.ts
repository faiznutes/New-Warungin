import { Router, Response } from 'express';
import { login } from '../services/auth.service';
import { loginSchema } from '../validators/auth.validator';
import { authGuard } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';
import { logAction } from '../middlewares/audit-logger';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Invalid email or password'
 */
// Login
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  // Log request for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Login request:', {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      contentType: req.headers['content-type'],
    });
  }

  const validated = loginSchema.parse(req.body);
  // Ensure email and password are present
  if (!validated.email || !validated.password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }
  const result = await login({
    email: validated.email,
    password: validated.password,
  }, req);

  // Log successful login
  if (result.user) {
    await logAction(
      req as AuthRequest,
      'LOGIN',
      'auth',
      result.user.id,
      { email: validated.email },
      'SUCCESS'
    );
  }

  res.json(result);
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh token required',
      message: 'Please provide a refresh token',
    });
  }

  const { verifyAndRotateRefreshToken } = await import('../utils/refresh-token');
  const { token, refreshToken: newRefreshToken, payload } = await verifyAndRotateRefreshToken(refreshToken);

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      isActive: true,
      permissions: true,
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({
      error: 'User not found or inactive',
      message: 'User account not found or inactive',
    });
  }

  res.json({
    token,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId || null,
      tenantName: user.tenant?.name || null,
      isActive: user.isActive,
      permissions: user.permissions || null,
    },
  });
}));

// Logout endpoint (revoke refresh tokens)
router.post('/logout', authGuard, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.userId;

  if (userId) {
    const { revokeAllRefreshTokens } = await import('../utils/refresh-token');
    await revokeAllRefreshTokens(userId);
  }

  res.json({ message: 'Logged out successfully' });
}));

// Get current user
router.get('/me', authGuard, asyncHandler(async (req: AuthRequest, res) => {
  // Validate userId exists
  if (!req.userId) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please login again.',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      isActive: true,
      permissions: true,
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          subscriptionEnd: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'User account not found. Please contact support.',
    });
  }

  // Format response to match frontend expectations
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId || null,
      tenantName: user.tenant?.name || null,
      isActive: user.isActive,
      permissions: user.permissions || null,
    },
  });
}));

export default router;
