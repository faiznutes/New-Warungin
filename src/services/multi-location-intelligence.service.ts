/**
 * Multi-Location Intelligence Service
 * Handles cross-store analytics, inventory optimization, staff scheduling,
 * and location-based pricing strategies
 */

import prisma from '../config/database';
import logger from '../utils/logger';

interface OutletPerformance {
  outletId: string;
  outletName: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number }>;
  performanceScore: number; // 0-100
  rank: number;
}

interface CrossStoreAnalytics {
  totalOutlets: number;
  totalSales: number;
  totalOrders: number;
  averageSalesPerOutlet: number;
  bestPerformingOutlet: OutletPerformance;
  worstPerformingOutlet: OutletPerformance;
  outletPerformances: OutletPerformance[];
}

interface InventoryOptimization {
  productId: string;
  productName: string;
  totalStock: number;
  distribution: Array<{
    outletId: string;
    outletName: string;
    currentStock: number;
    recommendedStock: number;
    transferNeeded: number;
  }>;
  optimalDistribution: string;
}

interface StaffSchedule {
  outletId: string;
  outletName: string;
  date: Date;
  requiredStaff: number;
  currentStaff: number;
  recommendedAction: 'HIRE' | 'TRANSFER' | 'SUFFICIENT';
  peakHours: Array<{ hour: number; expectedOrders: number }>;
}

interface PricingStrategy {
  productId: string;
  productName: string;
  basePrice: number;
  priceByOutlet: Array<{
    outletId: string;
    outletName: string;
    recommendedPrice: number;
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    competitorPrice?: number;
    priceElasticity: number;
  }>;
}

