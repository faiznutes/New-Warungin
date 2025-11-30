import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import { authGuard } from '../middlewares/auth';
import prisma from '../config/database';

const router = Router();

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
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
          subject: req.body.subject,
          message: req.body.message,
        },
      });
      
      res.json({
        success: true,
        message: 'Pesan Anda telah diterima. Tim kami akan menghubungi Anda segera.',
      });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
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
      console.error('Error submitting demo request:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim permintaan demo. Silakan coba lagi.',
      });
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
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Super Admin only.' 
        });
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
      console.error('Error fetching contact submissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data pesan formulir.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
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
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Super Admin only.' 
        });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID pesan tidak valid.',
        });
      }

      await prisma.contactSubmission.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Pesan formulir berhasil dihapus.',
      });
    } catch (error: any) {
      console.error('Error deleting contact submission:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Pesan formulir tidak ditemukan.',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus pesan formulir.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
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
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Super Admin only.' 
        });
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
      console.error('Error cleaning up contact submissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membersihkan pesan formulir lama.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;

