import { Router, Response, Request } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { require2FA } from '../middlewares/require2fa';
import tenantService from '../services/tenant.service';
import { createTenantSchema, updateTenantSchema } from '../validators/tenant.validator';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import prisma from '../config/database';
import logger from '../utils/logger';
import { auditLogger } from '../middlewares/audit-logger';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();


// Only SUPER_ADMIN can create tenants
router.post(
  '/',
  authGuard,
  require2FA, // Require 2FA for admin roles when creating tenants (SUPER_ADMIN can bypass)
  validate({ body: createTenantSchema }),
  auditLogger('CREATE', 'tenants', (req) => {
    // Get tenant ID from response if available
    return (req as any).createdTenantId || null;
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Log request for debugging
    logger.info('Tenant creation request', {
      userId: req.userId,
      role: userRole,
      body: { ...req.body, name: req.body.name?.substring(0, 20) }, // Log partial name for privacy
    });

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized tenant creation attempt', {
        userId: req.userId,
        role: userRole,
        path: req.url,
      });
      return res.status(403).json({ message: 'Only super admin can create tenants' });
    }

    const result = await tenantService.createTenant(req.body);

    // Store tenant ID for audit logger
    (req as any).createdTenantId = result.tenant.id;

    res.status(201).json(result);
  })
);

router.get(
  '/',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized tenant list access attempt', {
        userId: req.userId,
        role: userRole,
        path: req.url,
      });
      return res.status(403).json({ message: 'Only super admin can view all tenants' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const includeCounts = req.query.includeCounts === 'true';

    const result = await tenantService.getTenants(page, limit, includeCounts, false); // Disable cache for super admin to always get fresh data

    // Log for debugging
    logger.info('Tenants list fetched', {
      userId: req.userId,
      page,
      limit,
      total: result.pagination?.total || 0,
      dataCount: result.data?.length || 0
    });

    // Return just the data array for easier frontend consumption
    res.json(result.data || []);
  })
);

// GET /tenants/:id/stores - Get all outlets/stores for a tenant
router.get(
  '/:id/stores',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can view tenant stores' });
    }

    const stores = await prisma.outlet.findMany({
      where: { tenantId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(stores);
  })
);

// GET /tenants/:id/users - Get all users for a tenant
router.get(
  '/:id/users',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can view tenant users' });
    }

    const users = await prisma.user.findMany({
      where: { tenantId: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  })
);

// GET /tenants/:id/subscription - Get active subscription for a tenant
router.get(
  '/:id/subscription',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can view tenant subscription' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId: req.params.id,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return empty object if no active subscription found
    res.json(subscription || {});
  })
);

// Update tenant subscription (SUPER_ADMIN only)
router.put(
  '/:id/subscription',
  authGuard,
  validate({
    body: z.object({
      plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE', 'DEMO']),
      status: z.enum(['ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED']),
      durationDays: z.number().int().min(1).optional(),
    })
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can update tenant subscription' });
    }

    const { plan, status, durationDays } = req.body;

    await tenantService.updateTenantSubscription(req.params.id, {
      plan,
      status,
      durationDays
    });

    res.json({ message: 'Subscription updated successfully' });
  })
);

// Delete tenant (only for SUPER_ADMIN) - must be before GET /:id to avoid route conflict
router.delete(
  '/:id',
  authGuard,
  require2FA, // Require 2FA for admin roles when deleting tenants
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized tenant deletion attempt', {
        userId: req.userId,
        role: userRole,
        tenantId: req.params.id,
      });
      return res.status(403).json({ message: 'Only super admin can delete tenants' });
    }

    await tenantService.deleteTenant(req.params.id);
    res.status(200).json({ message: 'Tenant deleted successfully' });
  })
);

router.get(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized tenant detail access attempt', {
        userId: req.userId,
        role: userRole,
        tenantId: req.params.id,
      });
      return res.status(403).json({ message: 'Only super admin can view tenant details' });
    }

    const tenant = await tenantService.getTenantById(req.params.id);

    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    res.json(tenant);
  })
);

/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     summary: Update tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  authGuard,
  require2FA, // Require 2FA for admin roles when updating tenants
  validate({ body: updateTenantSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized tenant update attempt', {
        userId: req.userId,
        role: userRole,
        tenantId: req.params.id,
      });
      return res.status(403).json({ message: 'Only super admin can update tenants' });
    }

    const updatedTenant = await tenantService.updateTenant(req.params.id, req.body);
    res.json(updatedTenant);
  })
);

