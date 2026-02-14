import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import { supervisorStoresGuard } from '../middlewares/supervisor-store-guard';
import dashboardService from '../services/dashboard.service';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { asyncHandler, handleRouteError } from '../utils/route-error-handler';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         description: Tenant ID (required for SUPER_ADMIN)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                 totalOrders:
 *                   type: integer
 *                 totalCustomers:
 *                   type: integer
 *                 charts:
 *                   type: object
 *                   properties:
 *                     salesOverTime:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           total:
 *                             type: number
 *                           count:
 *                             type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/stats',
  authGuard,
  subscriptionGuard,
  supervisorStoresGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;

    // For Super Admin without selected tenant, return addon & subscription stats
    if (userRole === 'SUPER_ADMIN') {
      const queryTenantId = req.query.tenantId as string;
      if (!queryTenantId) {
        // Return super admin stats (addon & subscription revenue)
        return res.json(await getSuperAdminStats());
      }

      // Super Admin with tenantId selected
      const { startDate, endDate } = req.query;
      const stats = await dashboardService.getDashboardStats(
        queryTenantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      return res.json(stats);
    }

    // For other roles, require tenantId from user
    const tenantId = requireTenantId(req);

    const { startDate, endDate } = req.query;

    // Auto-filter berdasarkan assignedStoreId untuk kasir/dapur
    const assignedStoreId = (req as any).assignedStoreId || req.user?.assignedStoreId;
    const outletId = assignedStoreId || undefined;

    const stats = await dashboardService.getDashboardStats(
      tenantId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      true,
      outletId
    );
    res.json(stats);
  })
);

/**
 * @swagger
 * /api/dashboard/stats/cashier:
 *   get:
 *     summary: Get cashier dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/stats/cashier',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    if (user.role !== 'CASHIER') {
      return res.status(403).json({ message: 'Access denied. Cashier only.' });
    }

    const tenantId = requireTenantId(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Auto-filter berdasarkan assignedStoreId untuk kasir
    const assignedStoreId = (req as any).assignedStoreId || user.assignedStoreId;
    const outletFilter = assignedStoreId ? { outletId: assignedStoreId } : {};

    const [todayOrders, todayRevenue, recentTransactions] = await Promise.all([
      prisma.order.count({
        where: {
          tenantId,
          userId: user.id,
          createdAt: { gte: today },
          ...outletFilter,
        },
      }),
      prisma.order.aggregate({
        where: {
          tenantId,
          userId: user.id,
          status: 'COMPLETED',
          createdAt: { gte: today },
          ...outletFilter,
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: {
          tenantId,
          userId: user.id,
          ...outletFilter,
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

    res.json({
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      recentTransactions,
    });
  })
);

/**
 * @swagger
 * /api/dashboard/stats/kitchen:
 *   get:
 *     summary: Get kitchen dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/stats/kitchen',
  authGuard,
  subscriptionGuard,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    if (user.role !== 'KITCHEN') {
      return res.status(403).json({ message: 'Access denied. Kitchen only.' });
    }

    const tenantId = requireTenantId(req);

    // Auto-filter berdasarkan assignedStoreId untuk kitchen
    const assignedStoreId = (req as any).assignedStoreId || user.assignedStoreId;
    const outletFilter = assignedStoreId ? { outletId: assignedStoreId } : {};

    const [pendingOrders, cookingOrders, readyOrders] = await Promise.all([
      prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: 'PENDING',
          ...outletFilter,
        },
      }),
      prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: 'COOKING',
          ...outletFilter,
        },
      }),
      prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: 'READY',
          ...outletFilter,
        },
      }),
    ]);

    res.json({
      pendingOrders,
      cookingOrders,
      readyOrders,
      totalOrders: pendingOrders + cookingOrders + readyOrders,
    });
  })
);

/**
 * Get Super Admin Dashboard Stats
 * Focus on Addon & Subscription revenue (not tenant orders)
 */
