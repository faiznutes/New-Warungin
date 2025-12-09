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
  async getSalesReport(tenantId: string, startDate: Date, endDate: Date, userRole?: string, userPermissions?: any) {
    try {
      // Use read replica for reporting
      const readReplica = getReadReplicaClient();

      // Filter by store permissions
      let outletFilter: any = {};
      
      // CASHIER dan KITCHEN: otomatis filter berdasarkan assignedStoreId
      if ((userRole === 'CASHIER' || userRole === 'KITCHEN') && userPermissions?.assignedStoreId) {
        const assignedStoreId = userPermissions.assignedStoreId;
        outletFilter = { outletId: assignedStoreId };
      }
      // SUPERVISOR: filter berdasarkan allowedStoreIds
      else if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
        const allowedStoreIds = userPermissions.allowedStoreIds;
        if (allowedStoreIds.length > 0) {
          outletFilter = { outletId: { in: allowedStoreIds } };
        } else {
          // No stores assigned, return empty report
          return {
            totalRevenue: 0,
            totalOrders: 0,
            totalItems: 0,
            orders: [],
            transactions: [],
          };
        }
      }

      const [orders, transactions] = await Promise.all([
        readReplica.order.findMany({
          where: {
            tenantId,
            ...outletFilter,
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
            ...(outletFilter.outletId
              ? {
                  order: {
                    outletId: typeof outletFilter.outletId === 'string' 
                      ? outletFilter.outletId 
                      : outletFilter.outletId,
                  },
                }
              : {}),
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
      const productStats = orderItems.reduce((acc: Record<string, any>, item: any) => {
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

      return customers.map((customer: any) => {
        const totalSpent = customer.orders.reduce(
          (sum: number, order: any) => sum + Number(order.total),
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
      
      logger.info('Generating global report', { start, end });
      
      // Build date filters
      let subscriptionFilter: any = {};
      let addonFilter: any = {};
      
      if (start || end) {
        const filter: any = {};
        if (start) {
          filter.gte = new Date(start);
          filter.gte.setHours(0, 0, 0, 0);
        }
        if (end) {
          filter.lte = new Date(end);
          filter.lte.setHours(23, 59, 59, 999);
        }
        subscriptionFilter.createdAt = filter;
        addonFilter.subscribedAt = filter;
      }

      // Get all tenants (exclude System tenant)
      const tenants = await readReplica.tenant.findMany({
        where: {
          name: {
            not: 'System',
          },
        },
        include: {
          subscriptions: {
            where: subscriptionFilter.createdAt ? subscriptionFilter : undefined,
          },
          _count: {
            select: {
              users: true,
              orders: true,
            },
          },
        },
      });

      // Get all subscriptions within date range
      const subscriptions = await readReplica.subscription.findMany({
        where: subscriptionFilter.createdAt ? subscriptionFilter : undefined,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        select: {
          id: true,
          tenantId: true,
          plan: true,
          amount: true,
          createdAt: true,
          status: true,
          endDate: true,
          purchasedBy: true,
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

      // Get all addons within date range
      const addons = await readReplica.tenantAddon.findMany({
        where: addonFilter.subscribedAt ? addonFilter : undefined,
        include: {
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

      // Get addon prices
      const { AVAILABLE_ADDONS } = await import('./addon.service');
      const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

      // Calculate subscription revenue
      let totalSubscriptionRevenue = 0;
      const subscriptionList = subscriptions.map((sub: any) => {
        const amount = Number(sub.amount);
        totalSubscriptionRevenue += amount;
        return {
          id: sub.id,
          tenantId: sub.tenant.id,
          tenantName: sub.tenant.name,
          plan: sub.plan,
          amount: amount,
          createdAt: sub.createdAt,
          status: sub.status,
          purchasedBy: (sub as any).purchasedBy || 'SELF', // "ADMIN" atau "SELF"
        };
      });

      // Calculate addon revenue
      let totalAddonRevenue = 0;
      const addonList = addons.map((addon: any) => {
        const price = addonPriceMap.get(addon.addonId) || 0;
        const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
          ? (addon.config as any).originalDuration || 30
          : 30;
        const revenue = (price * duration) / 30; // Convert to total revenue
        totalAddonRevenue += revenue;
      return {
          id: addon.id,
          tenantId: addon.tenant.id,
          tenantName: addon.tenant.name,
          addonName: addon.addonName,
          amount: revenue,
          subscribedAt: addon.subscribedAt,
          status: addon.status,
          purchasedBy: (addon as any).purchasedBy || 'SELF', // "ADMIN" atau "SELF"
        };
      });

      // Calculate total global revenue (only from subscription + addon, NOT tenant orders)
      const totalGlobalRevenue = totalSubscriptionRevenue + totalAddonRevenue;

      // Calculate active tenants: tenants with ACTIVE subscription and endDate >= now
      const currentDate = new Date();
      const activeTenantsSet = new Set<string>();
      subscriptions.forEach((sub: any) => {
        if (sub.status === 'ACTIVE' && sub.endDate && new Date(sub.endDate) >= currentDate) {
          activeTenantsSet.add(sub.tenantId);
        }
      });
      const activeTenantsCount = activeTenantsSet.size;

      const result = {
        summary: {
          totalGlobalRevenue,
          totalSubscriptionRevenue,
          totalAddonRevenue,
          activeTenants: activeTenantsCount,
          totalTenants: tenants.length,
        },
        subscriptions: subscriptionList,
        addons: addonList,
      };
      
      logger.info('Global report generated successfully (subscription + addon revenue only)', {
        totalGlobalRevenue,
        totalSubscriptionRevenue,
        totalAddonRevenue,
        subscriptionCount: subscriptionList.length,
        addonCount: addonList.length,
        activeTenants: tenants.filter((t: any) => t.isActive).length,
        totalTenants: tenants.length,
      });
      
      return result;
    } catch (error: any) {
      logger.error('Error generating global report', { 
        error: error.message,
        stack: error.stack,
        start,
        end,
      });
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
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const format = options.format;
    
    const reportData = await this.getSalesReport(tenantId, startDate, endDate);
    
    // Handle export formats
    if (format && ['PDF', 'EXCEL', 'CSV'].includes(format)) {
      return await this.exportReport(reportData, format as 'PDF' | 'EXCEL' | 'CSV', {
        title: 'Laporan Penjualan',
        startDate,
        endDate,
        tenantId,
      });
    }
    
    return reportData;
  }

  /**
   * Export report in various formats
   */
  async exportReport(reportData: any, format: 'PDF' | 'EXCEL' | 'CSV', metadata?: any): Promise<any> {
    try {
      switch (format) {
        case 'PDF':
          return await this.exportToPDF(reportData, metadata);
        case 'EXCEL':
          return await this.exportToExcel(reportData, metadata);
        case 'CSV':
          return await this.exportToCSV(reportData, metadata);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error: any) {
      logger.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Export to PDF using pdf.service
   */
  private async exportToPDF(reportData: any, metadata?: any): Promise<any> {
    const { generatePDF } = await import('./pdf.service');
    
    const pdfData = {
      title: metadata?.title || 'Laporan',
      filename: `${metadata?.title || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      reportData,
      startDate: metadata?.startDate?.toISOString(),
      endDate: metadata?.endDate?.toISOString(),
      tenantId: metadata?.tenantId,
    };
    
    return await generatePDF('modern', pdfData);
  }

  /**
   * Export to Excel (requires exceljs)
   */
  private async exportToExcel(reportData: any, metadata?: any): Promise<any> {
    try {
      // Try to use exceljs if available
      // Use dynamic import with type assertion to avoid TS error if module not installed
      let ExcelJS: any = null;
      try {
        // @ts-ignore - exceljs may not be installed
        ExcelJS = await import('exceljs');
      } catch (error) {
        // exceljs not installed, will use CSV fallback
        ExcelJS = null;
      }
      
      if (!ExcelJS) {
        // Fallback: return CSV as Excel-compatible format
        logger.warn('exceljs not installed, falling back to CSV format');
        const csv = await this.exportToCSV(reportData, metadata);
        // Buffer is available in Node.js runtime
        // @ts-ignore - Buffer is available in Node.js
        return Buffer.from(csv, 'utf-8');
      }
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(metadata?.title || 'Laporan');
      
      // Add header
      worksheet.addRow([metadata?.title || 'Laporan']);
      worksheet.addRow([`Periode: ${metadata?.startDate?.toLocaleDateString('id-ID')} - ${metadata?.endDate?.toLocaleDateString('id-ID')}`]);
      worksheet.addRow([]);
      
      // Add data based on report type
      if (reportData.orders && Array.isArray(reportData.orders)) {
        // Sales report
        worksheet.addRow(['Tanggal', 'Order ID', 'Customer', 'Total', 'Status']);
        reportData.orders.forEach((order: any) => {
          worksheet.addRow([
            new Date(order.createdAt).toLocaleDateString('id-ID'),
            order.orderNumber || order.id,
            order.customer?.name || '-',
            Number(order.subtotal || 0).toLocaleString('id-ID'),
            order.status,
          ]);
        });
      } else if (Array.isArray(reportData)) {
        // Product or inventory report
        const firstItem = reportData[0];
        if (firstItem) {
          const headers = Object.keys(firstItem);
          worksheet.addRow(headers);
          reportData.forEach((item: any) => {
            worksheet.addRow(headers.map(h => item[h] || ''));
          });
        }
      }
      
      const buffer = await workbook.xlsx.writeBuffer();
      // Buffer is available in Node.js runtime
      // @ts-ignore - Buffer is available in Node.js
      return Buffer.from(buffer);
    } catch (error: any) {
      logger.error('Error exporting to Excel:', error);
      // Fallback to CSV
      const csv = await this.exportToCSV(reportData, metadata);
      // @ts-ignore - Buffer is available in Node.js
      return Buffer.from(csv, 'utf-8');
    }
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(reportData: any, metadata?: any): Promise<string> {
    let csv = '';
    
    // Add metadata header
    if (metadata?.title) {
      csv += `${metadata.title}\n`;
    }
    if (metadata?.startDate && metadata?.endDate) {
      csv += `Periode: ${metadata.startDate.toLocaleDateString('id-ID')} - ${metadata.endDate.toLocaleDateString('id-ID')}\n`;
    }
    csv += '\n';
    
    // Convert data to CSV
    if (reportData.orders && Array.isArray(reportData.orders)) {
      // Sales report
      csv += 'Tanggal,Order ID,Customer,Total,Status\n';
      reportData.orders.forEach((order: any) => {
        csv += `${new Date(order.createdAt).toLocaleDateString('id-ID')},${order.orderNumber || order.id},"${order.customer?.name || '-'}",${Number(order.subtotal || 0)},"${order.status}"\n`;
      });
    } else if (Array.isArray(reportData)) {
      // Product or inventory report
      if (reportData.length > 0) {
        const headers = Object.keys(reportData[0]);
        csv += headers.join(',') + '\n';
        reportData.forEach((item: any) => {
          csv += headers.map(h => {
            const value = item[h];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',') + '\n';
        });
      }
    } else {
      // Summary report
      csv += 'Metric,Value\n';
      Object.entries(reportData).forEach(([key, value]) => {
        if (typeof value !== 'object' || value === null) {
          csv += `${key},${value}\n`;
        }
      });
    }
    
    return csv;
  }

  async generateProductReport(tenantId: string, options: any) {
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const format = options.format;
    
    const reportData = await this.getProductPerformanceReport(tenantId, startDate, endDate);
    
    if (format && ['PDF', 'EXCEL', 'CSV'].includes(format)) {
      return await this.exportReport(reportData, format as 'PDF' | 'EXCEL' | 'CSV', {
        title: 'Laporan Produk',
        startDate,
        endDate,
        tenantId,
      });
    }
    
    return reportData;
  }

  async generateCustomerReport(tenantId: string, options: any) {
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const format = options.format;
    
    const reportData = await this.getCustomerAnalytics(tenantId, startDate, endDate);
    
    if (format && ['PDF', 'EXCEL', 'CSV'].includes(format)) {
      return await this.exportReport(reportData, format as 'PDF' | 'EXCEL' | 'CSV', {
        title: 'Laporan Pelanggan',
        startDate,
        endDate,
        tenantId,
      });
    }
    
    return reportData;
  }

  async generateInventoryReport(tenantId: string, options: any) {
    try {
      const readReplica = getReadReplicaClient();
      const format = options.format;
      
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
      
      if (format && ['PDF', 'EXCEL', 'CSV'].includes(format)) {
        return await this.exportReport(products, format as 'PDF' | 'EXCEL' | 'CSV', {
          title: 'Laporan Inventori',
          tenantId,
        });
      }
      
      return products;
    } catch (error: any) {
      logger.error('Error generating inventory report', { error: error.message, tenantId });
      throw error;
    }
  }

  async generateFinancialReport(tenantId: string, options: any) {
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const format = options.format;
    
    const reportData = await this.getSalesReport(tenantId, startDate, endDate);
    
    if (format && ['PDF', 'EXCEL', 'CSV'].includes(format)) {
      return await this.exportReport(reportData, format as 'PDF' | 'EXCEL' | 'CSV', {
        title: 'Laporan Keuangan',
        startDate,
        endDate,
        tenantId,
      });
    }
    
    return reportData;
  }

  /**
   * Get multi-store report (sales per store, combined, stock per store)
   */
  async getMultiStoreReport(tenantId: string, startDate: Date, endDate: Date, userRole?: string, userPermissions?: any) {
    try {
      const readReplica = getReadReplicaClient();

      // Get all outlets for tenant (filter by allowedStoreIds for SUPERVISOR)
      let outletFilter: any = {
        tenantId,
        isActive: true,
      };
      
      if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
        const allowedStoreIds = userPermissions.allowedStoreIds;
        if (allowedStoreIds.length > 0) {
          outletFilter.id = { in: allowedStoreIds };
        } else {
          // No stores assigned, return empty report
          return {
            salesByOutlet: [],
            combined: { revenue: 0, orders: 0, items: 0 },
            stockByOutlet: [],
            dateRange: { startDate, endDate },
          };
        }
      }
      
      const outlets = await readReplica.outlet.findMany({
        where: outletFilter,
      });

      // Get orders grouped by outlet
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
          outlet: true,
        },
      });

      // Get transactions grouped by outlet (via order)
      const transactions = await readReplica.transaction.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'COMPLETED',
        },
        include: {
          order: {
            include: {
              outlet: true,
            },
          },
        },
      });

      // Get products for stock report
      const products = await readReplica.product.findMany({
        where: {
          tenantId,
          isActive: true,
        },
      });

      // Group sales by outlet
      const salesByOutlet: Record<string, {
        outlet: any;
        revenue: number;
        orders: number;
        items: number;
      }> = {};

      // Initialize all outlets
      outlets.forEach((outlet: any) => {
        salesByOutlet[outlet.id] = {
          outlet,
          revenue: 0,
          orders: 0,
          items: 0,
        };
      });

      // Add "no outlet" entry
      salesByOutlet['no-outlet'] = {
        outlet: { id: 'no-outlet', name: 'Tidak Ada Outlet' },
        revenue: 0,
        orders: 0,
        items: 0,
      };

      // Calculate sales per outlet
      orders.forEach((order: any) => {
        const outletId = order.outletId || 'no-outlet';
        if (!salesByOutlet[outletId]) {
          salesByOutlet[outletId] = {
            outlet: order.outlet || { id: 'no-outlet', name: 'Tidak Ada Outlet' },
            revenue: 0,
            orders: 0,
            items: 0,
          };
        }
        salesByOutlet[outletId].revenue += Number(order.total);
        salesByOutlet[outletId].orders += 1;
        salesByOutlet[outletId].items += order.items.length;
      });

      // Calculate combined totals
      const combined = {
        revenue: transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0),
        orders: orders.length,
        items: orders.reduce((sum: number, o: any) => sum + o.items.length, 0),
      };

      // Stock per outlet (simplified - all products shown for all outlets)
      const stockByOutlet = outlets.map((outlet: any) => {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum: number, p: any) => sum + Number(p.stock), 0);
        const lowStockCount = products.filter((p: any) => p.stock <= (p.minStock || 0)).length;

        return {
          outlet,
          totalProducts,
          totalStock,
          lowStockCount,
        };
      });

      return {
        salesByOutlet: Object.values(salesByOutlet),
        combined,
        stockByOutlet,
        dateRange: {
          startDate,
          endDate,
        },
      };
    } catch (error: any) {
      logger.error('Error generating multi-store report', { error: error.message, tenantId });
      throw error;
    }
  }

  generateGlobalReportPDF(report: any, start?: Date, end?: Date): string {
    return `<html><body><h1>Global Report</h1><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`;
  }
}

export default new ReportService();
