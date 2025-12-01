import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { z } from 'zod';
import { validate } from '../middlewares/validator';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
});

/**
 * @swagger
 * /api/tenant/profile:
 *   get:
 *     summary: Get tenant profile (for tenant admin)
 *     tags: [Tenant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/profile',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userRole = user?.role;
      
      // Only ADMIN_TENANT and SUPERVISOR can access their own tenant profile
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPERVISOR') {
        const error = new Error('Access denied. Tenant admin only.');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Access denied. Tenant admin only.', 'GET_TENANT_PROFILE');
        return;
      }

      const tenantId = requireTenantId(req);
      
      // Get tenant info
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          slug: true,
        },
      });

      if (!tenant) {
        const error = new Error('Tenant not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Tenant not found', 'GET_TENANT_PROFILE');
        return;
      }

      // Get default receipt template for header/footer
      const receiptTemplate = await prisma.receiptTemplate.findFirst({
        where: {
          tenantId,
          isDefault: true,
        },
        select: {
          header: true,
          footer: true,
        },
      });

      // Convert JSON to string for frontend
      const receiptHeader = receiptTemplate?.header 
        ? (typeof receiptTemplate.header === 'string' 
            ? receiptTemplate.header 
            : (receiptTemplate.header as any)?.text || '')
        : '';
      const receiptFooter = receiptTemplate?.footer
        ? (typeof receiptTemplate.footer === 'string'
            ? receiptTemplate.footer
            : (receiptTemplate.footer as any)?.text || '')
        : '';

      res.json({
        ...tenant,
        receiptHeader,
        receiptFooter,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to load tenant profile', 'GET_TENANT_PROFILE');
    }
  }
);

/**
 * @swagger
 * /api/tenant/profile:
 *   put:
 *     summary: Update tenant profile (for tenant admin)
 *     tags: [Tenant]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/profile',
  authGuard,
  validate({ body: updateProfileSchema }),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userRole = user?.role;
      
      // Only ADMIN_TENANT can update their tenant profile
      if (userRole !== 'ADMIN_TENANT') {
        return res.status(403).json({ message: 'Access denied. Tenant admin only.' });
      }

      const tenantId = requireTenantId(req);
      
      // Check if tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      // Prepare update data
      const updateData: any = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.email && req.body.email !== tenant.email) {
        // Check if email is already taken
        const existingTenant = await prisma.tenant.findUnique({
          where: { email: req.body.email },
        });
        if (existingTenant) {
          const error = new Error('Email already exists');
          (error as any).statusCode = 400;
          handleRouteError(res, error, 'Email already exists', 'UPDATE_TENANT_PROFILE');
          return;
        }
        updateData.email = req.body.email;
        updateData.slug = req.body.email.toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.address !== undefined) updateData.address = req.body.address;

      // Update tenant
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          slug: true,
        },
      });

      // Update receipt template if header/footer provided
      if (req.body.receiptHeader !== undefined || req.body.receiptFooter !== undefined) {
        const receiptTemplate = await prisma.receiptTemplate.findFirst({
          where: {
            tenantId,
            isDefault: true,
          },
        });

        // Convert string to JSON if needed
        const headerValue = req.body.receiptHeader !== undefined 
          ? (req.body.receiptHeader ? { text: req.body.receiptHeader } : null)
          : receiptTemplate?.header;
        const footerValue = req.body.receiptFooter !== undefined
          ? (req.body.receiptFooter ? { text: req.body.receiptFooter } : null)
          : receiptTemplate?.footer;

        if (receiptTemplate) {
          await prisma.receiptTemplate.update({
            where: { id: receiptTemplate.id },
            data: {
              header: headerValue as any,
              footer: footerValue as any,
            },
          });
        } else {
          // Create default receipt template if doesn't exist
          await prisma.receiptTemplate.create({
            data: {
              tenantId,
              name: 'Default Receipt',
              templateType: 'DEFAULT',
              isDefault: true,
              paperSize: 'A4',
              header: headerValue as any,
              footer: footerValue as any,
            },
          });
        }
      }

      // Get updated receipt template
      const receiptTemplate = await prisma.receiptTemplate.findFirst({
        where: {
          tenantId,
          isDefault: true,
        },
        select: {
          header: true,
          footer: true,
        },
      });

      // Convert JSON to string for frontend
      const receiptHeader = receiptTemplate?.header 
        ? (typeof receiptTemplate.header === 'string' 
            ? receiptTemplate.header 
            : (receiptTemplate.header as any)?.text || JSON.stringify(receiptTemplate.header))
        : '';
      const receiptFooter = receiptTemplate?.footer
        ? (typeof receiptTemplate.footer === 'string'
            ? receiptTemplate.footer
            : (receiptTemplate.footer as any)?.text || JSON.stringify(receiptTemplate.footer))
        : '';

      res.json({
        ...updatedTenant,
        receiptHeader,
        receiptFooter,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to update tenant profile', 'UPDATE_TENANT_PROFILE');
    }
  }
);

export default router;

