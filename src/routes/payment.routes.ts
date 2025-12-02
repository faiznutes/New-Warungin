import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import paymentService from '../services/payment.service';
import { requireTenantId } from '../utils/tenant';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import prisma from '../config/database';
import { handleRouteError } from '../utils/route-error-handler';

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
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const result = await paymentService.createPayment(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        const error = new Error(result.message || 'Payment creation failed');
        (error as any).statusCode = 400;
        handleRouteError(res, error, result.message || 'Payment creation failed', 'CREATE_PAYMENT');
      }
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to create payment', 'CREATE_PAYMENT');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const result = await paymentService.checkPaymentStatus(req.params.orderId);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to check payment status', 'CHECK_PAYMENT_STATUS');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const result = await paymentService.handleWebhook(req.body);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to handle webhook', 'WEBHOOK');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      // n8n already validated the webhook signature
      // Just process the payment directly
      const result = await paymentService.handleWebhook(req.body);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to process webhook', 'N8N_WEBHOOK');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const result = await paymentService.cancelPayment(req.params.orderId);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to cancel payment', 'CANCEL_PAYMENT');
    }
  }
);

const createAddonPaymentSchema = z.object({
  itemName: z.string().min(1),
  amount: z.number().positive(),
  itemId: z.string().min(1),
  itemType: z.enum(['addon', 'subscription', 'addon-extend']),
  addonId: z.string().optional(), // For addon-extend
  duration: z.number().int().positive().optional(), // For addon-extend
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
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const user = req.user;
      
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
        const error = new Error('Tenant not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Tenant not found', 'GET_PAYMENT_METHODS');
        return;
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
        addonId: req.body.addonId,
        duration: req.body.duration,
      });

      if (result.success) {
        res.json(result);
      } else {
        const error = new Error(result.message || 'Addon payment creation failed');
        (error as any).statusCode = 400;
        handleRouteError(res, error, result.message || 'Addon payment creation failed', 'CREATE_ADDON_PAYMENT');
      }
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to create addon payment', 'CREATE_ADDON_PAYMENT');
    }
  }
);

export default router;

