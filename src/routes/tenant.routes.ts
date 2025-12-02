import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { require2FA } from '../middlewares/require2fa';
import tenantService from '../services/tenant.service';
import { createTenantSchema, updateTenantSchema } from '../validators/tenant.validator';
import { validate } from '../middlewares/validator';
import { z } from 'zod';
import prisma from '../config/database';
import logger from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';
import { auditLogger } from '../middlewares/audit-logger';
import { handleRouteError } from '../utils/route-error-handler';
import { AppError } from '../utils/app-error';

const router = Router();

/**
 * Helper to log route errors with context
 */
function logRouteError(error: unknown, context: string, req: any) {
  const err = error as Error & { 
    code?: string; 
    statusCode?: number; 
    message?: string;
    name?: string;
    stack?: string;
  };
  
  logger.error(`Tenant route error [${context}]:`, {
    message: err.message,
    name: err.name,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.url || req.path,
    method: req.method,
    userId: req.userId,
    tenantId: req.tenantId,
  });
}

// Only SUPER_ADMIN can create tenants
router.post(
  '/',
  authGuard,
  require2FA, // Require 2FA for admin roles when creating tenants (SUPER_ADMIN can bypass)
  validate({ body: createTenantSchema }),
  auditLogger('CREATE', 'tenants', (req) => {
    // Get tenant ID from response if available
    // Get tenant ID from response if available (set by route handler)
    return (req as AuthRequest & { createdTenantId?: string }).createdTenantId || null;
  }),
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role || (authReq as any).user?.role;
      
      // Log request for debugging
      logger.info('Tenant creation request', {
        userId: authReq.userId,
        role: userRole,
        body: { ...req.body, name: req.body.name?.substring(0, 20) }, // Log partial name for privacy
      });
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized tenant creation attempt', {
          userId: authReq.userId,
          role: userRole,
          path: req.url,
        });
        const error = new Error('Only super admin can create tenants');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can create tenants', 'CREATE_TENANT');
        return;
      }

      const result = await tenantService.createTenant(req.body);
      
      // Store tenant ID for audit logger
      (req as any).createdTenantId = result.tenant.id;
      
      res.status(201).json(result);
    } catch (error: unknown) {
      logRouteError(error, 'CREATE_TENANT', req);
      handleRouteError(res, error, 'Gagal membuat tenant', 'CREATE_TENANT');
    }
  }
);

router.get(
  '/',
  authGuard,
  async (req: Request, res: Response, next) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role;
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized tenant list access attempt', {
          userId: authReq.userId,
          role: userRole,
          path: req.url,
        });
        const error = new AppError('Only super admin can view all tenants', 403, 'FORBIDDEN');
        handleRouteError(res, error, 'Only super admin can view all tenants', 'GET_TENANTS');
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const includeCounts = req.query.includeCounts === 'true';
      
      let result;
      try {
        result = await tenantService.getTenants(page, limit, includeCounts, false); // Disable cache for super admin to always get fresh data
      } catch (serviceError: unknown) {
        const err = serviceError as Error & { code?: string; message?: string };
        logRouteError(serviceError, 'GET_TENANTS_SERVICE', req);
        
        // Handle database connection errors and Prisma errors
        handleRouteError(res, serviceError, 'Database error occurred while fetching tenants', 'GET_TENANTS');
        return;
      }
      
      // Log for debugging
      logger.info('Tenants list fetched', {
        userId: (req as AuthRequest).userId,
        page,
        limit,
        total: result.pagination?.total || 0,
        dataCount: result.data?.length || 0
      });
      
      // Return just the data array for easier frontend consumption
      res.json(result.data || []);
    } catch (error: unknown) {
      logRouteError(error, 'GET_TENANTS', req);
      if (!res.headersSent) {
        handleRouteError(res, error, 'Failed to fetch tenants', 'GET_TENANTS');
      }
    }
  }
);

