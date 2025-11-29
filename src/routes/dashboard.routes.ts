import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { subscriptionGuard } from '../middlewares/subscription-guard';
import dashboardService from '../services/dashboard.service';
import { requireTenantId } from '../utils/tenant';
import prisma from '../config/database';
import { handleApiError } from '../utils/error-handler';

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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/stats',
  authGuard,
  subscriptionGuard,
  async (req: Request, res: Response, next) => {
    try {
      const user = (req as any).user;
      const userRole = user?.role;
      
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
      let tenantId: string;
      try {
        tenantId = requireTenantId(req);
      } catch (error: any) {
        // If tenantId is missing, return 400 with helpful message
        return res.status(400).json({ 
          message: error.message || 'Tenant ID is required',
          error: 'TENANT_ID_REQUIRED'
        });
      }
      
      const { startDate, endDate } = req.query;
      const stats = await dashboardService.getDashboardStats(
        tenantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(stats);
    } catch (error: any) {
      // Don't throw error - return error response to prevent 502
      console.error('Error in dashboard stats route:', error);
      logger.error('Error in dashboard stats route', {
        error: error.message,
        stack: error.stack,
        userRole: (req as any).user?.role,
      });
      
      // Return empty stats instead of throwing
      res.status(500).json({
        message: error.message || 'Failed to load dashboard stats',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (user.role !== 'CASHIER') {
        return res.status(403).json({ message: 'Access denied. Cashier only.' });
      }

      const tenantId = requireTenantId(req);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayOrders, todayRevenue, recentTransactions] = await Promise.all([
        prisma.order.count({
          where: {
            tenantId,
            userId: user.id,
            createdAt: { gte: today },
          },
        }),
        prisma.order.aggregate({
          where: {
            tenantId,
            userId: user.id,
            status: 'COMPLETED',
            createdAt: { gte: today },
          },
          _sum: { total: true },
        }),
        prisma.order.findMany({
          where: {
            tenantId,
            userId: user.id,
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
    } catch (error: any) {
      handleApiError(res, error, 'Failed to load cashier stats');
    }
  }
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
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (user.role !== 'KITCHEN') {
        return res.status(403).json({ message: 'Access denied. Kitchen only.' });
      }

      const tenantId = requireTenantId(req);

      const [pendingOrders, cookingOrders, readyOrders] = await Promise.all([
        prisma.order.count({
          where: {
            tenantId,
            sendToKitchen: true,
            kitchenStatus: 'PENDING',
          },
        }),
        prisma.order.count({
          where: {
            tenantId,
            sendToKitchen: true,
            kitchenStatus: 'COOKING',
          },
        }),
        prisma.order.count({
          where: {
            tenantId,
            sendToKitchen: true,
            kitchenStatus: 'READY',
          },
        }),
      ]);

      res.json({
        pendingOrders,
        cookingOrders,
        readyOrders,
        totalOrders: pendingOrders + cookingOrders + readyOrders,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Failed to load kitchen stats');
    }
  }
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

    // Calculate addon revenue - get ALL addons (not just active) to match report logic
    const allAddons = await prisma.tenantAddon.findMany({
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
      
      // Use subscribedAt (it's required field, but handle null case)
      const subscribedAt = addon.subscribedAt;
      if (subscribedAt && new Date(subscribedAt) >= todayStart) {
        todayAddonRevenue += revenue;
      }
      if (subscribedAt && new Date(subscribedAt) >= thisMonthStart) {
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
      tenantName: addon.tenant?.name || 'Unknown',
      addonName: addon.addonName,
      addonType: addon.addonType,
      subscribedAt: addon.subscribedAt,
      expiresAt: addon.expiresAt,
      status: addon.status,
    }));

    // Calculate growth
    const lastMonthAddonRevenue = allAddons
      .filter(a => {
        // Use subscribedAt (it's required field, but handle null case)
        if (!a.subscribedAt) return false;
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
    const [totalTenants, activeTenants, totalUsers] = await Promise.all([
      prisma.tenant.count({
        where: {
          name: {
            not: 'System',
          },
        },
      }),
      prisma.tenant.count({ 
        where: { 
          isActive: true,
          name: {
            not: 'System',
          },
        } 
      }),
      prisma.user.count(),
    ]);

    return {
      overview: {
        totalAddonRevenue,
        totalSubscriptionRevenue,
        totalRevenue, // Total Pendapatan (Subscription + Addons only, no orders)
        totalGlobalRevenue: totalRevenue, // Alias for frontend compatibility
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
    console.error('Error in getSuperAdminStats:', error);
    
    // Return empty structure instead of throwing to prevent 502
    return {
      overview: {
        totalAddonRevenue: 0,
        totalSubscriptionRevenue: 0,
        totalRevenue: 0,
        totalGlobalRevenue: 0,
        totalAddons: 0,
        activeSubscriptions: 0,
        totalTenants: 0,
        activeTenants: 0,
        totalUsers: 0,
        todayAddonRevenue: 0,
        todaySubscriptionRevenue: 0,
        todayRevenue: 0,
        thisMonthAddonRevenue: 0,
        thisMonthSubscriptionRevenue: 0,
        thisMonthRevenue: 0,
        revenueGrowth: 0,
      },
      topAddons: [],
      recentSubscriptions: [],
      recentAddons: [],
      subscriptionBreakdown: [],
    };
  }
}

export default router;

