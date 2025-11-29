/**
 * Report Service
 * Uses read replica for reporting queries to reduce load on master database
 */

import prisma from '../config/database';
import { getReadReplicaClient } from '../config/database-replica';
import logger from '../utils/logger';

export class ReportService {
  /**
   * Get sales report (uses read replica)
   */
  async getSalesReport(tenantId: string, startDate: Date, endDate: Date) {
    try {
      // Try to use read replica, fallback to main database if it fails
      let dbClient: any;
      try {
        dbClient = getReadReplicaClient();
      } catch (error: any) {
        logger.warn('Read replica not available, using main database', { error: error.message });
        dbClient = prisma;
      }

      const [orders, transactions] = await Promise.all([
        dbClient.order.findMany({
          where: {
            tenantId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: 'COMPLETED',
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        }),

        dbClient.transaction.findMany({
          where: {
            tenantId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: 'COMPLETED',
          },
        }),
      ]);

      const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);

      return {
        totalRevenue,
        totalOrders,
        totalItems,
        orders,
        transactions,
      };
    } catch (error: any) {
      logger.error('Error generating sales report', { error: error.message, tenantId });
      throw error;
    }
  }

  /**
   * Get product performance report (uses read replica)
   */
  async getProductPerformanceReport(tenantId: string, startDate: Date, endDate: Date) {
    try {
      // Try to use read replica, fallback to main database if it fails
      let dbClient: any;
      try {
        dbClient = getReadReplicaClient();
      } catch (error: any) {
        logger.warn('Read replica not available, using main database', { error: error.message });
        dbClient = prisma;
      }

      const orderItems = await dbClient.orderItem.findMany({
        where: {
          order: {
            tenantId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: 'COMPLETED',
          },
        },
        include: {
          product: true,
          order: true,
        },
      });

      // Group by product
      const productStats = orderItems.reduce((acc, item) => {
        const productId = item.productId;
        if (!acc[productId]) {
          acc[productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0,
            orders: new Set(),
          };
        }
        acc[productId].quantity += item.quantity;
        acc[productId].revenue += Number(item.price) * item.quantity;
        acc[productId].orders.add(item.orderId);
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and calculate order count
      return Object.values(productStats).map((stat: any) => ({
        product: stat.product,
        quantity: stat.quantity,
        revenue: stat.revenue,
        orderCount: stat.orders.size,
      }));
    } catch (error: any) {
      logger.error('Error generating product performance report', { error: error.message, tenantId });
      throw error;
    }
  }

  /**
   * Get customer analytics (uses read replica)
   */
  async getCustomerAnalytics(tenantId: string, startDate: Date, endDate: Date) {
    try {
      // Try to use read replica, fallback to main database if it fails
      let dbClient: any;
      try {
        dbClient = getReadReplicaClient();
      } catch (error: any) {
        logger.warn('Read replica not available, using main database', { error: error.message });
        dbClient = prisma;
      }

      const customers = await dbClient.customer.findMany({
        where: {
          tenantId,
        },
        include: {
          orders: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              status: 'COMPLETED',
            },
            include: {
              items: true,
            },
          },
        },
      });

      return customers.map((customer) => {
        const totalSpent = customer.orders.reduce(
          (sum, order) => sum + Number(order.total),
          0
        );
        const orderCount = customer.orders.length;

        return {
          customer,
          totalSpent,
          orderCount,
          averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        };
      });
    } catch (error: any) {
      logger.error('Error generating customer analytics', { error: error.message, tenantId });
      throw error;
    }
  }