// Delete tenant (only for SUPER_ADMIN) - must be before GET /:id to avoid route conflict
router.delete(
  '/:id',
  authGuard,
  require2FA, // Require 2FA for admin roles when deleting tenants
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role || (authReq as any).user?.role;
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized tenant deletion attempt', {
          userId: authReq.userId,
          role: userRole,
          tenantId: req.params.id,
        });
        const error = new Error('Only super admin can delete tenants');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can delete tenants', 'DELETE_TENANT');
        return;
      }

      await tenantService.deleteTenant(req.params.id);
      res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (error: unknown) {
      logRouteError(error, 'DELETE_TENANT', req);
      handleRouteError(res, error, 'Failed to delete tenant', 'DELETE_TENANT');
    }
  }
);

const upgradePlanSchema = z.object({
  subscriptionPlan: z.enum(['BASIC', 'PRO', 'CUSTOM']),
  durationDays: z.number().int().positive('Durasi harus lebih dari 0'),
});

/**
 * Temporary upgrade plan for tenant (for Super Admin)
 */
router.put(
  '/:id/upgrade-plan',
  authGuard,
  validate({ body: upgradePlanSchema }),
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role || (authReq as any).user?.role;
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized plan upgrade attempt', {
          userId: authReq.userId,
          role: userRole,
          tenantId: req.params.id,
        });
        const error = new Error('Only super admin can upgrade tenant plans');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can upgrade tenant plans', 'UPGRADE_PLAN');
        return;
      }

      const tenantId = req.params.id;
      const { subscriptionPlan, durationDays } = req.body;

      // Get current tenant
      const tenant = await tenantService.getTenantById(tenantId);
      if (!tenant) {
        const error = new Error('Tenant not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Tenant not found', 'UPGRADE_PLAN');
        return;
      }

      const currentPlan = tenant.subscriptionPlan || 'BASIC';
      
      // Calculate end date: now + durationDays (duration in days)
      const now = new Date();
      const originalSubscriptionEnd = tenant.subscriptionEnd;
      
      // Always use now as base date for temporary upgrade (ignore current subscription end)
      const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Calculate amount based on plan price for global report
      const planPrices: Record<string, number> = {
        BASIC: 200000,
        PRO: 350000,
        CUSTOM: 500000,
      };
      const planPrice = planPrices[subscriptionPlan] || 0;
      const amount = (planPrice * durationDays) / 30;

      // Perform temporary upgrade directly (admin action, no payment needed)
      try {
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
      } catch (txError: unknown) {
        const err = txError as Error & { code?: string; message?: string };
        logRouteError(txError, 'UPGRADE_PLAN_TRANSACTION', req);
        
        // Handle database connection errors and Prisma errors
        handleRouteError(res, txError, 'Database error occurred during plan upgrade', 'UPGRADE_PLAN');
        return;
      }

      res.json({
        success: true,
        message: 'Paket berhasil diupgrade (temporary)',
        tenant: await tenantService.getTenantById(tenantId),
        endDate: endDate.toISOString(),
        previousPlan: currentPlan,
        willRevertTo: currentPlan === 'BASIC' ? 'BASIC' : currentPlan,
      });
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number; message?: string; code?: string };
      logRouteError(error, 'UPGRADE_PLAN', req);
      
      if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
      }
      
      // Handle all errors using handleRouteError
      handleRouteError(res, error, 'Failed to upgrade plan', 'UPGRADE_PLAN');
    }
  }
);

router.get(
  '/:id',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role || (authReq as any).user?.role;
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized tenant detail access attempt', {
          userId: authReq.userId,
          role: userRole,
          tenantId: req.params.id,
        });
        const error = new Error('Only super admin can view tenant details');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can view tenant details', 'GET_TENANT_BY_ID');
        return;
      }

      const tenant = await tenantService.getTenantById(req.params.id);
      
      if (!tenant) {
        const error = new Error('Tenant not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Tenant not found', 'GET_TENANT_BY_ID');
        return;
      }
      
      res.json(tenant);
    } catch (error: unknown) {
      logRouteError(error, 'GET_TENANT_BY_ID', req);
      handleRouteError(res, error, 'Failed to fetch tenant', 'GET_TENANT_BY_ID');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role || (authReq as any).user?.role;
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized tenant update attempt', {
          userId: authReq.userId,
          role: userRole,
          tenantId: req.params.id,
        });
        const error = new Error('Only super admin can update tenants');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can update tenants', 'UPDATE_TENANT');
        return;
      }

      const updatedTenant = await tenantService.updateTenant(req.params.id, req.body);
      res.json(updatedTenant);
    } catch (error: unknown) {
      logRouteError(error, 'UPDATE_TENANT', req);
      handleRouteError(res, error, 'Failed to update tenant', 'UPDATE_TENANT');
    }
  }
);

