import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import addonService from '../services/addon.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import logger from '../utils/logger';
import { asyncHandler } from '../utils/route-error-handler';

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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Available addons are the same for all tenants
    // Super Admin can view available addons for any tenant
    const addons = await addonService.getAvailableAddons();
    res.json(addons);
  })
);

router.get(
  '/',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Default 50 for addons (usually small list)
    const result = await addonService.getTenantAddons(tenantId, page, limit);

    // NORMALISASI: Ensure data is always an array
    if (result && result.data) {
      result.data = Array.isArray(result.data) ? result.data : [];
    } else {
      result.data = [];
    }

    res.json(result);
  })
);

router.post(
  '/subscribe',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  validate({ body: subscribeAddonSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role!;

    // For SUPER_ADMIN, tenantId can be provided in body or query
    let tenantId: string;
    if (userRole === 'SUPER_ADMIN') {
      tenantId = req.body.tenantId || req.query.tenantId as string;
      if (!tenantId) {
        return res.status(400).json({ message: 'tenantId is required for super admin' });
      }
    } else {
      tenantId = requireTenantId(req);
    }

    // Check if addon is API-based (coming soon) - block subscription
    const { AVAILABLE_ADDONS } = await import('../services/addon.service');
    const addonInfo = AVAILABLE_ADDONS.find(a => a.id === req.body.addonId);
    if (addonInfo && (addonInfo.requiresApi === true || addonInfo.comingSoon === true)) {
      return res.status(400).json({ message: 'Addon ini belum tersedia (Coming Soon)' });
    }

    // Prepare data for service
    const addonData = {
      addonId: req.body.addonId,
      addonName: req.body.addonName,
      addonType: req.body.addonType,
      limit: req.body.limit || null,
      duration: req.body.duration || undefined,
      purchasedBy: userRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SELF', // Track purchase type
    };

    const addon = await addonService.subscribeAddon(tenantId, addonData);

    res.status(201).json(addon);
  })
);

router.post(
  '/unsubscribe/:addonId',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    await addonService.unsubscribeAddon(tenantId, req.params.addonId);
    res.status(204).send();
  })
);

router.get(
  '/check-limit/:type',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await addonService.checkLimit(tenantId, req.params.type);
    res.json(result);
  })
);

const extendAddonSchema = z.object({
  addonId: z.string(),
  duration: z.number().int().positive(),
});

router.post(
  '/extend',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  validate({ body: extendAddonSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await addonService.extendAddon(tenantId, req.body.addonId, req.body.duration);
    res.json(result);
  })
);

const reduceAddonSchema = z.object({
  addonId: z.string(),
  duration: z.number().int().positive(),
});

router.post(
  '/reduce',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  validate({ body: reduceAddonSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await addonService.reduceAddon(tenantId, req.body.addonId, req.body.duration);
    res.json(result);
  })
);

/**
 * Update addon (Super Admin only)
 */
// Update addon details (SUPER_ADMIN only)
router.put(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role!;

    // Only SUPER_ADMIN can update addon
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can update addon' });
    }

    const addonId = req.params.id;
    const { status, purchasedBy, durationDays } = req.body;

    // Check if addon exists
    const addon = await prisma.tenantAddon.findUnique({
      where: { id: addonId },
    });

    if (!addon) {
      return res.status(404).json({ message: 'Addon not found' });
    }

    // Calculate new expiresAt if durationDays is provided
    let newExpiresAt: Date | undefined;
    if (durationDays !== undefined && durationDays !== null) {
      const days = parseInt(durationDays);
      if (!isNaN(days) && days > 0) {
        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + days);
      }
    }

    // Update addon
    const updated = await prisma.tenantAddon.update({
      where: { id: addonId },
      data: {
        ...(status && { status }),
        ...(purchasedBy && { purchasedBy }),
        ...(newExpiresAt && { expiresAt: newExpiresAt }),
      },
    });

    res.json(updated);
  })
);

/**
 * Delete addon (Super Admin only)
 */
router.delete(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role!;

    // Only SUPER_ADMIN can delete addon
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can delete addon' });
    }

    const addonId = req.params.id;

    // Check if addon exists
    const addon = await prisma.tenantAddon.findUnique({
      where: { id: addonId },
    });

    if (!addon) {
      return res.status(404).json({ message: 'Addon not found' });
    }

    // Delete addon
    await prisma.tenantAddon.delete({
      where: { id: addonId },
    });

    res.json({ message: 'Addon deleted successfully' });
  })
);

/**
 * Bulk delete addons (Super Admin only)
 */
router.post(
  '/bulk-delete',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role!;

    // Only SUPER_ADMIN can bulk delete addons
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can bulk delete addons' });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required' });
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
  })
);

export default router;

