import { Router, Request, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import addonService from '../services/addon.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { handleRouteError } from '../utils/route-error-handler';

const router = Router();

const subscribeAddonSchema = z.object({
  addonId: z.string().min(1),
  addonName: z.string().min(1),
  addonType: z.string().min(1),
  limit: z.number().nullable().optional(),
  duration: z.number().int().positive().optional(),
}).passthrough(); // Allow additional fields

router.get(
  '/available',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      // Available addons are the same for all tenants
      // Super Admin can view available addons for any tenant
      const addons = await addonService.getAvailableAddons();
      res.json(addons);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get available addons', 'ADDON');
    }
  }
);

router.get(
  '/',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const addons = await addonService.getTenantAddons(tenantId);
      res.json(addons);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to get tenant addons', 'ADDON');
    }
  }
);

router.post(
  '/subscribe',
  authGuard,
  validate({ body: subscribeAddonSchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userRole = req.user?.role || req.role || '';
      
      // Only ADMIN_TENANT and SUPER_ADMIN can subscribe to addons
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only tenant admin or super admin can subscribe to addons');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only tenant admin or super admin can subscribe to addons', 'ADDON_SUBSCRIBE');
        return;
      }

      // For SUPER_ADMIN, addon is activated immediately without payment
      // For ADMIN_TENANT, this endpoint is called after payment webhook (or direct for testing)
      
      // Prepare data for service
      const addonData = {
        addonId: req.body.addonId,
        addonName: req.body.addonName,
        addonType: req.body.addonType,
        limit: req.body.limit || null,
        duration: req.body.duration || undefined,
        addedBySuperAdmin: userRole === 'SUPER_ADMIN', // Set true if created by super admin
      };

      const addon = await addonService.subscribeAddon(tenantId, addonData);
      
      // Log for Super Admin direct activation
      if (userRole === 'SUPER_ADMIN') {
        const logger = (await import('../utils/logger')).default;
        logger.info(`Super Admin activated addon for tenant ${tenantId}`, {
          addonId: addon.id,
          addonName: addonData.addonName,
          addonType: addonData.addonType,
        });
      }
      
      res.status(201).json(addon);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to subscribe addon', 'ADDON');
    }
  }
);

router.post(
  '/unsubscribe/:addonId',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userRole = req.user?.role || req.role || '';
      
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only tenant admin can unsubscribe from addons');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only tenant admin can unsubscribe from addons', 'ADDON_UNSUBSCRIBE');
        return;
      }

      await addonService.unsubscribeAddon(tenantId, req.params.addonId);
      res.status(204).send();
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to unsubscribe addon', 'ADDON');
    }
  }
);

router.get(
  '/check-limit/:type',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const result = await addonService.checkLimit(tenantId, req.params.type);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to check addon limit', 'ADDON');
    }
  }
);

const extendAddonSchema = z.object({
  addonId: z.string(),
  duration: z.number().int().positive(),
});

router.post(
  '/extend',
  authGuard,
  validate({ body: extendAddonSchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userRole = req.user?.role || req.role || '';
      
      // Only ADMIN_TENANT and SUPER_ADMIN can extend addons
      if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only tenant admin or super admin can extend addons');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only tenant admin or super admin can extend addons', 'ADDON_EXTEND');
        return;
      }

      const result = await addonService.extendAddon(tenantId, req.body.addonId, req.body.duration);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to extend addon', 'ADDON');
    }
  }
);

const reduceAddonSchema = z.object({
  addonId: z.string(),
  duration: z.number().int().positive(),
});

router.post(
  '/reduce',
  authGuard,
  validate({ body: reduceAddonSchema }),
  async (req: AuthRequest, res: Response) => {
    try {
      const tenantId = requireTenantId(req);
      const userRole = req.user?.role || req.role || '';
      
      // Only SUPER_ADMIN can reduce addons
      if (userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only super admin can reduce addons');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can reduce addons', 'ADDON_REDUCE');
        return;
      }

      const result = await addonService.reduceAddon(tenantId, req.body.addonId, req.body.duration);
      res.json(result);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to reduce addon', 'ADDON');
    }
  }
);

/**
 * Bulk delete addons (Super Admin only)
 */
router.post(
  '/bulk-delete',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as any;
      const userRole = authReq.role || authReq.user?.role;
      
      // Only SUPER_ADMIN can bulk delete addons
      if (userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only super admin can bulk delete addons');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can bulk delete addons', 'ADDON_BULK_DELETE');
        return;
      }

      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        const error = new Error('IDs array is required');
        (error as any).statusCode = 400;
        handleRouteError(res, error, 'IDs array is required', 'ADDON_BULK_DELETE');
        return;
      }

      // Delete addons
      const result = await prisma.tenantAddon.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      res.json({ 
        message: `${result.count} addon(s) deleted successfully`,
        deletedCount: result.count,
      });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to bulk delete addons', 'ADDON');
    }
  }
);

/**
 * PATCH /api/addons/:id
 * Update addon (Super Admin only)
 */
router.patch(
  '/:id',
  authGuard,
  async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role || req.role || '';
      
      // Only SUPER_ADMIN can update addon
      if (userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only super admin can update addon');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can update addon', 'ADDON_UPDATE');
        return;
      }

      const addonId = req.params.id;
      const { addedBySuperAdmin } = req.body;
      
      // Check if addon exists
      const addon = await prisma.tenantAddon.findUnique({
        where: { id: addonId },
      });

      if (!addon) {
        const error = new Error('Addon not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Addon not found', 'ADDON_UPDATE');
        return;
      }

      // Update addon
      const updated = await prisma.tenantAddon.update({
        where: { id: addonId },
        data: {
          addedBySuperAdmin: addedBySuperAdmin !== undefined ? addedBySuperAdmin : addon.addedBySuperAdmin,
        },
      });

      res.json(updated);
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to update addon', 'ADDON');
    }
  }
);

/**
 * Delete addon (Super Admin only)
 */
router.delete(
  '/:id',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as any;
      const userRole = authReq.role || authReq.user?.role;
      
      // Only SUPER_ADMIN can delete addon
      if (userRole !== 'SUPER_ADMIN') {
        const error = new Error('Only super admin can delete addon');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can delete addon', 'ADDON_DELETE');
        return;
      }

      const addonId = req.params.id;
      
      // Check if addon exists
      const addon = await prisma.tenantAddon.findUnique({
        where: { id: addonId },
      });

      if (!addon) {
        const error = new Error('Addon not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Addon not found', 'ADDON_DELETE');
        return;
      }

      // Delete addon
      await prisma.tenantAddon.delete({
        where: { id: addonId },
      });

      res.json({ message: 'Addon deleted successfully' });
    } catch (error: unknown) {
      handleRouteError(res, error, 'Failed to delete addon', 'ADDON');
    }
  }
);

export default router;

