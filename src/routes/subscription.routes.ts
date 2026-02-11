import { Router, Response } from 'express';
import { authGuard, roleGuard, AuthRequest } from '../middlewares/auth';
import subscriptionService from '../services/subscription.service';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { asyncHandler } from '../utils/route-error-handler';

const router = Router();

const extendSubscriptionSchema = z.object({
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).optional(),
  duration: z.number().int().positive(),
});

router.get(
  '/current',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await subscriptionService.getCurrentSubscription(tenantId);
    res.json(result);
  })
);

router.post(
  '/extend',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  validate({ body: extendSubscriptionSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.role;

    // Only ADMIN_TENANT and SUPER_ADMIN can extend subscription
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only tenant admin or super admin can extend subscription' });
    }

    // If plan is provided, use extendSubscription
    // If only duration is provided (Super Admin), use extendSubscriptionCustom
    if (req.body.plan) {
      const result = await subscriptionService.extendSubscription(tenantId, {
        plan: req.body.plan,
        duration: req.body.duration,
        purchasedBy: userRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SELF', // Track purchase type
      });
      res.json(result);
    } else {
      // Super Admin can extend with custom duration without changing plan
      if (userRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Plan is required for tenant admin' });
      }
      const result = await subscriptionService.extendSubscriptionCustom(tenantId, req.body.duration, {
        purchasedBy: userRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SELF', // Track purchase type
      });
      res.json(result);
    }
  })
);

const upgradeSubscriptionSchema = z.object({
  newPlan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  upgradeType: z.enum(['temporary', 'until_end', 'custom']),
  customDuration: z.number().int().positive().optional(),
});

const reduceSubscriptionSchema = z.object({
  duration: z.number().int().positive(),
});

router.post(
  '/upgrade',
  authGuard,
  roleGuard('SUPER_ADMIN', 'ADMIN_TENANT'),
  validate({ body: upgradeSubscriptionSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.role;

    // Only ADMIN_TENANT and SUPER_ADMIN can upgrade subscription
    if (userRole !== 'ADMIN_TENANT' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only tenant admin or super admin can upgrade subscription' });
    }

    const result = await subscriptionService.upgradeSubscription(tenantId, {
      newPlan: req.body.newPlan,
      upgradeType: req.body.upgradeType,
      customDuration: req.body.customDuration,
      purchasedBy: userRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SELF', // Track purchase type
    });
    res.json(result);
  })
);

router.post(
  '/reduce',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  validate({ body: reduceSubscriptionSchema }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const userRole = req.role;

    // Only SUPER_ADMIN can reduce subscription
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can reduce subscription' });
    }

    const result = await subscriptionService.reduceSubscriptionCustom(tenantId, req.body.duration);
    res.json(result);
  })
);

router.get(
  '/history',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tenantId = requireTenantId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    // Get subscription history from SubscriptionHistory table
    const subscriptions = await prisma.subscriptionHistory.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.subscriptionHistory.count({
      where: { tenantId },
    });

    res.json({
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * Manual trigger for reverting temporary upgrades
 * Only accessible by SUPER_ADMIN
 */
router.post(
  '/revert-temporary',
  authGuard,
  roleGuard('SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Only SUPER_ADMIN can trigger manual revert
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can trigger revert' });
    }

    const result = await subscriptionService.revertTemporaryUpgrades();
    res.json({
      success: true,
      message: `Reverted ${result.reverted} temporary upgrades, ${result.failed} failed`,
      ...result,
    });
  })
);

/**
 * Update subscription (Super Admin only)
 */
router.put(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Only SUPER_ADMIN can update subscription
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can update subscription' });
    }

    const subscriptionId = req.params.id;
    const { plan, amount, status, purchasedBy } = req.body;

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update subscription
    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(plan && { plan }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(status && { status }),
        ...(purchasedBy && { purchasedBy }),
      },
    });

    res.json(updated);
  })
);

/**
 * Delete subscription (Super Admin only)
 */
router.delete(
  '/:id',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Only SUPER_ADMIN can delete subscription
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can delete subscription' });
    }

    const subscriptionId = req.params.id;

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: {
          select: {
            id: true,
            subscriptionPlan: true,
            subscriptionEnd: true,
            subscriptionStart: true,
          },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const tenantId = subscription.tenantId;

    // Delete subscription
    await prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    // Check if there are other active subscriptions for this tenant
    const otherActiveSubscriptions = await prisma.subscription.findFirst({
      where: {
        tenantId: tenantId,
        id: { not: subscriptionId },
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });

    if (!otherActiveSubscriptions) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          subscriptionEnd: true,
          subscriptionPlan: true,
        },
      });

      const now = new Date();
      // Only revert if subscriptionEnd is expired or null
      if (!tenant?.subscriptionEnd || tenant.subscriptionEnd < now) {
        // No active subscriptions and subscriptionEnd is expired, revert to BASIC
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionPlan: 'BASIC',
            temporaryUpgrade: false,
            previousPlan: null,
          },
        });

        // Apply BASIC plan features
        const { applyPlanFeatures } = await import('../services/plan-features.service');
        await applyPlanFeatures(tenantId, 'BASIC');

        // Deactivate users
        const { updateUserStatusBasedOnSubscription } = await import('../services/user-status.service');
        await updateUserStatusBasedOnSubscription(tenantId);
      }
    }

    res.json({ message: 'Subscription deleted successfully' });
  })
);

/**
 * Bulk delete subscriptions (Super Admin only)
 */
router.post(
  '/bulk-delete',
  authGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.role;

    // Only SUPER_ADMIN can bulk delete subscriptions
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admin can bulk delete subscriptions' });
    }

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required' });
    }

    // Get subscriptions to be deleted to check their tenantIds
    const subscriptionsToDelete = await prisma.subscription.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        tenantId: true,
      },
    });

    // Get unique tenantIds
    const tenantIds = [...new Set(subscriptionsToDelete.map(s => s.tenantId))];

    // Delete subscriptions
    const result = await prisma.subscription.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    const now = new Date();

    // For each affected tenant, check if they still have active subscriptions
    for (const tenantId of tenantIds) {
      const otherActiveSubscriptions = await prisma.subscription.findFirst({
        where: {
          tenantId: tenantId,
          id: { notIn: ids },
          status: 'ACTIVE',
          endDate: { gte: now },
        },
      });

      if (!otherActiveSubscriptions) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            subscriptionEnd: true,
            subscriptionPlan: true,
          },
        });

        // Only revert if subscriptionEnd is expired or null
        if (!tenant?.subscriptionEnd || tenant.subscriptionEnd < now) {
          // No active subscriptions and subscriptionEnd is expired, revert to BASIC
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionPlan: 'BASIC',
              temporaryUpgrade: false,
              previousPlan: null,
            },
          });

          // Apply BASIC plan features
          const { applyPlanFeatures } = await import('../services/plan-features.service');
          await applyPlanFeatures(tenantId, 'BASIC');

          // Deactivate users
          const { updateUserStatusBasedOnSubscription } = await import('../services/user-status.service');
          await updateUserStatusBasedOnSubscription(tenantId);
        }
      }
    }

    res.json({
      message: `${result.count} subscription(s) deleted successfully`,
      deletedCount: result.count,
    });
  })
);

export default router;

