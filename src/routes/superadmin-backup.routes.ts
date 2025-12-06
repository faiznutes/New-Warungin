/**
 * Super Admin Backup Routes
 * Routes for managing tenant backup logs and reports
 */

import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { AuthRequest } from '../middlewares/auth';
import dailyBackupService from '../services/daily-backup.service';
import prisma from '../config/database';
import logger from '../utils/logger';
import { handleRouteError } from '../utils/route-error-handler';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * @swagger
 * /api/superadmin/backups:
 *   get:
 *     summary: Get all backup logs with filters
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         description: Filter by tenant ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed, email_failed]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of backup logs
 *       403:
 *         description: Forbidden - Only super admin
 */
router.get(
  '/',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can access
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can access backup logs' });
        return;
      }

      const {
        tenantId,
        status,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (tenantId) {
        where.tenantId = tenantId as string;
      }

      if (status) {
        where.status = status as string;
      }

      if (startDate || endDate) {
        where.generatedAt = {};
        if (startDate) {
          where.generatedAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          where.generatedAt.lte = end;
        }
      }

      const [backupLogs, total] = await Promise.all([
        prisma.backupLog.findMany({
          where,
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { generatedAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.backupLog.count({ where }),
      ]);

      res.json({
        data: backupLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to fetch backup logs', 'BACKUP');
    }
  }
);

/**
 * @swagger
 * /api/superadmin/backups/:tenantId/regenerate:
 *   post:
 *     summary: Regenerate backup for a tenant
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:tenantId/regenerate',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can regenerate backups
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can regenerate backups' });
        return;
      }

      const { tenantId } = req.params;
      const result = await dailyBackupService.regenerateBackup(tenantId);

      if (result.success) {
        res.json({
          message: 'Backup regenerated successfully',
          backupLogId: result.backupLogId,
          filePath: result.filePath,
        });
      } else {
        res.status(500).json({
          message: 'Failed to regenerate backup',
          error: result.error,
        });
      }
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to regenerate backup', 'BACKUP');
    }
  }
);

/**
 * @swagger
 * /api/superadmin/backups/:backupId/resend-email:
 *   post:
 *     summary: Resend backup email
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:backupId/resend-email',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can resend emails
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can resend backup emails' });
        return;
      }

      const { backupId } = req.params;
      const result = await dailyBackupService.resendBackupEmail(backupId);

      if (result.success) {
        res.json({
          message: 'Backup email resent successfully',
        });
      } else {
        res.status(500).json({
          message: 'Failed to resend backup email',
          error: result.error,
        });
      }
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to resend backup email', 'BACKUP');
    }
  }
);

/**
 * @swagger
 * /api/superadmin/backups/:backupId/download:
 *   get:
 *     summary: Download backup file
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:backupId/download',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can download backups
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can download backups' });
        return;
      }

      const { backupId } = req.params;
      const backupLog = await prisma.backupLog.findUnique({
        where: { id: backupId },
        include: {
          tenant: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!backupLog) {
        res.status(404).json({ message: 'Backup log not found' });
        return;
      }

      if (!fs.existsSync(backupLog.filePath)) {
        res.status(404).json({ message: 'Backup file not found' });
        return;
      }

      const fileName = path.basename(backupLog.filePath);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(path.resolve(backupLog.filePath));
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to download backup', 'BACKUP');
    }
  }
);

/**
 * @swagger
 * /api/superadmin/backups/:backupId/view:
 *   get:
 *     summary: View backup content as HTML
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:backupId/view',
  authGuard,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only SUPER_ADMIN can view backups
      if (req.role !== 'SUPER_ADMIN') {
        res.status(403).json({ message: 'Only super admin can view backups' });
        return;
      }

      const { backupId } = req.params;
      const backupLog = await prisma.backupLog.findUnique({
        where: { id: backupId },
      });

      if (!backupLog) {
        res.status(404).json({ message: 'Backup log not found' });
        return;
      }

      if (!fs.existsSync(backupLog.filePath)) {
        res.status(404).json({ message: 'Backup file not found' });
        return;
      }

      const htmlContent = fs.readFileSync(backupLog.filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to view backup', 'BACKUP');
    }
  }
);

export default router;
