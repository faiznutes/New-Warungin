/**
 * Price Suggestion Service
 * Provides price recommendations based on HPP (cost) and margin
 */

import prisma from '../config/database';
import logger from '../utils/logger';

export interface PriceSuggestion {
  currentPrice: number;
  suggestedPrice20: number; // 20% margin
  suggestedPrice30: number; // 30% margin
  marketPrice?: number; // Harga pasaran (median dari kategori)
  cost: number;
}

export class PriceSuggestionService {
  /**
   * Get price suggestions for a product
   */
  async getPriceSuggestions(tenantId: string, productId: string): Promise<PriceSuggestion> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          cost: true,
          category: true,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const cost = Number(product.cost || 0);
      const currentPrice = Number(product.price);

      // Calculate suggested prices with margins
      const suggestedPrice20 = cost > 0 ? cost / (1 - 0.2) : currentPrice; // 20% margin
      const suggestedPrice30 = cost > 0 ? cost / (1 - 0.3) : currentPrice; // 30% margin

      // Get market price (median price from same category)
      let marketPrice: number | undefined;
      if (product.category) {
        const categoryProducts = await prisma.product.findMany({
          where: {
            tenantId,
            category: product.category,
            isActive: true,
            id: { not: productId },
          },
          select: { price: true },
        });

        if (categoryProducts.length > 0) {
          const prices = categoryProducts.map(p => Number(p.price)).sort((a, b) => a - b);
          const mid = Math.floor(prices.length / 2);
          marketPrice = prices.length % 2 === 0
            ? (prices[mid - 1] + prices[mid]) / 2
            : prices[mid];
        }
      }

      return {
        currentPrice,
        suggestedPrice20: Math.round(suggestedPrice20),
        suggestedPrice30: Math.round(suggestedPrice30),
        marketPrice: marketPrice ? Math.round(marketPrice) : undefined,
        cost,
      };
    } catch (error: any) {
      logger.error('Error getting price suggestions:', error);
      throw error;
    }
  }

  /**
   * Get price suggestions for multiple products
   */
  async getBulkPriceSuggestions(tenantId: string, productIds: string[]): Promise<Record<string, PriceSuggestion>> {
    const suggestions: Record<string, PriceSuggestion> = {};

    for (const productId of productIds) {
      try {
        suggestions[productId] = await this.getPriceSuggestions(tenantId, productId);
      } catch (error: any) {
        logger.error(`Error getting price suggestion for product ${productId}:`, error);
      }
    }

    return suggestions;
  }
}

export default new PriceSuggestionService();