  // Stub methods for compatibility with routes
  async getGlobalReport(start?: Date, end?: Date) {
    try {
      // Try to use read replica, fallback to main database if it fails
      let dbClient: any;
      try {
        dbClient = getReadReplicaClient();
      } catch (error: any) {
        logger.warn('Read replica not available for global report, using main database', { error: error.message });
        dbClient = prisma;
      }
      
      // Set date range - if no dates provided, get all data (use very old date)
      const startDate = start || new Date('2000-01-01');
      const endDate = end || new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Log for debugging
      logger.info('Generating global report', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        hasDateFilter: !!(start || end),
      });

      // Get all tenants - filter subscriptions and orders by date range if provided
      const tenantInclude: any = {
        subscriptions: start && end ? {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        } : true, // If no date range, get all subscriptions
        _count: {
          select: {
            users: true,
            orders: start && end ? {
              where: {
                status: 'COMPLETED',
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            } : {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      };

      const tenants = await dbClient.tenant.findMany({
        where: {
          name: {
            not: 'System',
          },
        },
        include: tenantInclude,
      });

      // Get all completed orders - if no date range, get all (same as dashboard doesn't filter orders by date for tenant count)
      const orderWhere: any = {
        status: 'COMPLETED',
      };
      if (start && end) {
        orderWhere.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const allOrders = await dbClient.order.findMany({
        where: orderWhere,
        select: {
          total: true,
          tenantId: true,
        },
      });

      // Calculate total revenue from all orders
      const totalSalesRevenue = allOrders.reduce((sum, order) => sum + Number(order.total), 0);

      // Get subscriptions - if no date range, get all subscriptions (same as dashboard)
      // If date range provided, filter by createdAt
      const subscriptionWhere: any = {};
      if (start && end) {
        // If date range provided, filter by createdAt
        subscriptionWhere.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      // If no date range, get all subscriptions (same as dashboard logic)

      const subscriptions = await dbClient.subscription.findMany({
        where: subscriptionWhere,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate subscription revenue (same logic as dashboard)
      const totalSubscriptionRevenue = subscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0);

      // Get addon prices from service (same as dashboard)
      const { AVAILABLE_ADDONS } = await import('../services/addon.service');
      const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

      // Get addons - if no date range, get all active addons (same as dashboard)
      // If date range provided, filter by subscribedAt
      const addonWhere: any = {};
      if (start && end) {
        // If date range provided, filter by subscribedAt
        addonWhere.subscribedAt = {
          gte: startDate,
          lte: endDate,
        };
      } else {
        // If no date range, get all active addons (same as dashboard logic)
        addonWhere.status = 'active';
      }

      const addons = await dbClient.tenantAddon.findMany({
        where: addonWhere,
        include: {
          addon: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          subscribedAt: 'desc',
        },
      });

      // Calculate addon revenue (same logic as dashboard)
      const totalAddonRevenue = addons.reduce((sum, addon) => {
        const price = addonPriceMap.get(addon.addonId) || Number(addon.addon?.price || (addon.config as any)?.price || 0);
        // Use same calculation as dashboard: (price * duration) / 30
        const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
          ? (addon.config as any).originalDuration || 30
          : 30;
        const revenue = (price * duration) / 30; // Convert to total revenue (same as dashboard)
        return sum + revenue;
      }, 0);

      // Total global revenue = subscription + addon revenue (platform revenue)
      const totalGlobalRevenue = totalSubscriptionRevenue + totalAddonRevenue;

      // Count total orders
      const totalOrders = allOrders.length;
      
      // Log results for debugging
      logger.info('Global report query results', {
        totalSalesRevenue,
        totalSubscriptionRevenue,
        totalAddonRevenue,
        totalGlobalRevenue,
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.isActive).length,
        totalOrders,
        ordersCount: allOrders.length,
        subscriptionsCount: subscriptions.length,
        addonsCount: addons.length,
      });

      return {
        summary: {
          totalGlobalRevenue,
          totalSubscriptionRevenue,
          totalAddonRevenue,
          totalSalesRevenue, // Revenue from tenant sales
          totalTenants: tenants.length,
          activeTenants: tenants.filter(t => t.isActive).length,
          totalUsers: tenants.reduce((sum, t) => sum + t._count.users, 0),
          totalOrders,
        },
        tenants,
        subscriptions: subscriptions.map((sub: any) => ({
          id: sub.id,
          tenantId: sub.tenantId,
          tenantName: sub.tenant?.name || 'Unknown',
          plan: sub.plan,
          status: sub.status,
          amount: Number(sub.amount),
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
          addedBySuperAdmin: (sub.addedBySuperAdmin !== undefined) ? sub.addedBySuperAdmin : false, // Handle if field doesn't exist yet
        })),
        addons: addons.map((addon: any) => ({
          id: addon.id,
          addonId: addon.addonId,
          addonName: addon.addon?.name || 'Unknown',
          tenantId: addon.tenantId,
          tenantName: addon.tenant?.name || 'Unknown',
          status: addon.status,
          subscribedAt: addon.subscribedAt,
          expiresAt: addon.expiresAt,
          price: Number(addon.addon?.price || (addon.config as any)?.price || 0),
          addedBySuperAdmin: (addon.addedBySuperAdmin !== undefined) ? addon.addedBySuperAdmin : false, // Handle if field doesn't exist yet
        })),
      };
    } catch (error: any) {
      logger.error('Error generating global report', { error: error.message });
      throw error;
    }
  }

  async getTenantReport(tenantId: string, start?: Date, end?: Date, type: string = 'sales') {
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end || new Date();

    switch (type) {
      case 'sales':
        return this.getSalesReport(tenantId, startDate, endDate);
      case 'products':
        return this.getProductPerformanceReport(tenantId, startDate, endDate);
      case 'customers':
        return this.getCustomerAnalytics(tenantId, startDate, endDate);
      default:
        return this.getSalesReport(tenantId, startDate, endDate);
    }
  }

  async generateSalesReport(tenantId: string, options: any) {
    try {
      const period = options.period || 'all';
      
      // If period is 'all' and no date range specified, get all data
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (options.startDate && options.endDate) {
        startDate = new Date(options.startDate);
        endDate = new Date(options.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (period !== 'all') {
        // If period is specified but no date range, use default 30 days
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }
      // If period is 'all' and no date range, startDate and endDate will be undefined (get all data)
      
      // Try to use read replica, fallback to main database if it fails
      let dbClient: any;
      try {
        dbClient = getReadReplicaClient();
      } catch (error: any) {
        logger.warn('Read replica not available, using main database', { error: error.message });
        dbClient = prisma;
      }
      
      // Build where clause
      const whereClause: any = {
        tenantId,
        status: 'COMPLETED',
      };
      
      // Only add date filter if dates are provided
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      
      // Log query for debugging
      logger.info('Generating sales report', {
        tenantId,
        period,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        hasDateFilter: !!(startDate && endDate),
      });
      
      // Get all orders with items and products
      const orders = await dbClient.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Get transactions
      const transactionWhereClause: any = {
        tenantId,
        status: 'COMPLETED',
      };
      
      if (startDate && endDate) {
        transactionWhereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      
      const transactions = await dbClient.transaction.findMany({
        where: transactionWhereClause,
      });
      
      // Calculate totals
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Log results for debugging
      logger.info('Sales report query results', {
        tenantId,
        period,
        ordersCount: orders.length,
        transactionsCount: transactions.length,
        totalRevenue,
        totalOrders,
        totalItems,
        averageOrderValue,
        hasDateFilter: !!(startDate && endDate),
        dateRange: startDate && endDate ? `${startDate.toISOString()} to ${endDate.toISOString()}` : 'all time',
      });

      // Group by date based on period
      const byDate: any[] = [];
      const dateGroups: Record<string, { orders: any[]; revenue: number; count: number }> = {};

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        let dateKey: string;
        let dateLabel: string;

        if (period === 'daily') {
          dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
          dateLabel = dateKey;
        } else if (period === 'weekly') {
          // Get week start (Monday)
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay() + (orderDate.getDay() === 0 ? -6 : 1));
          dateKey = weekStart.toISOString().split('T')[0];
          dateLabel = `${dateKey} (Week ${Math.ceil((orderDate.getDate() + new Date(orderDate.getFullYear(), orderDate.getMonth(), 1).getDay()) / 7)})`;
        } else if (period === 'monthly') {
          dateKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          dateLabel = new Date(orderDate.getFullYear(), orderDate.getMonth(), 1).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
        } else {
          // 'all' - group all in one
          dateKey = 'all';
          dateLabel = 'All Time';
        }

        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = {
            orders: [],
            revenue: 0,
            count: 0,
          };
        }

        dateGroups[dateKey].orders.push(order);
        dateGroups[dateKey].revenue += Number(order.total);
        dateGroups[dateKey].count += 1;
      });

      // Convert to array format
      Object.keys(dateGroups).sort().forEach((dateKey) => {
        const group = dateGroups[dateKey];
        const dateObj = period === 'daily' 
          ? new Date(dateKey) 
          : period === 'monthly'
          ? new Date(dateKey + '-01')
          : period === 'weekly'
          ? new Date(dateKey)
          : new Date();

        // Calculate cost of goods from order items
        let costOfGoods = 0;
        group.orders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const cost = Number(item.cost || item.product?.cost || 0);
              costOfGoods += cost * item.quantity;
            });
          }
        });

        const grossProfit = group.revenue - costOfGoods;
        const profitMargin = group.revenue > 0 ? (grossProfit / group.revenue) * 100 : 0;

        byDate.push({
          date: dateObj.toISOString(),
          dateLabel: period === 'daily' 
            ? new Date(dateKey).toLocaleDateString('id-ID')
            : period === 'monthly'
            ? new Date(dateKey + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
            : period === 'weekly'
            ? `Week of ${new Date(dateKey).toLocaleDateString('id-ID')}`
            : 'All Time',
          revenue: group.revenue,
          count: group.count,
          orders: group.orders,
          costOfGoods,
          grossProfit,
          profitMargin,
        });
      });

      // Ensure byDate is not empty - if no orders, return empty array with proper structure
      const result = {
        summary: {
          totalRevenue: totalRevenue || 0,
          totalOrders: totalOrders || 0,
          totalItems: totalItems || 0,
          averageOrderValue: averageOrderValue || 0,
        },
        byDate: byDate.length > 0 ? byDate : [],
        orders: orders || [],
        transactions: transactions || [],
      };
      
      // Log final result for debugging
      logger.info('Sales report final result', {
        tenantId,
        summary: result.summary,
        byDateCount: result.byDate.length,
        ordersCount: result.orders.length,
      });
      
      return result;
    } catch (error: any) {
      logger.error('Error generating sales report', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
      });
      throw error;
    }
  }

  async generateProductReport(tenantId: string, options: any) {
    const period = options.period || 'all';
    
    // If period is 'all' and no date range specified, get all data
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (options.startDate && options.endDate) {
      startDate = new Date(options.startDate);
      endDate = new Date(options.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period !== 'all') {
      // If period is specified but no date range, use default 30 days
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // If period is 'all' and no date range, use a very old date to get all data
      startDate = new Date('2000-01-01');
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    return this.getProductPerformanceReport(tenantId, startDate, endDate);
  }

  async generateCustomerReport(tenantId: string, options: any) {
    const period = options.period || 'all';
    
    // If period is 'all' and no date range specified, get all data
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (options.startDate && options.endDate) {
      startDate = new Date(options.startDate);
      endDate = new Date(options.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period !== 'all') {
      // If period is specified but no date range, use default 30 days
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // If period is 'all' and no date range, use a very old date to get all data
      startDate = new Date('2000-01-01');
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    return this.getCustomerAnalytics(tenantId, startDate, endDate);
  }

  async generateInventoryReport(tenantId: string, options: any) {
    try {
      // Try to use read replica, fallback to main database if it fails
      let dbClient: any;
      try {
        dbClient = getReadReplicaClient();
      } catch (error: any) {
        logger.warn('Read replica not available, using main database', { error: error.message });
        dbClient = prisma;
      }
      
      const products = await dbClient.product.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      });
      return products;
    } catch (error: any) {
      logger.error('Error generating inventory report', { error: error.message, tenantId });
      throw error;
    }
  }

  async generateFinancialReport(tenantId: string, options: any) {
    // Financial report uses same structure as sales report but with cost/profit calculations
    const salesReport = await this.generateSalesReport(tenantId, options);
    
    // Calculate financial summary
    const totalCostOfGoods = salesReport.byDate?.reduce((sum: number, item: any) => sum + (item.costOfGoods || 0), 0) || 0;
    const totalGrossProfit = salesReport.summary.totalRevenue - totalCostOfGoods;
    const overallProfitMargin = salesReport.summary.totalRevenue > 0 
      ? (totalGrossProfit / salesReport.summary.totalRevenue) * 100 
      : 0;

    return {
      ...salesReport,
      revenue: salesReport.summary.totalRevenue,
      costOfGoods: totalCostOfGoods,
      grossProfit: totalGrossProfit,
      profitMargin: overallProfitMargin,
    };
  }

  generateGlobalReportPDF(report: any, start?: Date, end?: Date): string {
    return `<html><body><h1>Global Report</h1><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`;
  }
}

export default new ReportService();
