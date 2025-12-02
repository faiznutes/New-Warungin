import { Router, Request, Response } from 'express';
import paymentService from '../services/payment.service';
import subscriptionService from '../services/subscription.service';
import analyticsService from '../services/analytics.service';
import { processBackupJob } from '../jobs/backup.job';
import prisma from '../config/database';
import logger from '../utils/logger';
import { getRedisClient } from '../config/redis';
import * as path from 'path';
import * as fs from 'fs';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

// Internal API Key middleware (for n8n)
const validateInternalApiKey = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-internal-api-key'] as string;
  const expectedKey = process.env.INTERNAL_API_KEY || 'change-me-in-production';
  
  if (!apiKey || apiKey !== expectedKey) {
    const error = new Error('Invalid or missing internal API key');
    (error as any).statusCode = 401;
    handleRouteError(res, error, 'Invalid or missing internal API key', 'VALIDATE_INTERNAL_API_KEY');
    return;
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
  async (req: Request, res: Response) => {
    try {
      // n8n already validated the webhook signature
      // Just process the payment
      const result = await paymentService.handleWebhook(req.body);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process webhook', 'INTERNAL_WEBHOOK');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
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
        const error = new Error('Backup file not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Backup file not found', 'GET_BACKUP');
        return;
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
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process backup', 'INTERNAL_BACKUP');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const result = await subscriptionService.revertTemporaryUpgrades();
      
      res.json({ 
        success: true, 
        message: 'Subscription revert completed',
        data: result
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to revert subscriptions', 'INTERNAL_SUBSCRIPTION_REVERT');
    }
  }
);

/**
 * @swagger
 * /api/internal/analytics/precompute:
 *   post:
 *     summary: Internal endpoint for n8n to pre-compute analytics
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.post(
  '/analytics/precompute',
  validateInternalApiKey,
  async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.body;
      
      if (!tenantId) {
        const error = new Error('tenantId is required');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'tenantId is required', 'GET_ANALYTICS');
        return;
      }
      
      const redis = getRedisClient();
      if (!redis) {
        const error = new Error('Redis not available for caching');
        (error as any).statusCode = 503;
        handleRouteError(res, error, 'Redis not available for caching', 'INTERNAL_ANALYTICS_PRECOMPUTE');
        return;
      }
      
      // Pre-compute predictions
      const predictions = await analyticsService.getPredictions(tenantId, 'moving_average');
      await redis.setex(
        `analytics:predictions:${tenantId}`, 
        3600, // 1 hour cache
        JSON.stringify(predictions)
      );
      
      // Pre-compute trends
      const trends = await analyticsService.getTrends(tenantId, 'monthly');
      await redis.setex(
        `analytics:trends:monthly:${tenantId}`, 
        3600,
        JSON.stringify(trends)
      );
      
      // Pre-compute top products
      const topProducts = await analyticsService.getTopProducts(tenantId, 10);
      await redis.setex(
        `analytics:top-products:${tenantId}`, 
        3600,
        JSON.stringify(topProducts)
      );
      
      logger.info(`✅ Analytics pre-computed for tenant ${tenantId}`);
      
      res.json({ 
        success: true, 
        message: 'Analytics pre-computed successfully',
        data: {
          predictions,
          trends,
          topProducts: topProducts.length,
        }
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to pre-compute analytics', 'INTERNAL_ANALYTICS_PRECOMPUTE');
    }
  }
);

/**
 * @swagger
 * /api/internal/analytics/precompute-all:
 *   post:
 *     summary: Internal endpoint for n8n to pre-compute analytics for all active tenants
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.post(
  '/analytics/precompute-all',
  validateInternalApiKey,
  async (req: Request, res: Response) => {
    try {
      // Get all active tenants
      const tenants = await prisma.tenant.findMany({
        where: {
          subscriptionEnd: {
            gte: new Date(), // Active subscriptions
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      
      const results = [];
      const errors = [];
      
      for (const tenant of tenants) {
        try {
          const redis = getRedisClient();
          if (!redis) {
            throw new Error('Redis not available');
          }
          
          // Pre-compute predictions
          const predictions = await analyticsService.getPredictions(tenant.id, 'moving_average');
          await redis.setex(
            `analytics:predictions:${tenant.id}`, 
            3600,
            JSON.stringify(predictions)
          );
          
          // Pre-compute trends
          const trends = await analyticsService.getTrends(tenant.id, 'monthly');
          await redis.setex(
            `analytics:trends:monthly:${tenant.id}`, 
            3600,
            JSON.stringify(trends)
          );
          
          // Pre-compute top products
          const topProducts = await analyticsService.getTopProducts(tenant.id, 10);
          await redis.setex(
            `analytics:top-products:${tenant.id}`, 
            3600,
            JSON.stringify(topProducts)
          );
          
          results.push({ tenantId: tenant.id, tenantName: tenant.name, status: 'success' });
        } catch (error: any) {
          errors.push({ 
            tenantId: tenant.id, 
            tenantName: tenant.name, 
            error: error.message 
          });
        }
      }
      
      res.json({ 
        success: true, 
        message: `Pre-computed analytics for ${results.length} tenants`,
        data: {
          success: results.length,
          failed: errors.length,
          results,
          errors,
        }
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to pre-compute analytics for all tenants', 'INTERNAL_ANALYTICS_PRECOMPUTE_ALL');
    }
  }
);

/**
 * @swagger
 * /api/internal/tenants/active:
 *   get:
 *     summary: Internal endpoint for n8n to get list of active tenants
 *     tags: [Internal]
 *     security:
 *       - internalApiKey: []
 */
router.get(
  '/tenants/active',
  validateInternalApiKey,
  async (req: Request, res: Response) => {
    try {
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
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get active tenants', 'INTERNAL_GET_ACTIVE_TENANTS');
    }
  }
);

export default router;

