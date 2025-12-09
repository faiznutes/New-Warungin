import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import { authGuard } from '../middlewares/auth';
import prisma from '../config/database';
import logger from '../utils/logger';

const router = Router();

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

const demoRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  businessName: z.string().min(1),
  phone: z.string().min(1),
  dateTime: z.string().optional(),
  message: z.string().optional(),
});

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 */
router.post(
  '/',
  validate({ body: contactFormSchema }),
  async (req: Request, res: Response) => {
    try {
      // Save to database
      await prisma.contactSubmission.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone || null,
          subject: req.body.subject,
          message: req.body.message,
        },
      });
      
      res.json({
        success: true,
        message: 'Pesan Anda telah diterima. Tim kami akan menghubungi Anda segera.',
      });
    } catch (error: any) {
      logger.error('Error submitting contact form:', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim pesan. Silakan coba lagi.',
      });
    }
  }
);

/**
 * @swagger
 * /api/contact/demo:
 *   post:
 *     summary: Submit demo request
 *     tags: [Contact]
 */
router.post(
  '/demo',
  validate({ body: demoRequestSchema }),
  async (req: Request, res: Response) => {
    try {
      // Save to database
      await prisma.demoRequest.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          businessName: req.body.businessName,
          phone: req.body.phone,
          dateTime: req.body.dateTime || null,
          message: req.body.message || null,
        },
      });
      
      res.json({
        success: true,
        message: 'Permintaan demo Anda telah diterima. Tim kami akan menghubungi Anda segera.',
      });
    } catch (error: any) {
      logger.error('Error submitting demo request:', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim permintaan demo. Silakan coba lagi.',
      });
    }
  }
);

/**
 * Get all contact submissions (Super Admin only)
 */
router.get(
  '/',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role || (req as any).role;
      
      // Only SUPER_ADMIN can view contact submissions
      if (userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only super admin can view contact submissions' });
      }

      const { page = '1', limit = '20', isRead, search } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
          { subject: { contains: search as string, mode: 'insensitive' } },
          { message: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [submissions, total] = await Promise.all([
        prisma.contactSubmission.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.contactSubmission.count({ where }),
      ]);

      res.json({
        data: submissions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      logger.error('Error fetching contact submissions:', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Gagal memuat pesan kontak' });
    }
  }
);

/**
 * Get single contact submission (Super Admin only)
 */
router.get(
  '/:id',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role || (req as any).role;
      
      if (userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only super admin can view contact submissions' });
      }

      const submission = await prisma.contactSubmission.findUnique({
        where: { id: req.params.id },
      });

      if (!submission) {
        return res.status(404).json({ message: 'Pesan tidak ditemukan' });
      }

      res.json(submission);
    } catch (error: any) {
      logger.error('Error fetching contact submission:', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Gagal memuat pesan kontak' });
    }
  }
);

/**
 * Mark as read/unread (Super Admin only)
 */
router.put(
  '/:id/read',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role || (req as any).role;
      
      if (userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only super admin can update contact submissions' });
      }

      const { isRead } = req.body;
      const submission = await prisma.contactSubmission.update({
        where: { id: req.params.id },
        data: {
          isRead: isRead === true || isRead === 'true',
          readAt: isRead === true || isRead === 'true' ? new Date() : null,
        },
      });

      res.json(submission);
    } catch (error: any) {
      logger.error('Error updating contact submission:', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Gagal memperbarui pesan kontak' });
    }
  }
);

/**
 * Delete contact submission (Super Admin only)
 */
router.delete(
  '/:id',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role || (req as any).role;
      
      if (userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only super admin can delete contact submissions' });
      }

      await prisma.contactSubmission.delete({
        where: { id: req.params.id },
      });

      res.json({ message: 'Pesan berhasil dihapus' });
    } catch (error: any) {
      logger.error('Error deleting contact submission:', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Gagal menghapus pesan kontak' });
    }
  }
);

/**
 * Bulk actions (Super Admin only)
 */
router.post(
  '/bulk',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role || (req as any).role;
      
      if (userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only super admin can perform bulk actions' });
      }

      const { action, ids } = req.body;

      if (!action || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Action dan IDs diperlukan' });
      }

      let result;
      switch (action) {
        case 'mark-read':
          result = await prisma.contactSubmission.updateMany({
            where: { id: { in: ids } },
            data: { isRead: true, readAt: new Date() },
          });
          break;
        case 'mark-unread':
          result = await prisma.contactSubmission.updateMany({
            where: { id: { in: ids } },
            data: { isRead: false, readAt: null },
          });
          break;
        case 'delete':
          result = await prisma.contactSubmission.deleteMany({
            where: { id: { in: ids } },
          });
          break;
        default:
          return res.status(400).json({ message: 'Action tidak valid' });
      }

      res.json({
        message: `Bulk action ${action} berhasil`,
        count: result.count,
      });
    } catch (error: any) {
      logger.error('Error performing bulk action:', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Gagal melakukan bulk action' });
    }
  }
);

export default router;

