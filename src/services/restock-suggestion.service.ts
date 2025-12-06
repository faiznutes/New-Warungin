/**
 * Restock Suggestion Service
 * Provides automatic restock suggestions based on sales patterns
 */

import prisma from '../config/database';
import logger from '../utils/logger';

export interface RestockSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  avgDailySales: number;
  daysLeft: number;
  suggestedQuantity: number;
  urgency: 'critical' | 'warning' | 'normal';
}

export class RestockSuggestionService {
  /**
   * Get restock suggestions for a tenant
   */
  async getRestockSuggestions(tenantId: string): Promise<RestockSuggestion[]> {
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Get all active products
      const products = await prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          stock: true,
          minStock: true,
        },
      });

      // Get sales data for last 14 days
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            tenantId,
            status: 'COMPLETED',
            createdAt: { gte: fourteenDaysAgo },
          },
        },
        select: {
          productId: true,
          quantity: true,
        },
      });

      // Calculate average daily sales per product
      const productSales: Record<string, number> = {};
      orderItems.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });

      const suggestions: RestockSuggestion[] = [];

      for (const product of products) {
        const totalSold = productSales[product.id] || 0;
        const avgDailySales = totalSold / 14;
        
        // Skip if no sales or stock is sufficient
        if (avgDailySales === 0 && product.stock > product.minStock) {
          continue;
        }

        const daysLeft = avgDailySales > 0 ? product.stock / avgDailySales : Infinity;
        
        // Only suggest if days_left < 2 or stock < minStock
        if (daysLeft < 2 || product.stock <= product.minStock) {
          // Suggested quantity: enough for 7 days of sales + buffer
          const suggestedQuantity = Math.ceil(avgDailySales * 7) + (product.minStock || 10);
          
          let urgency: 'critical' | 'warning' | 'normal' = 'normal';
          if (product.stock === 0) {
            urgency = 'critical';
          } else if (daysLeft < 1 || product.stock <= product.minStock) {
            urgency = 'warning';
          }

          suggestions.push({
            productId: product.id,
            productName: product.name,
            currentStock: Number(product.stock),
            minStock: Number(product.minStock),
            avgDailySales: Math.round(avgDailySales * 100) / 100,
            daysLeft: Math.round(daysLeft * 100) / 100,
            suggestedQuantity,
            urgency,
          });
        }
      }

      // Sort by urgency (critical first, then warning, then normal)
      const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
      suggestions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

      return suggestions;
    } catch (error: any) {
      logger.error('Error getting restock suggestions:', error);
      throw error;
    }
  }

  /**
   * Get critical restock suggestions (for popup/reminder)
   * Returns products with stock = 0 or stock <= minStock in a simple format
   */
  async getCriticalRestockSuggestions(tenantId: string, limit: number = 5): Promise<any[]> {
    try {
      // Get all active products (Prisma doesn't support field-to-field comparison in where clause)
      const allProducts = await prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          stock: true,
          minStock: true,
        },
      });

      // Filter products with critical stock (stock = 0 or stock <= minStock)
      const criticalProducts = allProducts.filter(
        p => p.stock === 0 || (p.minStock > 0 && p.stock <= p.minStock)
      );

      // Sort by urgency: stock = 0 first, then by stock level
      criticalProducts.sort((a, b) => {
        if (a.stock === 0 && b.stock !== 0) return -1;
        if (a.stock !== 0 && b.stock === 0) return 1;
        return a.stock - b.stock;
      });

      // Take only the limit
      const limitedProducts = criticalProducts.slice(0, limit);

      // Return in format expected by frontend
      return limitedProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: Number(p.stock),
        minStock: Number(p.minStock),
      }));
    } catch (error: any) {
      logger.error('Error getting critical restock suggestions:', error);
      throw error;
    }
  }
}

export default new RestockSuggestionService();
