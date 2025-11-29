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
      // Use read replica for reporting
      const readReplica = getReadReplicaClient();

      const [orders, transactions] = await Promise.all([
        readReplica.order.findMany({
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

        readReplica.transaction.findMany({
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
      const readReplica = getReadReplicaClient();

      const orderItems = await readReplica.orderItem.findMany({
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
      const readReplica = getReadReplicaClient();

      const customers = await readReplica.customer.findMany({
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
      const readReplica = getReadReplicaClient();
      const tenants = await readReplica.tenant.findMany({
        include: {
          subscriptions: true,
          _count: {
            select: {
              users: true,
              orders: true,
            },
          },
        },
      });

      return {
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.isActive).length,
        totalUsers: tenants.reduce((sum, t) => sum + t._count.users, 0),
        totalOrders: tenants.reduce((sum, t) => sum + t._count.orders, 0),
        tenants,
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
      const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = options.endDate ? new Date(options.endDate) : new Date();
      
      // Set time to start/end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const period = options.period || 'all';
      const readReplica = getReadReplicaClient();
      
      // Get all orders with items and products
      const orders = await readReplica.order.findMany({
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
      const transactions = await readReplica.transaction.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'COMPLETED',
        },
      });

      // Calculate totals
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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

      return {
        summary: {
          totalRevenue,
          totalOrders,
          totalItems,
          averageOrderValue,
        },
        byDate,
        orders,
        transactions,
      };
    } catch (error: any) {
      logger.error('Error generating sales report', { error: error.message, tenantId });
      throw error;
    }
  }

  async generateProductReport(tenantId: string, options: any) {
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    return this.getProductPerformanceReport(tenantId, startDate, endDate);
  }

  async generateCustomerReport(tenantId: string, options: any) {
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    return this.getCustomerAnalytics(tenantId, startDate, endDate);
  }

  async generateInventoryReport(tenantId: string, options: any) {
    try {
      const readReplica = getReadReplicaClient();
      const products = await readReplica.product.findMany({
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