async function getSuperAdminStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get addon prices from service
    const { AVAILABLE_ADDONS } = await import('../services/addon.service');
    const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

    // Calculate addon revenue
    const allAddons = await prisma.tenantAddon.findMany({
      where: { status: 'active' },
      include: { tenant: { select: { name: true } } },
      orderBy: { subscribedAt: 'desc' },
    });

    // Calculate subscription revenue
    const allSubscriptions = await prisma.subscription.findMany({
      include: { tenant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate addon revenue
    let totalAddonRevenue = 0;
    let todayAddonRevenue = 0;
    let thisMonthAddonRevenue = 0;
    const addonCounts = new Map<string, number>();

    for (const addon of allAddons) {
      const price = addonPriceMap.get(addon.addonId) || 0;
      const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
        ? (addon.config as any).originalDuration || 30
        : 30;
      const revenue = (price * duration) / 30; // Convert to total revenue

      totalAddonRevenue += revenue;
      if (new Date(addon.subscribedAt) >= todayStart) {
        todayAddonRevenue += revenue;
      }
      if (new Date(addon.subscribedAt) >= thisMonthStart) {
        thisMonthAddonRevenue += revenue;
      }

      const count = addonCounts.get(addon.addonId) || 0;
      addonCounts.set(addon.addonId, count + 1);
    }

    // Calculate subscription revenue
    let totalSubscriptionRevenue = 0;
    let todaySubscriptionRevenue = 0;
    let thisMonthSubscriptionRevenue = 0;
    let activeSubscriptions = 0;
    const subscriptionCounts = new Map<string, number>();

    for (const sub of allSubscriptions) {
      const amount = Number(sub.amount);
      totalSubscriptionRevenue += amount;
      if (new Date(sub.createdAt) >= todayStart) {
        todaySubscriptionRevenue += amount;
      }
      if (new Date(sub.createdAt) >= thisMonthStart) {
        thisMonthSubscriptionRevenue += amount;
      }
      if (sub.status === 'ACTIVE' && new Date(sub.endDate) >= now) {
        activeSubscriptions++;
      }

      const count = subscriptionCounts.get(sub.plan) || 0;
      subscriptionCounts.set(sub.plan, count + 1);
    }

    // Top selling addons
    const topAddons = Array.from(addonCounts.entries())
      .map(([addonId, count]) => {
        const addonInfo = AVAILABLE_ADDONS.find(a => a.id === addonId);
        return {
          addonId,
          name: addonInfo?.name || addonId,
          count,
          revenue: (addonInfo?.price || 0) * count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent subscriptions (last 10)
    const recentSubscriptions = allSubscriptions.slice(0, 10).map(sub => ({
      id: sub.id,
      tenantName: sub.tenant.name,
      plan: sub.plan,
      amount: Number(sub.amount),
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      createdAt: sub.createdAt,
    }));

    // Recent addon purchases (last 10)
    const recentAddons = allAddons.slice(0, 10).map(addon => ({
      id: addon.id,
      tenantName: addon.tenant.name,
      addonName: addon.addonName,
      addonType: addon.addonType,
      subscribedAt: addon.subscribedAt,
      expiresAt: addon.expiresAt,
      status: addon.status,
    }));

    // Calculate growth
    const lastMonthAddonRevenue = allAddons
      .filter(a => {
        const date = new Date(a.subscribedAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, addon) => {
        const price = addonPriceMap.get(addon.addonId) || 0;
        const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
          ? (addon.config as any).originalDuration || 30
          : 30;
        return sum + (price * duration) / 30;
      }, 0);

    const lastMonthSubscriptionRevenue = allSubscriptions
      .filter(s => {
        const date = new Date(s.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, sub) => sum + Number(sub.amount), 0);

    const totalRevenue = totalAddonRevenue + totalSubscriptionRevenue;
    const lastMonthTotalRevenue = lastMonthAddonRevenue + lastMonthSubscriptionRevenue;
    const revenueGrowth = lastMonthTotalRevenue > 0
      ? ((totalRevenue - lastMonthTotalRevenue) / lastMonthTotalRevenue) * 100
      : 0;

    // Get tenant stats
    // Exclude super admin users from tenant count
    // Active tenants = tenants with ACTIVE subscription and endDate >= now
    const currentDate = new Date();
    const [totalTenants, activeTenantsCount, totalUsers] = await Promise.all([
      prisma.tenant.count({
        where: {
          name: {
            not: 'System',
          },
        },
      }),
      // Count tenants with active subscription (not just isActive flag)
      // Use groupBy to get distinct tenantIds with active subscriptions
      prisma.subscription.groupBy({
        by: ['tenantId'],
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: currentDate,
          },
          tenant: {
            name: {
              not: 'System',
            },
          },
        },
      }).then(result => result.length),
      prisma.user.count({
        where: {
          role: {
            not: 'SUPER_ADMIN',
          },
        },
      }),
    ]);

    const activeTenants = activeTenantsCount;

    return {
      overview: {
        totalAddonRevenue,
        totalSubscriptionRevenue,
        totalRevenue,
        totalAddons: allAddons.length,
        activeSubscriptions,
        totalTenants,
        activeTenants,
        totalUsers,
        todayAddonRevenue,
        todaySubscriptionRevenue,
        todayRevenue: todayAddonRevenue + todaySubscriptionRevenue,
        thisMonthAddonRevenue,
        thisMonthSubscriptionRevenue,
        thisMonthRevenue: thisMonthAddonRevenue + thisMonthSubscriptionRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      },
      topAddons,
      recentSubscriptions,
      recentAddons,
      subscriptionBreakdown: Array.from(subscriptionCounts.entries()).map(([plan, count]) => ({
        plan,
        count,
      })),
    };
  } catch (error: any) {
    logger.error('Error in getSuperAdminStats:', { error: error.message, stack: error.stack });

    // Handle database connection errors
    if (error.code === 'P1001' ||
      error.message?.includes('Can\'t reach database server') ||
      error.message?.includes('connection') ||
      error.message?.includes('Database connection error')) {
      throw {
        code: 'P1001',
        message: 'Database connection error. Please check your database configuration.',
      };
    }

    // Re-throw other errors
    throw error;
  }
}

export default router;

