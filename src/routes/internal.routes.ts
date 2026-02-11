import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import paymentService from '../services/payment.service';
import subscriptionService from '../services/subscription.service';
import { processBackupJob } from '../jobs/backup.job';
import prisma from '../config/database';
import logger from '../utils/logger';
import { getRedisClient } from '../config/redis';
import * as path from 'path';
import * as fs from 'fs';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

// Internal API Key middleware (for n8n) with rotation support
const validateInternalApiKey = async (req: Request, res: Response, next: () => void) => {
  const apiKey = req.headers['x-internal-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Missing internal API key'
    });
  }

  // Validate using rotation-aware validator
  const { validateApiKey } = await import('../utils/api-key-rotation');
  const isValid = await validateApiKey(apiKey);

  if (!isValid) {
    logger.warn('Invalid API key attempt', {
      keyPrefix: apiKey.substring(0, 8) + '...',
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      message: 'Invalid internal API key'
    });
  }

  next();
};

/**
 * @swagger
 * /api/internal/payment/webhook:
 *   post:
 *     summary: Internal endpoint for n8n to process payment webhooks
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.post(
  '/payment/webhook',
  validateInternalApiKey,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // n8n already validated the webhook signature
    // Just process the payment
    const result = await paymentService.handleWebhook(req.body);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/internal/backup:
 *   post:
 *     summary: Internal endpoint for n8n to trigger backup (returns backup file path for Gmail API)
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.post(
  '/backup',
  validateInternalApiKey,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { tenantId, type = 'incremental' } = req.body;

    // Process backup job
    const job = {
      id: 'n8n-backup',
      data: { tenantId, type },
    } as any;

    await processBackupJob(job);

    // Get backup file path (backup job creates file in backups/ directory)
    const backupDir = path.join(process.cwd(), 'backups');

    // Find the most recent backup file
    const files = fs.readdirSync(backupDir)
      .filter((file: string) => {
        if (tenantId) {
          return file.includes(`backup-${tenantId}-${type}`);
        }
        return file.includes(`backup-all-${type}`);
      })
      .map((file: string) => {
        const filePath = path.join(backupDir, file);
        return {
          name: file,
          path: filePath,
          stats: fs.statSync(filePath),
        };
      })
      .sort((a: any, b: any) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    const latestBackup = files[0];

    if (!latestBackup) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Read backup file content
    const backupContent = fs.readFileSync(latestBackup.path, 'utf8');

    res.json({
      success: true,
      message: `Backup completed: ${type} for tenant ${tenantId || 'all'}`,
      data: {
        fileName: latestBackup.name,
        filePath: latestBackup.path,
        fileSize: latestBackup.stats.size,
        createdAt: latestBackup.stats.mtime.toISOString(),
        content: backupContent, // For n8n to send via Gmail API
      }
    });
  })
);

/**
 * @swagger
 * /api/internal/subscription/revert:
 *   post:
 *     summary: Internal endpoint for n8n to revert temporary subscriptions
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.post(
  '/subscription/revert',
  validateInternalApiKey,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.revertTemporaryUpgrades();

    res.json({
      success: true,
      message: 'Subscription revert completed',
      data: result
    });
  })
);


/**
 * @swagger
 * /api/internal/tenants/active:
 *   get:
 *     summary: Internal endpoint for n8n to get list of active tenants
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 *     description: Returns list of active tenants
 */
router.get(
  '/tenants/active',
  validateInternalApiKey,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenants = await prisma.tenant.findMany({
      where: {
        subscriptionEnd: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionPlan: true,
        subscriptionEnd: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: tenants
    });
  })
);

/**
 * @swagger
 * /api/internal/api-key/rotate:
 *   post:
 *     summary: Rotate internal API key (Super Admin only)
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newKey
 *             properties:
 *               newKey:
 *                 type: string
 *                 description: New API key to set
 */
router.post(
  '/api-key/rotate',
  validateInternalApiKey,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { newKey } = req.body;

    if (!newKey || typeof newKey !== 'string' || newKey.length < 16) {
      return res.status(400).json({
        success: false,
        message: 'New API key must be at least 16 characters long',
      });
    }

    const { rotateApiKey } = await import('../utils/api-key-rotation');
    await rotateApiKey(newKey);

    // Update environment variable (for current process)
    process.env.INTERNAL_API_KEY = newKey;

    res.json({
      success: true,
      message: 'API key rotated successfully. Previous key will remain valid for 30 days.',
    });
  })
);

/**
 * @swagger
 * /api/internal/api-key/history:
 *   get:
 *     summary: Get API key rotation history
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.get(
  '/api-key/history',
  validateInternalApiKey,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { getRotationHistory } = await import('../utils/api-key-rotation');
    const history = await getRotationHistory(10);

    res.json({
      success: true,
      history,
    });
  })
);

export default router;

