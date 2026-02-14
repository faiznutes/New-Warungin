import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../config/database';
import orderService from './order.service';
import logger from '../utils/logger';
import CacheService from '../utils/cache';

// Export interface untuk type safety
export interface TopProductDetail {
  product: {
    id: string;
    name: string;
    price: number;
    cost: number | null;
    stock: number;
    category: string | null;
  };
  totalQuantity: number;
  totalRevenue: number;
}

export class DashboardService {
  async getDashboardStats(tenantId: string, startDate?: Date, endDate?: Date, useCache: boolean = true, outletId?: string) {
    // Create cache key based on tenant, dates
    const cacheKey = `dashboard:${tenantId}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`;

    // Try to get from cache first
    if (useCache) {
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const where: Prisma.OrderWhereInput = {
        tenantId,
        ...(outletId && { outletId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      const [
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
        totalMembers,
        lowStockProducts,
        todayOrders,
        todayRevenue,
        recentOrders,
      ] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { total: true },
        }),
        prisma.product.count({ where: { tenantId, isActive: true } }),
        prisma.customer.count({ where: { tenantId } }),
        prisma.member.count({ where: { tenantId, isActive: true } }),
        (async () => {
          const allProducts = await prisma.product.findMany({
            where: {
              tenantId,
              isActive: true,
            },
          });
          return allProducts.filter(p => p.stock <= p.minStock).slice(0, 5);
        })(),
        prisma.order.count({
          where: {
            tenantId,
            ...(outletId && { outletId }),
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.order.aggregate({
          where: {
            tenantId,
            ...(outletId && { outletId }),
            status: 'COMPLETED',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          _sum: { total: true },
        }),
        prisma.order.findMany({
          where: {
            tenantId,
            ...(outletId && { outletId }),
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            customer: true,
          },
        }),
      ]);

      // Calculate growth (compare with previous period)
      const previousStartDate = startDate
        ? new Date(startDate.getTime() - (endDate!.getTime() - startDate.getTime()))
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const previousEndDate = startDate || new Date();

      const previousRevenue = await prisma.order.aggregate({
        where: {
          tenantId,
          ...(outletId && { outletId }),
          status: 'COMPLETED',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
        _sum: { total: true },
      });

      const currentRevenue = Number(totalRevenue._sum.total || 0);
      const previousRevenueValue = Number(previousRevenue._sum.total || 0);
      const revenueGrowth = previousRevenueValue > 0
        ? ((currentRevenue - previousRevenueValue) / previousRevenueValue) * 100
        : 0;

      // Sales by status
      const salesByStatus = await prisma.order.groupBy({
        by: ['status'],
        where: {
          tenantId,
          ...(outletId && { outletId }),
        },
        _count: { id: true },
      });

      // Top products - Optimized to avoid N+1 queries
      let topProductsWithDetails: TopProductDetail[] = [];
      try {
        const topProducts = await prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: {
              tenantId,
              status: 'COMPLETED',
              ...(outletId && { outletId }),
            },
          },
          _sum: {
            quantity: true,
            subtotal: true,
          },
          orderBy: {
            _sum: {
              quantity: 'desc',
            },
          },
          take: 10, // Take more to filter nulls
        });

        // Filter out null productIds and take top 5
        const validTopProducts = topProducts
          .filter((item) => item.productId !== null)
          .slice(0, 5);

        // Optimize: Fetch all products in one query instead of N queries
        const productIds = validTopProducts
          .map((item) => item.productId!);

        if (productIds.length > 0) {
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              name: true,
              price: true,
              cost: true,
              stock: true,
              category: true,
            },
          });

          // Create a map for O(1) lookup
          const productMap = new Map(products.map(p => [p.id, p]));

          topProductsWithDetails = validTopProducts
            .filter((item) => item.productId && productMap.has(item.productId))
            .map((item) => {
              const product = productMap.get(item.productId!);
              if (product && item._sum) {
                return {
                  product: {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    cost: product.cost ? Number(product.cost) : null,
                    stock: product.stock,
                    category: product.category,
                  },
                  totalQuantity: Number(item._sum.quantity || 0),
                  totalRevenue: Number(item._sum.subtotal || 0),
                };
              }
              return null;
            })
            .filter((item): item is TopProductDetail => item !== null);
        }
      } catch (error: unknown) {
        const err = error as Error;
        logger.warn('Error fetching top products:', err);
        // Continue with empty array if top products query fails
        topProductsWithDetails = [];
      }

      // Sales over time chart
      const salesOverTime = await this.getSalesChartData(tenantId, startDate, endDate, outletId);

      // Cache the result (5 minutes TTL for dashboard stats)
      const result = {
        overview: {
          totalOrders,
          totalRevenue: currentRevenue,
          totalProducts,
          totalCustomers,
          totalMembers,
          todayOrders,
          todayRevenue: Number(todayRevenue._sum.total || 0),
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        },
        alerts: {
          lowStockProducts: lowStockProducts.length,
          lowStockProductsList: lowStockProducts,
        },
        charts: {
          salesByStatus: salesByStatus.map((item) => ({
            status: item.status,
            count: item._count.id,
          })),
          topProducts: topProductsWithDetails,
          salesOverTime, // Add new chart data
        },
        recentOrders,
      };

      if (useCache) {
        await CacheService.set(cacheKey, result, 300);
      }

      return result;
    } catch (error: unknown) {
      const err = error as Error & { code?: string; message?: string };
      logger.error('Error in getDashboardStats:', err);

      // Handle database connection errors
      if (err.code === 'P1001' ||
        err.message?.includes('Can\'t reach database server') ||
        err.message?.includes('connection') ||
        err.message?.includes('Database connection error')) {
        throw {
          code: 'P1001',
          message: 'Database connection error. Please check your database configuration.',
        };
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get sales chart data (daily aggregation)
   */
  async getSalesChartData(tenantId: string, startDate?: Date, endDate?: Date, outletId?: string) {
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30)); // Default 30 days
    const end = endDate || new Date();

    // Use Prisma's raw query for date aggregation (PostgreSQL specific)
    // Adjust logic based on database type if needed, but assuming Postgres per rules
    const salesData = await prisma.$queryRaw<{ date: string; total: number; count: number }[]>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
        SUM("total") as total,
        COUNT("id") as count
      FROM "orders"
      WHERE "tenantId" = ${tenantId}
        AND "status" = 'COMPLETED'
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
        ${outletId ? Prisma.sql`AND "outletId" = ${outletId}` : Prisma.sql``}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    // Fill in missing dates with 0
    const filledData = [];
    const currentDate = new Date(start);
    const lastDate = new Date(end);

    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = salesData.find((d) => d.date === dateStr);

      filledData.push({
        date: dateStr,
        total: existing ? Number(existing.total) : 0,
        count: existing ? Number(existing.count) : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledData;
  }
}

export default new DashboardService();