/**
 * Deactivate subscription for a tenant (Super Admin only)
 */
router.put(
  '/:id/deactivate-subscription',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const userRole = authReq.role || (authReq as any).user?.role;
      
      if (userRole !== 'SUPER_ADMIN') {
        logger.warn('Unauthorized subscription deactivation attempt', {
          userId: authReq.userId,
          role: userRole,
          tenantId: req.params.id,
        });
        const error = new Error('Only super admin can deactivate subscriptions');
        (error as any).statusCode = 403;
        handleRouteError(res, error, 'Only super admin can deactivate subscriptions', 'DEACTIVATE_SUBSCRIPTION');
        return;
      }

      const tenantId = req.params.id;
      
      // Get current tenant
      const tenant = await tenantService.getTenantById(tenantId);
      if (!tenant) {
        const error = new Error('Tenant not found');
        (error as any).statusCode = 404;
        handleRouteError(res, error, 'Tenant not found', 'DEACTIVATE_SUBSCRIPTION');
        return;
      }

      // Deactivate subscription by setting subscriptionEnd to null
      const now = new Date();
      let updatedTenant;
      
      try {
        updatedTenant = await prisma.$transaction(async (tx) => {
          // Delete all temporary subscriptions first
          await tx.subscription.deleteMany({
            where: {
              tenantId: tenantId,
              temporaryUpgrade: true,
            },
          });

          // Update ALL subscriptions to set endDate to past
          const expiredDate = new Date(now.getTime() - 1000);
          await tx.subscription.updateMany({
            where: {
              tenantId: tenantId,
              OR: [
                { status: 'ACTIVE' },
                { status: 'EXPIRED' },
              ],
              endDate: {
                gt: expiredDate,
              },
            },
            data: {
              status: 'EXPIRED',
              endDate: expiredDate,
              ...({ temporaryUpgrade: false } as any),
              ...({ previousPlan: null } as any),
            },
          });

          // Also update all subscriptions regardless of endDate
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
          const tenant = await tx.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionPlan: 'BASIC',
              subscriptionEnd: null,
              subscriptionStart: null,
              temporaryUpgrade: false,
              previousPlan: null,
            } as any,
          });

          return tenant;
        });
      } catch (txError: unknown) {
        const err = txError as Error & { code?: string; message?: string };
        logRouteError(txError, 'DEACTIVATE_SUBSCRIPTION_TRANSACTION', req);
        
        // Handle database connection errors and Prisma errors
        handleRouteError(res, txError, 'Database error occurred during subscription deactivation', 'DEACTIVATE_SUBSCRIPTION');
        return;
      }

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
    } catch (error: unknown) {
      const err = error as Error & { code?: string; message?: string };
      logRouteError(error, 'DEACTIVATE_SUBSCRIPTION', req);
      
      // Handle database errors
      if (err.code?.startsWith('P')) {
        if (err.code === 'P1001' || err.code === 'P1002' || err.message?.includes('connect')) {
          handleRouteError(res, error, 'Database connection failed. Please try again.', 'DEACTIVATE_SUBSCRIPTION');
        } else {
          handleRouteError(res, error, 'Database error occurred', 'DEACTIVATE_SUBSCRIPTION');
        }
        return;
      }
      
      handleRouteError(res, error, 'Gagal menonaktifkan langganan', 'DEACTIVATE_SUBSCRIPTION');
    }
  }
);

export default router;