class MultiLocationIntelligenceService {
  /**
   * Get cross-store analytics comparing all outlets
   */
  async getCrossStoreAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CrossStoreAnalytics> {
    try {
      // Get all outlets
      const outlets = await prisma.outlet.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
        },
      });

      if (outlets.length === 0) {
        throw new Error('No outlets found for this tenant');
      }

      // Get orders for all outlets
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
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

      // Calculate performance for each outlet
      const outletPerformances: OutletPerformance[] = [];

      for (const outlet of outlets) {
        const outletOrders = orders.filter(o => o.outletId === outlet.id);
        const totalOrders = outletOrders.length;
        const totalSales = outletOrders.reduce((sum, o) => sum + Number(o.total), 0);
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Calculate top products for this outlet
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

        outletOrders.forEach(order => {
          order.items.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                name: item.product.name,
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += Number(item.subtotal);
          });
        });

        const topProducts = Object.entries(productSales)
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantity: data.quantity,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Calculate performance score (based on sales, orders, and AOV)
        const performanceScore = Math.min(
          100,
          (totalSales / 1000000) * 20 + // Sales contribution (max 20 points per 1M)
            (totalOrders / 100) * 20 + // Orders contribution (max 20 points per 100 orders)
            (averageOrderValue / 10000) * 10 // AOV contribution (max 10 points per 10K AOV)
        );

        outletPerformances.push({
          outletId: outlet.id,
          outletName: outlet.name,
          totalSales,
          totalOrders,
          averageOrderValue,
          topProducts,
          performanceScore,
          rank: 0, // Will be set after sorting
        });
      }

      // Sort by performance score and assign ranks
      outletPerformances.sort((a, b) => b.performanceScore - a.performanceScore);
      outletPerformances.forEach((outlet, index) => {
        outlet.rank = index + 1;
      });

      const totalSales = outletPerformances.reduce((sum, o) => sum + o.totalSales, 0);
      const totalOrders = outletPerformances.reduce((sum, o) => sum + o.totalOrders, 0);

      return {
        totalOutlets: outlets.length,
        totalSales,
        totalOrders,
        averageSalesPerOutlet: totalSales / outlets.length,
        bestPerformingOutlet: outletPerformances[0],
        worstPerformingOutlet: outletPerformances[outletPerformances.length - 1],
        outletPerformances,
      };
    } catch (error: any) {
      logger.error('Error getting cross-store analytics:', error);
      throw error;
    }
  }

  /**
   * Optimize inventory distribution across outlets
   */
  async optimizeInventoryDistribution(tenantId: string): Promise<InventoryOptimization[]> {
    try {
      // Get all products
      const products = await prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });

      // Get all outlets
      const outlets = await prisma.outlet.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
        },
      });

      // Get sales data for last 30 days per outlet
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          items: true,
        },
      });

      const optimizations: InventoryOptimization[] = [];

      for (const product of products) {
        // Calculate demand per outlet
        const outletDemand: Record<string, number> = {};

        orders.forEach(order => {
          if (!order.outletId) return; // Skip if outletId is null
          order.items
            .filter(item => item.productId === product.id)
            .forEach(item => {
              outletDemand[order.outletId!] = (outletDemand[order.outletId!] || 0) + item.quantity;
            });
        });

        const totalDemand = Object.values(outletDemand).reduce((sum, d) => sum + d, 0);

        if (totalDemand === 0) {
          continue; // Skip products with no demand
        }

        // Calculate recommended distribution
        const distribution = outlets.map(outlet => {
          const demand = outletDemand[outlet.id] || 0;
          const demandRatio = totalDemand > 0 ? demand / totalDemand : 1 / outlets.length;
          const recommendedStock = Math.ceil(product.stock * demandRatio);

          // For simplicity, assume current stock is evenly distributed
          // In real scenario, this should come from outlet-specific inventory
          const currentStock = Math.floor(product.stock / outlets.length);
          const transferNeeded = recommendedStock - currentStock;

          return {
            outletId: outlet.id,
            outletName: outlet.name,
            currentStock,
            recommendedStock,
            transferNeeded,
          };
        });

        let optimalDistribution = 'BALANCED';
        if (distribution.some(d => Math.abs(d.transferNeeded) > product.stock * 0.2)) {
          optimalDistribution = 'NEEDS_REBALANCING';
        }

        optimizations.push({
          productId: product.id,
          productName: product.name,
          totalStock: product.stock,
          distribution,
          optimalDistribution,
        });
      }

      return optimizations;
    } catch (error: any) {
      logger.error('Error optimizing inventory distribution:', error);
      throw error;
    }
  }

  /**
   * Generate staff scheduling recommendations based on demand
   */
  async generateStaffSchedule(tenantId: string, targetDate: Date): Promise<StaffSchedule[]> {
    try {
      // Get all outlets
      const outlets = await prisma.outlet.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
        },
      });

      // Get historical order data for same day of week
      const dayOfWeek = targetDate.getDay();
      const fourWeeksAgo = new Date(targetDate);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: fourWeeksAgo,
            lte: targetDate,
          },
        },
        select: {
          outletId: true,
          createdAt: true,
        },
      });

      const schedules: StaffSchedule[] = [];

      for (const outlet of outlets) {
        // Filter orders for this outlet and same day of week
        const outletOrders = orders.filter(
          o => o.outletId === outlet.id && o.createdAt.getDay() === dayOfWeek
        );

        // Calculate average orders per hour
        const hourlyOrders: Record<number, number[]> = {};

        outletOrders.forEach(order => {
          const hour = order.createdAt.getHours();
          if (!hourlyOrders[hour]) {
            hourlyOrders[hour] = [];
          }
          hourlyOrders[hour].push(1);
        });

        // Calculate average and peak hours
        const peakHours = Object.entries(hourlyOrders)
          .map(([hour, orders]) => ({
            hour: parseInt(hour),
            expectedOrders: Math.ceil(orders.reduce((sum, o) => sum + o, 0) / 4), // Average over 4 weeks
          }))
          .filter(h => h.expectedOrders > 0)
          .sort((a, b) => b.expectedOrders - a.expectedOrders)
          .slice(0, 3);

        // Calculate required staff (1 staff per 10 expected orders, minimum 2)
        const maxExpectedOrders = peakHours.length > 0 ? peakHours[0].expectedOrders : 10;
        const requiredStaff = Math.max(2, Math.ceil(maxExpectedOrders / 10));

        // Get current staff count (assuming from users table)
        // Note: This is a simplified count - in real scenario, check user permissions properly
        const currentStaff = await prisma.user.count({
          where: {
            tenantId,
            // Simplified: count all users for this tenant
            // In production, should check permissions JSON field properly
          },
        });

        let recommendedAction: 'HIRE' | 'TRANSFER' | 'SUFFICIENT' = 'SUFFICIENT';
        if (currentStaff < requiredStaff) {
          recommendedAction = currentStaff < requiredStaff * 0.7 ? 'HIRE' : 'TRANSFER';
        }

        schedules.push({
          outletId: outlet.id,
          outletName: outlet.name,
          date: targetDate,
          requiredStaff,
          currentStaff,
          recommendedAction,
          peakHours,
        });
      }

      return schedules;
    } catch (error: any) {
      logger.error('Error generating staff schedule:', error);
      throw error;
    }
  }

  /**
   * Generate dynamic pricing strategy per location
   */
  async generatePricingStrategy(tenantId: string): Promise<PricingStrategy[]> {
    try {
      // Get all products
      const products = await prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
        take: 50, // Limit to top 50 products
      });

      // Get all outlets
      const outlets = await prisma.outlet.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          address: true,
        },
      });

      // Get sales data for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          items: true,
        },
      });

      const pricingStrategies: PricingStrategy[] = [];

      for (const product of products) {
        const priceByOutlet = outlets.map(outlet => {
          // Calculate sales volume for this product at this outlet
          const outletOrders = orders.filter(o => o.outletId === outlet.id);
          const productSales = outletOrders.reduce((sum, order) => {
            const item = order.items.find(i => i.productId === product.id);
            return sum + (item ? item.quantity : 0);
          }, 0);

          // Determine demand level
          let demandLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (productSales > 100) demandLevel = 'HIGH';
          else if (productSales > 30) demandLevel = 'MEDIUM';

          // Calculate price elasticity (simplified)
          // In real scenario, this would use historical price changes vs demand
          const priceElasticity = demandLevel === 'HIGH' ? 1.2 : demandLevel === 'MEDIUM' ? 1.0 : 0.8;

          // Calculate recommended price based on demand
          let recommendedPrice = Number(product.price);
          
          if (demandLevel === 'HIGH') {
            // High demand -> can increase price by up to 15%
            recommendedPrice = Number(product.price) * 1.15;
          } else if (demandLevel === 'LOW') {
            // Low demand -> decrease price by up to 10% to stimulate
            recommendedPrice = Number(product.price) * 0.90;
          }

          // Round to nearest 100
          recommendedPrice = Math.round(recommendedPrice / 100) * 100;

          return {
            outletId: outlet.id,
            outletName: outlet.name,
            recommendedPrice,
            demandLevel,
            priceElasticity,
          };
        });

        pricingStrategies.push({
          productId: product.id,
          productName: product.name,
          basePrice: Number(product.price),
          priceByOutlet,
        });
      }

      return pricingStrategies;
    } catch (error: any) {
      logger.error('Error generating pricing strategy:', error);
      throw error;
    }
  }

  /**
   * Get outlet comparison report
   */
  async getOutletComparison(
    tenantId: string,
    outletId1: string,
    outletId2: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const outlets = await prisma.outlet.findMany({
        where: {
          tenantId,
          id: {
            in: [outletId1, outletId2],
          },
        },
        include: {
          orders: {
            where: {
              status: 'COMPLETED',
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (outlets.length !== 2) {
        throw new Error('One or both outlets not found');
      }

      const comparison = outlets.map(outlet => {
        const totalSales = outlet.orders.reduce((sum, o) => sum + Number(o.total), 0);
        const totalOrders = outlet.orders.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Calculate top products
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

        outlet.orders.forEach(order => {
          order.items.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                name: item.product.name,
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += Number(item.subtotal);
          });
        });

        const topProducts = Object.entries(productSales)
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantity: data.quantity,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        return {
          outletId: outlet.id,
          outletName: outlet.name,
          totalSales,
          totalOrders,
          averageOrderValue,
          topProducts,
        };
      });

      // Calculate differences
      const salesDiff = comparison[0].totalSales - comparison[1].totalSales;
      const salesDiffPercent =
        comparison[1].totalSales > 0
          ? ((salesDiff / comparison[1].totalSales) * 100).toFixed(2)
          : '0';

      const ordersDiff = comparison[0].totalOrders - comparison[1].totalOrders;
      const ordersDiffPercent =
        comparison[1].totalOrders > 0
          ? ((ordersDiff / comparison[1].totalOrders) * 100).toFixed(2)
          : '0';

      return {
        outlets: comparison,
        comparison: {
          salesDifference: salesDiff,
          salesDifferencePercent: salesDiffPercent,
          ordersDifference: ordersDiff,
          ordersDifferencePercent: ordersDiffPercent,
        },
      };
    } catch (error: any) {
      logger.error('Error getting outlet comparison:', error);
      throw error;
    }
  }

  /**
   * Get best practices from top performing outlet
   */
  async getBestPractices(tenantId: string, startDate: Date, endDate: Date) {
    try {
      const analytics = await this.getCrossStoreAnalytics(tenantId, startDate, endDate);

      if (!analytics.bestPerformingOutlet) {
        throw new Error('No outlets found');
      }

      const bestOutlet = analytics.bestPerformingOutlet;

      // Analyze what makes this outlet successful
      const practices = {
        outletName: bestOutlet.outletName,
        performanceScore: bestOutlet.performanceScore,
        averageOrderValue: bestOutlet.averageOrderValue,
        topProducts: bestOutlet.topProducts.slice(0, 5),
        recommendations: [] as string[],
      };

      // Generate recommendations based on analysis
      if (bestOutlet.averageOrderValue > analytics.averageSalesPerOutlet / analytics.totalOrders) {
        practices.recommendations.push(
          `Fokus pada upselling dan cross-selling seperti di ${bestOutlet.outletName}`
        );
      }

      if (bestOutlet.totalOrders > analytics.totalOrders / analytics.totalOutlets) {
        practices.recommendations.push(
          `Tingkatkan traffic dan customer acquisition seperti di ${bestOutlet.outletName}`
        );
      }

      practices.recommendations.push(
        `Promosikan produk top-selling: ${bestOutlet.topProducts.slice(0, 3).map(p => p.productName).join(', ')}`
      );

      return practices;
    } catch (error: any) {
      logger.error('Error getting best practices:', error);
      throw error;
    }
  }
}

export default new MultiLocationIntelligenceService();