const upgradePlanSchema = z.object({
  subscriptionPlan: z.enum(['DEMO', 'BASIC', 'PRO', 'ENTERPRISE']),
  durationDays: z.number().int().positive('Durasi harus lebih dari 0'),
});

/**
 * Temporary upgrade plan for tenant (for Super Admin)
 */
router.put(
  '/:id/upgrade-plan',
  authGuard,
  validate({ body: upgradePlanSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized plan upgrade attempt', {
        userId: req.userId,
        role: userRole,
        tenantId: req.params.id,
      });
      return res.status(403).json({ message: 'Only super admin can upgrade tenant plans' });
    }

    const tenantId = req.params.id;
    const { subscriptionPlan, durationDays } = req.body;

    // Get current tenant
    const tenant = await tenantService.getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const currentPlan = tenant.subscriptionPlan || 'BASIC';

    // Calculate end date: now + durationDays (duration in days)
    const now = new Date();
    const originalSubscriptionEnd = tenant.subscriptionEnd;

    // Always use now as base date for temporary upgrade (ignore current subscription end)
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Calculate amount based on plan price for global report
    const planPrices: Record<string, number> = {
      DEMO: 0, // Demo: Free trial
      BASIC: 149000, // Starter: Rp 149.000
      PRO: 299000, // Boost: Rp 299.000
      ENTERPRISE: 499000, // Pro: Rp 499.000
    };
    const planPrice = planPrices[subscriptionPlan] || 0;
    const amount = (planPrice * durationDays) / 30;

    // Perform temporary upgrade directly (admin action, no payment needed)
    await prisma.$transaction(async (tx) => {
      // Update tenant subscription plan and end date
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: subscriptionPlan,
          subscriptionEnd: endDate,
          ...(currentPlan !== subscriptionPlan ? {
            temporaryUpgrade: true,
            previousPlan: currentPlan,
          } : {
            temporaryUpgrade: false,
            previousPlan: null,
          }),
        } as any,
      });

      // Always create new subscription record for global report tracking
      const subscription = await tx.subscription.create({
        data: {
          tenantId,
          plan: subscriptionPlan,
          startDate: now,
          endDate: endDate,
          status: 'ACTIVE',
          amount: amount.toString(),
          ...(currentPlan !== subscriptionPlan ? {
            temporaryUpgrade: true,
            previousPlan: currentPlan,
          } : {}),
        } as any,
      });

      logger.info(`Subscription created for upgrade/extend tenant ${tenantId}:`, {
        subscriptionId: subscription.id,
        plan: subscriptionPlan,
        currentPlan,
        amount: amount,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Save to SubscriptionHistory with originalSubscriptionEnd info
      if (originalSubscriptionEnd && currentPlan !== subscriptionPlan) {
        const lastHistory = await tx.subscriptionHistory.findFirst({
          where: {
            tenantId: tenantId,
            isTemporary: false,
          },
          orderBy: { createdAt: 'desc' },
        });

        const needsHistory = !lastHistory || (lastHistory.endDate.getTime() !== originalSubscriptionEnd.getTime());
        if (needsHistory && originalSubscriptionEnd > now) {
          await tx.subscriptionHistory.create({
            data: {
              subscriptionId: subscription.id,
              tenantId: tenantId,
              planType: currentPlan,
              startDate: tenant.subscriptionStart || now,
              endDate: originalSubscriptionEnd,
              price: '0',
              durationDays: Math.ceil((originalSubscriptionEnd.getTime() - (tenant.subscriptionStart?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)),
              isTemporary: false,
              reverted: false,
            },
          });
          logger.info(`Created history record for original subscription (${currentPlan}) ending at ${originalSubscriptionEnd.toISOString()}`);
        }
      }

      // Create history for upgrade/extend
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          tenantId: tenantId,
          planType: subscriptionPlan,
          startDate: now,
          endDate: endDate,
          price: amount.toString(),
          durationDays: durationDays,
          isTemporary: currentPlan !== subscriptionPlan,
          reverted: false,
        },
      });

      // Auto activate users when subscription is active
      await tx.user.updateMany({
        where: {
          tenantId,
          role: {
            in: ['CASHIER', 'KITCHEN', 'SUPERVISOR'],
          },
        },
        data: {
          isActive: true,
        },
      });
    });

    res.json({
      success: true,
      message: 'Paket berhasil diupgrade (temporary)',
      tenant: await tenantService.getTenantById(tenantId),
      endDate: endDate.toISOString(),
      previousPlan: currentPlan,
      willRevertTo: currentPlan === 'BASIC' ? 'BASIC' : currentPlan,
    });
  })
);

