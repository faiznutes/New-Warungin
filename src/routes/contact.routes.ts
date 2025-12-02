import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import { authGuard, AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';
import { handleRouteError } from '../utils/route-error-handler';
import logger from '../utils/logger';
import { authLimiter } from '../middlewares/rateLimiter';

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
  authLimiter, // Rate limit contact form submissions
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
      
      return res.json({
        success: true,
        message: 'Pesan Anda telah diterima. Tim kami akan menghubungi Anda segera.',
      });
    } catch (error: any) {
      logger.error('Error submitting contact form:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
      return handleRouteError(res, error, 'Gagal mengirim pesan. Silakan coba lagi.', 'contact-form');
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
  authLimiter, // Rate limit demo requests
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
      
      return res.json({
        success: true,
        message: 'Permintaan demo Anda telah diterima. Tim kami akan menghubungi Anda segera.',
      });
    } catch (error: any) {
      logger.error('Error submitting demo request:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
      return handleRouteError(res, error, 'Gagal mengirim permintaan demo. Silakan coba lagi.', 'demo-request');
    }
  }
);

/**
 * @swagger
 * /api/contact/submissions:
 *   get:
 *     summary: Get all contact submissions (Super Admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/submissions',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    try {
      if (!user || (user.role !== 'SUPER_ADMIN' && req.role !== 'SUPER_ADMIN')) {
        const error = new Error('Access denied. Super Admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Super Admin only.', 'GET_CONTACT_SUBMISSIONS');
        return;
      }

      const submissions = await prisma.contactSubmission.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json({
        success: true,
        data: submissions || [],
      });
    } catch (error: any) {
      logger.error('Error fetching contact submissions:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        user: user?.role,
      });
      return handleRouteError(res, error, 'Gagal mengambil data pesan formulir.', 'get-submissions');
    }
  }
);

/**
 * @swagger
 * /api/contact/submissions/:id:
 *   delete:
 *     summary: Delete a contact submission (Super Admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/submissions/:id',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    try {
      if (!user || (user.role !== 'SUPER_ADMIN' && req.role !== 'SUPER_ADMIN')) {
        const error = new Error('Access denied. Super Admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Super Admin only.', 'GET_CONTACT_SUBMISSIONS');
        return;
      }

      const { id } = req.params;

      if (!id) {
        const error = new Error('ID pesan tidak valid.');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'ID pesan tidak valid.', 'DELETE_CONTACT_SUBMISSION');
        return;
      }

      await prisma.contactSubmission.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Pesan formulir berhasil dihapus.',
      });
    } catch (error: any) {
      logger.error('Error deleting contact submission:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        id: req.params.id,
        user: user?.role,
      });
      
      if (error.code === 'P2025') {
        const err = new Error('Pesan formulir tidak ditemukan.');
        (err as any).statusCode = 404;
        handleRouteError(res, err, 'Pesan formulir tidak ditemukan.', 'DELETE_CONTACT_SUBMISSION');
        return;
      }

      return handleRouteError(res, error, 'Gagal menghapus pesan formulir.', 'delete-submission');
    }
  }
);

/**
 * @swagger
 * /api/contact/submissions/cleanup:
 *   post:
 *     summary: Clean up old contact submissions (older than 1 month) (Super Admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/submissions/cleanup',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    try {
      if (!user || (user.role !== 'SUPER_ADMIN' && req.role !== 'SUPER_ADMIN')) {
        const error = new Error('Access denied. Super Admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Super Admin only.', 'GET_CONTACT_SUBMISSIONS');
        return;
      }

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const result = await prisma.contactSubmission.deleteMany({
        where: {
          createdAt: {
            lt: oneMonthAgo,
          },
        },
      });

      return res.json({
        success: true,
        message: `Berhasil menghapus ${result.count} pesan formulir yang lebih dari 1 bulan.`,
        deletedCount: result.count,
      });
    } catch (error: any) {
      logger.error('Error cleaning up contact submissions:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        user: user?.role,
      });
      return handleRouteError(res, error, 'Gagal membersihkan pesan formulir lama.', 'cleanup-submissions');
    }
  }
);

/**
 * @swagger
 * /api/contact/submissions/:id:
 *   patch:
 *     summary: Update contact submission status (Super Admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/submissions/:id',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    try {
      if (!user || (user.role !== 'SUPER_ADMIN' && req.role !== 'SUPER_ADMIN')) {
        const error = new Error('Access denied. Super Admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Super Admin only.', 'GET_CONTACT_SUBMISSIONS');
        return;
      }

      const { id } = req.params;
      const { isProcessed } = req.body;

      if (typeof isProcessed !== 'boolean') {
        const error = new Error('isProcessed harus berupa boolean.');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'isProcessed harus berupa boolean.', 'UPDATE_CONTACT_SUBMISSION');
        return;
      }

      const updated = await prisma.contactSubmission.update({
        where: { id },
        data: { isProcessed },
      });

      return res.json({
        success: true,
        message: 'Status pesan berhasil diupdate.',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Error updating contact submission:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        id: req.params.id,
        isProcessed: req.body.isProcessed,
        user: user?.role,
      });
      
      if (error.code === 'P2025') {
        const err = new Error('Pesan formulir tidak ditemukan.');
        (err as any).statusCode = 404;
        handleRouteError(res, err, 'Pesan formulir tidak ditemukan.', 'DELETE_CONTACT_SUBMISSION');
        return;
      }

      return handleRouteError(res, error, 'Gagal mengupdate status pesan.', 'update-submission');
    }
  }
);

export default router;

