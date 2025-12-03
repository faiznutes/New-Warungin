import { Router, Request, Response, NextFunction } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import subscriptionReceiptService from '../services/subscription-receipt.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import prisma from '../config/database';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  templateType: z.enum(['DEFAULT', 'MODERN', 'MINIMAL', 'DETAILED', 'COMPACT']),
  paperSize: z.enum(['A4', 'THERMAL_58', 'THERMAL_80']),
  header: z.any().optional(),
  footer: z.any().optional(),
  fields: z.any().optional(),
  styles: z.any().optional(),
});

// All routes require Super Admin
const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role || req.role;
  if (userRole !== 'SUPER_ADMIN') {
    const error = new Error('Access denied. Super Admin only.');
    (error as any).statusCode = 403;
    handleRouteError(res, error, 'Access denied. Super Admin only.', 'REQUIRE_SUPER_ADMIN');
    return;
  }
  next();
};

router.get(
  '/templates',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const templates = await subscriptionReceiptService.getReceiptTemplates();
      res.json(templates);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get receipt templates', 'GET_RECEIPT_TEMPLATES');
    }
  }
);

router.get(
  '/templates/default',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const template = await subscriptionReceiptService.getDefaultTemplate();
      res.json(template);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get receipt templates', 'GET_RECEIPT_TEMPLATES');
    }
  }
);

router.get(
  '/templates/:id',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const template = await prisma.receiptTemplate.findFirst({
        where: {
          id: req.params.id,
          tenantId: 'platform',
        },
      });
      if (!template) {
        const error = new Error('Template not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Template not found', 'GET_RECEIPT_TEMPLATE');
        return;
      }
      res.json(template);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get receipt templates', 'GET_RECEIPT_TEMPLATES');
    }
  }
);

router.post(
  '/templates',
  authGuard,
  requireSuperAdmin,
  validate({ body: createTemplateSchema }),
  async (req: Request, res: Response) => {
    try {
      const template = await subscriptionReceiptService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to create receipt template', 'CREATE_RECEIPT_TEMPLATE');
    }
  }
);

router.put(
  '/templates/:id',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const template = await subscriptionReceiptService.updateTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to update receipt template', 'UPDATE_RECEIPT_TEMPLATE');
    }
  }
);

router.post(
  '/templates/:id/set-default',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const template = await subscriptionReceiptService.setDefaultTemplate(req.params.id);
      res.json(template);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to set default receipt template', 'SET_DEFAULT_RECEIPT_TEMPLATE');
    }
  }
);

router.delete(
  '/templates/:id',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      await subscriptionReceiptService.deleteTemplate(req.params.id);
      res.json({ message: 'Template deleted successfully' });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to delete receipt template', 'DELETE_RECEIPT_TEMPLATE');
    }
  }
);

router.get(
  '/generate/:subscriptionId',
  authGuard,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const templateId = req.query.templateId as string | undefined;
      const receipt = await subscriptionReceiptService.generateReceipt(req.params.subscriptionId, templateId);
      res.json(receipt);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to generate receipt', 'GENERATE_RECEIPT');
    }
  }
);

export default router;