/**
 * Deactivate subscription for a tenant (Super Admin only)
 */
router.put(
  '/:id/deactivate-subscription',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    if (userRole !== 'SUPER_ADMIN') {
      logger.warn('Unauthorized subscription deactivation attempt', {
        userId: req.userId,
        role: userRole,
        tenantId: req.params.id,
      });
      return res.status(403).json({ message: 'Only super admin can deactivate subscriptions' });
    }

    const tenantId = req.params.id;

    // Get current tenant
    const tenant = await tenantService.getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Deactivate subscription by setting subscriptionEnd to null
    await prisma.$transaction(async (tx) => {
      // Mark current active subscription as EXPIRED
      await tx.subscription.updateMany({
        where: {
          tenantId: tenantId,
        },
        data: {
          status: 'EXPIRED',
          ...({ temporaryUpgrade: false } as any),
          ...({ previousPlan: null } as any),
        },
      });

      // Update tenant: revert to BASIC, set subscriptionEnd to null
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: 'BASIC',
          subscriptionEnd: null,
          subscriptionStart: null,
          temporaryUpgrade: false,
          previousPlan: null,
        } as any,
      });
    });

    // Apply BASIC plan features
    const { applyPlanFeatures } = await import('../services/plan-features.service');
    await applyPlanFeatures(tenantId, 'BASIC');

    // Deactivate CASHIER, KITCHEN, SUPERVISOR users
    const { updateUserStatusBasedOnSubscription } = await import('../services/user-status.service');
    await updateUserStatusBasedOnSubscription(tenantId);

    // Reload tenant data
    const finalTenant = await tenantService.getTenantById(tenantId);

    res.json({
      message: 'Langganan berhasil dinonaktifkan',
      tenant: finalTenant,
    });
  })
);

// POST /tenants/:id/users - Create a new user for a tenant (SUPER_ADMIN only)
router.post(
  '/:id/users',
  authGuard,
  validate({
    body: z.object({
      name: z.string().min(1, 'Nama wajib diisi'),
      email: z.string().email('Email tidak valid'),
      role: z.enum(['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN']),
      password: z.string().optional(),
    })
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Only SUPER_ADMIN can create users for any tenant
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can create users for tenants' });
    }

    const tenantId = req.params.id;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Use userService to create the user
    const userService = (await import('../services/user.service')).default;
    const user = await userService.createUser(req.body, tenantId, userRole);

    // Log audit
    const { logAction } = await import('../middlewares/audit-logger');
    await logAction(
      req,
      'CREATE',
      'users',
      user.id,
      { email: user.email, name: user.name, role: user.role, tenantId },
      'SUCCESS'
    );

    res.status(201).json(user);
  })
);

// POST /tenants/:id/outlets - Create a new outlet for a tenant (SUPER_ADMIN only)
router.post(
  '/:id/outlets',
  authGuard,
  validate({
    body: z.object({
      name: z.string().min(1, 'Nama outlet wajib diisi'),
      address: z.string().optional(),
      phone: z.string().optional(),
      shiftConfig: z.array(z.object({
        name: z.string(),
        startTime: z.string(),
        endTime: z.string()
      })).optional(),
      operatingHours: z.record(z.string(), z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean()
      })).optional(),
    })
  }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Only SUPER_ADMIN can create outlets for any tenant
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can create outlets for tenants' });
    }

    const tenantId = req.params.id;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Use outletService to create the outlet
    const outletService = (await import('../services/outlet.service')).default;
    const outlet = await outletService.createOutlet(tenantId, req.body);

    // Log audit
    const { logAction } = await import('../middlewares/audit-logger');
    await logAction(
      req,
      'CREATE',
      'outlets',
      outlet.id,
      { name: outlet.name, address: outlet.address, tenantId },
      'SUCCESS'
    );

    res.status(201).json({ data: outlet });
  })
);

export default router;
