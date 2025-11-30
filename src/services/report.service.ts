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

      const totalRevenue = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum: number, o: any) => sum + o.items.length, 0);

      return {
        totalRevenue,
        totalOrders,
        totalItems,
        orders,
        transactions,
      };
    } catch (error: any) {
      logger.error('Error in getSalesReport', { error: error.message, tenantId, stack: error.stack });
      // Return empty structure instead of throwing to prevent 502
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalItems: 0,
        orders: [],
        transactions: [],
      };
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
      }).catch((error: any) => {
        logger.error('Error fetching orderItems in getProductPerformanceReport', { error: error.message, tenantId });
        return []; // Return empty array on error
      });

      // Group by product
      const productStats = (orderItems || []).reduce((acc: Record<string, any>, item: any) => {
        if (!item || !item.productId) {
          return acc; // Skip invalid items
        }
        const productId = item.productId;
        if (!acc[productId]) {
          acc[productId] = {
            product: item.product || null,
            quantity: 0,
            revenue: 0,
            orders: new Set(),
          };
        }
        acc[productId].quantity += Number(item.quantity || 0);
        acc[productId].revenue += Number(item.price || 0) * Number(item.quantity || 0);
        if (item.orderId) {
          acc[productId].orders.add(item.orderId);
        }
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and calculate order count
      return Object.values(productStats).map((stat: any) => ({
        product: stat.product || null,
        quantity: stat.quantity || 0,
        revenue: stat.revenue || 0,
        orderCount: stat.orders?.size || 0,
      }));
    } catch (error: any) {
      logger.error('Error generating product performance report', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
      });
      return []; // Return empty array on error
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
      }).catch((error: any) => {
        logger.error('Error fetching customers in getCustomerAnalytics', { error: error.message, tenantId });
        return []; // Return empty array on error
      });

      return (customers || []).map((customer: any) => {
        const orders = customer.orders || [];
        const totalSpent = orders.reduce(
          (sum: number, order: any) => sum + Number(order.total || 0),
          0
        );
        const orderCount = orders.length;

        return {
          customer,
          totalSpent,
          orderCount,
          averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
        };
      });
    } catch (error: any) {
      logger.error('Error generating customer analytics', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
      });
      return []; // Return empty array on error
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
      // Use select instead of include to avoid potential null reference issues
      const tenants = await dbClient.tenant.findMany({
        where: {
          name: {
            not: 'System',
          },
        },
        select: {
          id: true,
          name: true,
          isActive: true,
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
        },
      }).catch((error: any) => {
        logger.error('Error fetching tenants in getGlobalReport', { error: error.message });
        return []; // Return empty array on error
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
          id: true, // Add id for uniqueness
        },
      }).catch((error: any) => {
        logger.error('Error fetching orders in getGlobalReport', { error: error.message });
        return []; // Return empty array on error
      });

      // Calculate total revenue from all orders
      let totalSalesRevenue = 0;
      try {
        totalSalesRevenue = (allOrders || []).reduce((sum: number, order: any) => {
          try {
            return sum + Number(order?.total || 0);
          } catch (err: any) {
            logger.warn('Error calculating order revenue', { error: err.message, orderId: order?.id });
            return sum; // Continue with sum if error
          }
        }, 0);
      } catch (error: any) {
        logger.error('Error calculating total sales revenue', { error: error.message });
        totalSalesRevenue = 0; // Set to 0 on error
      }

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
      }).catch((error: any) => {
        logger.error('Error fetching subscriptions in getGlobalReport', { error: error.message });
        return []; // Return empty array on error
      });

      // Calculate subscription revenue (same logic as dashboard)
      let totalSubscriptionRevenue = 0;
      try {
        totalSubscriptionRevenue = (subscriptions || []).reduce((sum: number, sub: any) => {
          try {
            return sum + Number(sub?.amount || 0);
          } catch (err: any) {
            logger.warn('Error calculating subscription revenue', { error: err.message, subId: sub?.id });
            return sum; // Continue with sum if error
          }
        }, 0);
      } catch (error: any) {
        logger.error('Error calculating total subscription revenue', { error: error.message });
        totalSubscriptionRevenue = 0; // Set to 0 on error
      }

      // Get addon prices from service (same as dashboard)
      const { AVAILABLE_ADDONS } = await import('../services/addon.service');
      const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

      // Get addons - if no date range, get ALL addons (not just active, no status filter)
      // If date range provided, filter by subscribedAt
      const addonWhere: any = {};
      if (start && end) {
        // If date range provided, filter by subscribedAt
        // Only filter if subscribedAt is not null (subscribedAt should always be set)
        addonWhere.subscribedAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      // If no date range, get ALL addons (no status filter, no date filter) - same as dashboard logic for subscriptions
      // This ensures all addons are fetched regardless of status

      let addons: any[] = [];
      try {
        // Fetch ALL addons without status filter to ensure all data is shown
        addons = await dbClient.tenantAddon.findMany({
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
          // Don't use orderBy if subscribedAt might be null - sort manually instead
        });
        
        logger.info('Fetched addons for global report', {
          addonsCount: addons.length,
          hasDateFilter: !!(start && end),
          addonWhere: JSON.stringify(addonWhere),
          sampleAddon: addons.length > 0 ? {
            id: addons[0].id,
            addonId: addons[0].addonId,
            subscribedAt: addons[0].subscribedAt,
            status: addons[0].status,
            tenantName: addons[0].tenant?.name,
          } : null,
        });
      } catch (error: any) {
        logger.error('Error fetching addons in getGlobalReport', { error: error.message, stack: error.stack });
        addons = []; // Return empty array on error
      }
      
      // Sort addons manually: subscribedAt desc
      let sortedAddons: any[] = [];
      try {
        sortedAddons = (addons || []).sort((a: any, b: any) => {
          try {
            // Use subscribedAt (it's required field, but handle null case)
            const aDate = a?.subscribedAt;
            const bDate = b?.subscribedAt;
            if (!aDate && !bDate) return 0;
            if (!aDate) return 1; // Put null dates at the end
            if (!bDate) return -1; // Put null dates at the end
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          } catch (err: any) {
            logger.warn('Error sorting addon', { error: err.message });
            return 0;
          }
        });
      } catch (error: any) {
        logger.error('Error sorting addons', { error: error.message });
        sortedAddons = addons || []; // Use unsorted if sort fails
      }

      // Calculate addon revenue (same logic as dashboard)
      let totalAddonRevenue = 0;
      try {
        totalAddonRevenue = (sortedAddons || []).reduce((sum: number, addon: any) => {
          try {
            const price = addonPriceMap.get(addon?.addonId) || Number(addon?.addon?.price || (addon?.config as any)?.price || 0);
            // Use same calculation as dashboard: (price * duration) / 30
            const duration = addon?.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
              ? (addon.config as any).originalDuration || 30
              : 30;
            const revenue = (price * duration) / 30; // Convert to total revenue (same as dashboard)
            return sum + revenue;
          } catch (err: any) {
            logger.warn('Error calculating addon revenue', { error: err.message, addonId: addon?.id });
            return sum; // Continue with sum if error
          }
        }, 0);
      } catch (error: any) {
        logger.error('Error calculating total addon revenue', { error: error.message });
        totalAddonRevenue = 0; // Set to 0 on error
      }

      // Total global revenue = subscription + addon revenue (platform revenue)
      let totalGlobalRevenue = 0;
      try {
        totalGlobalRevenue = totalSubscriptionRevenue + totalAddonRevenue;
      } catch (error: any) {
        logger.error('Error calculating total global revenue', { error: error.message });
        totalGlobalRevenue = 0; // Set to 0 on error
      }

      // Count total orders
      const totalOrders = (allOrders || []).length;
      
      // Calculate tenant reports (performance per tenant)
      let tenantReports: any[] = [];
      try {
        const tenantReportsMap = new Map<string, { tenantId: string; tenantName: string; totalRevenue: number; totalOrders: number }>();
        
        // Group orders by tenant
        (allOrders || []).forEach((order: any) => {
          try {
            const tenantId = order?.tenantId;
            if (!tenantId) return;
            
            if (!tenantReportsMap.has(tenantId)) {
              // Find tenant name
              const tenant = (tenants || []).find((t: any) => t?.id === tenantId);
              tenantReportsMap.set(tenantId, {
                tenantId: tenantId,
                tenantName: tenant?.name || 'Unknown',
                totalRevenue: 0,
                totalOrders: 0,
              });
            }
            
            const report = tenantReportsMap.get(tenantId);
            if (report) {
              report.totalRevenue += Number(order?.total || 0);
              report.totalOrders += 1;
            }
          } catch (err: any) {
            logger.warn('Error processing order for tenantReports', { error: err.message, orderId: order?.id });
            // Continue processing other orders
          }
        });
        
        tenantReports = Array.from(tenantReportsMap.values());
      } catch (err: any) {
        logger.error('Error calculating tenantReports', { error: err.message, stack: err.stack });
        tenantReports = []; // Return empty array on error
      }
      
      // Log results for debugging
      logger.info('Global report query results', {
        totalSalesRevenue,
        totalSubscriptionRevenue,
        totalAddonRevenue,
        totalGlobalRevenue,
        totalTenants: tenants.length,
        activeTenants: tenants.filter((t: any) => t.isActive).length,
        totalOrders,
        ordersCount: allOrders.length,
        subscriptionsCount: subscriptions.length,
        addonsCount: sortedAddons.length,
        addonsRawCount: addons.length,
        tenantReportsCount: tenantReports.length,
        addonWhereFilter: JSON.stringify(addonWhere),
        hasDateRange: !!(start && end),
      });

      return {
        summary: {
          totalGlobalRevenue,
          totalSubscriptionRevenue,
          totalAddonRevenue,
          totalSalesRevenue, // Revenue from tenant sales
          totalTenants: tenants.length,
          activeTenants: tenants.filter((t: any) => t.isActive).length,
          totalUsers: tenants.reduce((sum: number, t: any) => sum + (t._count?.users || 0), 0),
          totalOrders,
        },
        tenants: tenants || [],
        subscriptions: (subscriptions || []).map((sub: any) => ({
          id: sub.id,
          tenantId: sub.tenantId,
          tenantName: sub.tenant?.name || 'Unknown',
          plan: sub.plan,
          status: sub.status,
          amount: Number(sub.amount || 0),
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
          addedBySuperAdmin: (sub.addedBySuperAdmin !== undefined) ? sub.addedBySuperAdmin : false, // Handle if field doesn't exist yet
        })),
        addons: (sortedAddons || []).map((addon: any) => {
          try {
            if (!addon || !addon.id) {
              logger.warn('Invalid addon data', { addon });
              return null;
            }
            
            const price = addonPriceMap.get(addon?.addonId) || Number(addon?.addon?.price || (addon?.config as any)?.price || 0);
            const duration = addon?.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
              ? (addon.config as any).originalDuration || 30
              : 30;
            const amount = (price * duration) / 30; // Calculate amount same as revenue calculation
            
            // Use subscribedAt (it's required field, but handle null case)
            const subscribedAt = addon?.subscribedAt ? new Date(addon.subscribedAt) : new Date();
            
            return {
              id: addon.id || '',
              addonId: addon.addonId || '',
              addonName: addon?.addon?.name || addon?.addonName || 'Unknown',
              tenantId: addon.tenantId || '',
              tenantName: addon?.tenant?.name || 'Unknown',
              status: addon.status || 'inactive',
              subscribedAt: subscribedAt,
              expiresAt: addon.expiresAt ? new Date(addon.expiresAt) : null,
              price: price,
              amount: amount, // Add amount field for display
              addedBySuperAdmin: (addon.addedBySuperAdmin !== undefined) ? addon.addedBySuperAdmin : false, // Handle if field doesn't exist yet
            };
          } catch (err: any) {
            logger.warn('Error mapping addon', { error: err.message, addonId: addon?.id, stack: err.stack });
            return null;
          }
        }).filter((addon: any) => addon !== null), // Filter out null entries
        tenantReports: tenantReports || [], // Add tenant reports for performance table
      };
    } catch (error: any) {
      logger.error('Error generating global report', { 
        error: error.message, 
        stack: error.stack,
        code: error.code,
        start: start?.toISOString(),
        end: end?.toISOString(),
      });
      
      // Return empty structure instead of throwing to prevent 502
      return {
        summary: {
          totalGlobalRevenue: 0,
          totalSubscriptionRevenue: 0,
          totalAddonRevenue: 0,
          totalSalesRevenue: 0,
          totalTenants: 0,
          activeTenants: 0,
          totalUsers: 0,
          totalOrders: 0,
        },
        tenants: [],
        subscriptions: [],
        addons: [],
        tenantReports: [],
      };
      
      // Don't throw error - return empty structure to prevent 502
      // All errors are already logged above
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
      if (!tenantId) {
        logger.error('Tenant ID is required in generateSalesReport');
        // Return empty structure instead of throwing
        return {
          summary: {
            totalRevenue: 0,
            totalOrders: 0,
            totalItems: 0,
            averageOrderValue: 0,
          },
          byDate: [],
          orders: [],
          transactions: [],
        };
      }
      
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
      }).catch((error: any) => {
        logger.error('Error fetching orders in generateSalesReport', { error: error.message, tenantId });
        return []; // Return empty array on error
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
      }).catch((error: any) => {
        logger.error('Error fetching transactions in generateSalesReport', { error: error.message, tenantId });
        return []; // Return empty array on error
      });
      
      // Calculate totals
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum: number, o: any) => sum + (o.items?.length || 0), 0);
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

      orders.forEach((order: any) => {
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
        options,
      });
      
      // Return empty report structure instead of throwing
      return {
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          totalItems: 0,
          averageOrderValue: 0,
        },
        byDate: [],
        orders: [],
        transactions: [],
      };
    }
  }

  async generateProductReport(tenantId: string, options: any) {
    try {
      if (!tenantId) {
        logger.error('Tenant ID is required in generateProductReport');
        // Return empty array instead of throwing
        return [];
      }
      
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
    
      return await this.getProductPerformanceReport(tenantId, startDate, endDate);
    } catch (error: any) {
      logger.error('Error generating product report', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
        options,
      });
      return []; // Return empty array on error
    }
  }

  async generateCustomerReport(tenantId: string, options: any) {
    try {
      if (!tenantId) {
        logger.error('Tenant ID is required in generateCustomerReport');
        // Return empty array instead of throwing
        return [];
      }
      
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
    
      return await this.getCustomerAnalytics(tenantId, startDate, endDate);
    } catch (error: any) {
      logger.error('Error generating customer report', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
        options,
      });
      return []; // Return empty array on error
    }
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
      }).catch((error: any) => {
        logger.error('Error fetching products in generateInventoryReport', { error: error.message, tenantId });
        return []; // Return empty array on error
      });
      
      return products || [];
    } catch (error: any) {
      logger.error('Error generating inventory report', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
        options,
      });
      return []; // Return empty array on error
    }
  }

  async generateFinancialReport(tenantId: string, options: any) {
    try {
      if (!tenantId) {
        logger.error('Tenant ID is required in generateFinancialReport');
        // Return empty structure instead of throwing
        return {
          summary: {
            totalRevenue: 0,
            totalCost: 0,
            grossProfit: 0,
            profitMargin: 0,
            totalOrders: 0,
            totalItems: 0,
            averageOrderValue: 0,
          },
          byDate: [],
          orders: [],
          transactions: [],
        };
      }
      
      // Financial report uses same structure as sales report but with cost/profit calculations
      const salesReport = await this.generateSalesReport(tenantId, options);
      
      // Ensure salesReport has required structure
      if (!salesReport || !salesReport.summary) {
        logger.warn('Sales report returned empty structure, returning empty financial report', { tenantId });
        return {
          summary: {
            totalRevenue: 0,
            totalOrders: 0,
            totalItems: 0,
            averageOrderValue: 0,
          },
          byDate: [],
          revenue: 0,
          costOfGoods: 0,
          grossProfit: 0,
          profitMargin: 0,
        };
      }
    
    // Calculate financial summary
    const totalCostOfGoods = salesReport.byDate?.reduce((sum: number, item: any) => sum + (item.costOfGoods || 0), 0) || 0;
    const totalGrossProfit = salesReport.summary.totalRevenue - totalCostOfGoods;
    const overallProfitMargin = salesReport.summary.totalRevenue > 0 
      ? (totalGrossProfit / salesReport.summary.totalRevenue) * 100 
      : 0;

      return {
        ...salesReport,
        revenue: salesReport.summary.totalRevenue || 0,
        costOfGoods: totalCostOfGoods,
        grossProfit: totalGrossProfit,
        profitMargin: overallProfitMargin,
      };
    } catch (error: any) {
      logger.error('Error generating financial report', { 
        error: error.message, 
        tenantId,
        stack: error.stack,
        options,
      });
      
      // Return empty financial report structure
      return {
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          totalItems: 0,
          averageOrderValue: 0,
        },
        byDate: [],
        revenue: 0,
        costOfGoods: 0,
        grossProfit: 0,
        profitMargin: 0,
      };
    }
  }

  generateGlobalReportPDF(report: any, start?: Date, end?: Date): string {
    return `<html><body><h1>Global Report</h1><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`;
  }
}

export default new ReportService();
