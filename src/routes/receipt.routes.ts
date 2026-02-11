import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import receiptService from '../services/receipt.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { checkReceiptEditorAddon } from '../middlewares/addon-guard';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  templateType: z.enum(['CLASSIC', 'MODERN', 'MINIMAL', 'PROFESSIONAL']),
  paperSize: z.enum(['A4', 'THERMAL_50', 'THERMAL_80', 'Bluetooth']),
  header: z.any().optional(),
  footer: z.any().optional(),
  fields: z.any().optional(),
  styles: z.any().optional(),
});

router.get(
  '/templates',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const templates = await receiptService.getReceiptTemplates(tenantId);
    res.json(templates);
  })
);

router.get(
  '/templates/default',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const template = await receiptService.getDefaultTemplate(tenantId);
    res.json(template);
  })
);

router.get(
  '/templates/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const template = await prisma.receiptTemplate.findFirst({
      where: {
        id: req.params.id,
        tenantId,
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
  checkReceiptEditorAddon,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  validate({ body: createTemplateSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const template = await receiptService.createTemplate(tenantId, req.body);
    res.status(201).json(template);
  })
);

router.put(
  '/templates/:id',
  authGuard,
  checkReceiptEditorAddon,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const template = await receiptService.updateTemplate(req.params.id, tenantId, req.body);
    res.json(template);
  })
);

router.post(
  '/templates/:id/set-default',
  authGuard,
  checkReceiptEditorAddon,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const template = await receiptService.setDefaultTemplate(req.params.id, tenantId);
    res.json(template);
  })
);

router.delete(
  '/templates/:id',
  authGuard,
  checkReceiptEditorAddon,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    await receiptService.deleteTemplate(req.params.id, tenantId);
    res.json({ message: 'Template deleted successfully' });
  })
);

router.get(
  '/generate/:orderId',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const templateId = req.query.templateId as string | undefined;
    const receipt = await receiptService.generateReceipt(req.params.orderId, tenantId, templateId);
    res.json(receipt);
  })
);

export default router;

