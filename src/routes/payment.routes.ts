import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import paymentService from '../services/payment.service';
import { requireTenantId } from '../utils/tenant';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import prisma from '../config/database';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

const createPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'QRIS']),
  qrCode: z.string().optional(), // QR Code string untuk QRIS manual
  qrCodeImage: z.string().url().optional(), // URL gambar QR Code (opsional)
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })),
});

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create payment transaction
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/create',
  authGuard,
  validate({ body: createPaymentSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await paymentService.createPayment(req.body);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  })
);

/**
 * @swagger
 * /api/payment/status/{orderId}:
 *   get:
 *     summary: Check payment status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/status/:orderId',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await paymentService.checkPaymentStatus(req.params.orderId);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Handle Midtrans webhook notification (direct from Midtrans)
 *     tags: [Payment]
 */
router.post(
  '/webhook',
  // Placeholder: add rate limiting/IP allowlisting middleware here if needed
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Audit log: log IP and headers for traceability
    logger.info('Webhook received', {
      ip: req.ip,
      ips: req.ips,
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
      },
    });

    const result = await paymentService.handleWebhook(req.body);
    // If signature verification failed, log explicitly
    if (result && result.success === false && result.message && result.message.toLowerCase().includes('signature')) {
      logger.warn('Webhook signature verification failed', {
        body: req.body,
        ip: req.ip,
      });
    }
    res.json(result);
  })
);

/**
 * @swagger
 * /api/payment/webhook/n8n:
 *   post:
 *     summary: Internal endpoint for n8n to process payment webhooks (n8n validates signature first)
 *     tags: [Payment]
 */
router.post(
  '/webhook/n8n',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // n8n already validated the webhook signature
    // Just process the payment directly
    const result = await paymentService.handleWebhook(req.body);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/payment/cancel/{orderId}:
 *   post:
 *     summary: Cancel payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/cancel/:orderId',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await paymentService.cancelPayment(req.params.orderId);
    res.json(result);
  })
);

const createAddonPaymentSchema = z.object({
  itemName: z.string().min(1),
  amount: z.number().positive(),
  itemId: z.string().min(1),
  itemType: z.enum(['addon', 'subscription']),
});

/**
 * @swagger
 * /api/payment/addon:
 *   post:
 *     summary: Create Midtrans payment for addon/subscription
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/addon',
  authGuard,
  validate({ body: createAddonPaymentSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);

    // Get tenant info with subscription plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        email: true,
        phone: true,
        subscriptionPlan: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const result = await paymentService.createAddonPayment({
      tenantId,
      tenantName: tenant.name,
      tenantEmail: tenant.email || undefined,
      tenantPhone: tenant.phone || undefined,
      itemName: req.body.itemName,
      amount: req.body.amount,
      itemId: req.body.itemId,
      itemType: req.body.itemType,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  })
);

export default router;

