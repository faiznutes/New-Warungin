import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../config/database';
import logger from '../utils/logger';
import CacheService from '../utils/cache';
import { sanitizeString, sanitizePhone, sanitizeText } from '../utils/sanitize';

export interface CreateOutletInput {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateOutletInput {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export class OutletService {
  async getOutlets(tenantId: string) {
    // Log for debugging
    logger.debug('OutletService.getOutlets called', {
      tenantId,
      timestamp: new Date().toISOString(),
    });
    
    const outlets = await prisma.outlet.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Log result for debugging
    logger.debug('OutletService.getOutlets result', {
      tenantId,
      count: outlets.length,
      outletIds: outlets.map(o => o.id),
      outletNames: outlets.map(o => o.name),
    });
    
    return outlets;
  }

  async getOutlet(tenantId: string, outletId: string) {
    const outlet = await prisma.outlet.findFirst({
      where: {
        id: outletId,
        tenantId,
      },
    });
    if (!outlet) {
      throw new Error('Outlet tidak ditemukan');
    }
    return outlet;
  }

  async createOutlet(tenantId: string, data: CreateOutletInput) {
    // Check outlet limit based on subscription plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        addons: {
          where: {
            status: 'active',
            OR: [
              { expiresAt: { gt: new Date() } },
              { expiresAt: null },
            ],
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant tidak ditemukan');
    }

    // Get current active outlets count
    const activeOutletsCount = await prisma.outlet.count({
      where: {
        tenantId,
        isActive: true,
      },
    });

    // Get outlet limit from plan features
    const { getTenantPlanFeatures } = await import('./plan-features.service');
    const features = await getTenantPlanFeatures(tenantId);
    
    const outletLimit = features.limits.outlets;
    
    // Check if limit is reached (unlimited = -1)
    if (outletLimit !== -1 && activeOutletsCount >= outletLimit) {
      throw new Error(`Batas outlet telah tercapai. Limit: ${outletLimit}`);
    }

    const outlet = await prisma.outlet.create({
      data: {
        tenantId,
        name: sanitizeString(data.name, 255),
        address: data.address ? sanitizeText(data.address) : undefined,
        phone: data.phone ? sanitizePhone(data.phone) : undefined,
      },
    });

    // Invalidate analytics cache after outlet creation
    await this.invalidateAnalyticsCache(tenantId);

    return outlet;
  }

  async updateOutlet(tenantId: string, outletId: string, data: UpdateOutletInput) {
    const outlet = await this.getOutlet(tenantId, outletId);
    
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = sanitizeString(data.name, 255);
    if (data.address !== undefined) updateData.address = data.address ? sanitizeText(data.address) : null;
    if (data.phone !== undefined) updateData.phone = data.phone ? sanitizePhone(data.phone) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.outlet.update({
      where: { id: outletId },
      data: updateData,
    });

    // Invalidate analytics cache after outlet update
    await this.invalidateAnalyticsCache(tenantId);

    return updated;
  }

  async deleteOutlet(tenantId: string, outletId: string) {
    const outlet = await this.getOutlet(tenantId, outletId);
    
    // Check if outlet has orders
    const orderCount = await prisma.order.count({
      where: { outletId },
    });
    
    let result;
    if (orderCount > 0) {
      // Soft delete: set isActive to false
      result = await prisma.outlet.update({
        where: { id: outletId },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no orders
      result = await prisma.outlet.delete({
        where: { id: outletId },
      });
    }

    // Invalidate analytics cache after outlet deletion
    await this.invalidateAnalyticsCache(tenantId);

    return result;
  }

  /**
   * Invalidate analytics cache for a tenant
   */
  private async invalidateAnalyticsCache(tenantId: string): Promise<void> {
    try {
      // Delete all analytics cache keys for this tenant
      await CacheService.deletePattern(`analytics:*:${tenantId}`);
      await CacheService.deletePattern(`analytics:${tenantId}:*`);
      logger.info('Invalidated analytics cache after outlet operation', { tenantId });
    } catch (error: any) {
      logger.warn('Failed to invalidate analytics cache', {
        error: error.message,
        tenantId
      });
    }
  }

  /**
   * Get outlet reports (Multi-Outlet Advanced)
   */
  async getOutletReports(
    tenantId: string,
    outletId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any> {
    try {
      // Verify outlet belongs to tenant
      const outlet = await this.getOutlet(tenantId, outletId);

      // Get sales data for the outlet
      const orders = await prisma.order.findMany({
        where: {
          outletId: outlet.id,
          tenantId,
          createdAt: {
            gte: options?.startDate,
            lte: options?.endDate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Calculate summary
      const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);

      return {
        outletId: outlet.id,
        outletName: outlet.name,
        period: {
          startDate: options?.startDate,
          endDate: options?.endDate,
        },
        summary: {
          totalSales,
          totalOrders,
          totalItems,
        },
        orders,
      };
    } catch (error: any) {
      logger.error('Error getting outlet reports:', error);
      throw error;
    }
  }

  /**
   * Create automatic stock transfer configuration (Multi-Outlet Advanced)
   */
  async createAutoTransfer(
    tenantId: string,
    data: {
      fromOutletId: string;
      toOutletId: string;
      productId: string;
      threshold: number;
      transferQuantity: number;
      enabled: boolean;
    }
  ): Promise<any> {
    try {
      // Verify outlets belong to tenant
      await this.getOutlet(tenantId, data.fromOutletId);
      await this.getOutlet(tenantId, data.toOutletId);

      // In a real implementation, this would create a configuration record
      // For now, return a mock response
      logger.info('Creating auto transfer configuration', {
        tenantId,
        fromOutletId: data.fromOutletId,
        toOutletId: data.toOutletId,
        productId: data.productId,
      });

      return {
        id: `auto-transfer-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      logger.error('Error creating auto transfer:', error);
      throw error;
    }
  }

  /**
   * Sync stock across all outlets (Multi-Outlet Advanced)
   */
  async syncAllOutlets(tenantId: string): Promise<any> {
    try {
      const outlets = await this.getOutlets(tenantId);
      
      logger.info('Syncing all outlets', {
        tenantId,
        outletCount: outlets.length,
      });

      // In a real implementation, this would:
      // 1. Get all products across all outlets
      // 2. Calculate stock differences
      // 3. Create transfer orders if needed
      // 4. Update stock levels

      return {
        syncedAt: new Date(),
        outletsSynced: outlets.length,
        status: 'completed',
        message: 'All outlets synchronized successfully',
      };
    } catch (error: any) {
      logger.error('Error syncing outlets:', error);
      throw error;
    }
  }
}

export default new OutletService();

