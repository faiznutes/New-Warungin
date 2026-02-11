import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import subscriptionReceiptService from '../services/subscription-receipt.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler } from '../utils/route-error-handler';

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

router.get(
  '/templates',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const templates = await subscriptionReceiptService.getReceiptTemplates();
    res.json(templates);
  })
);

router.get(
  '/templates/default',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await subscriptionReceiptService.getDefaultTemplate();
    res.json(template);
  })
);

router.get(
  '/templates/:id',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await prisma.receiptTemplate.findFirst({
      where: {
        id: req.params.id,
        tenantId: 'platform',
      },
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  })
);

router.post(
  '/templates',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  validate({ body: createTemplateSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await subscriptionReceiptService.createTemplate(req.body);
    res.status(201).json(template);
  })
);

router.put(
  '/templates/:id',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await subscriptionReceiptService.updateTemplate(req.params.id, req.body);
    res.json(template);
  })
);

router.post(
  '/templates/:id/set-default',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await subscriptionReceiptService.setDefaultTemplate(req.params.id);
    res.json(template);
  })
);

router.delete(
  '/templates/:id',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await subscriptionReceiptService.deleteTemplate(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  })
);

router.get(
  '/generate/:subscriptionId',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const templateId = req.query.templateId as string | undefined;
    const receipt = await subscriptionReceiptService.generateReceipt(req.params.subscriptionId, templateId);
    res.json(receipt);
  })
);

export default router;

