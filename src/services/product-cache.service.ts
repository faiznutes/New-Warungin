/**
 * Product Cache Service
 * Handles Redis caching for product queries to reduce database load
 */

import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

const redis = getRedisClient();

const PRODUCT_CACHE_TTL = 300; // 5 minutes in seconds
const PRODUCTS_LIST_KEY = (tenantId: string) => `products:list:${tenantId}`;
const PRODUCT_DETAIL_KEY = (productId: string) => `product:${productId}`;

export class ProductCacheService {
  /**
   * Get products from cache
   */
  static async getProductsFromCache(tenantId: string, query: any): Promise<any | null> {
    try {
      const cacheKey = PRODUCTS_LIST_KEY(tenantId);
      const queryHash = JSON.stringify(query);
      const fullKey = `${cacheKey}:${queryHash}`;

      const cached = await redis.get(fullKey);
      if (cached) {
        logger.info(`Cache hit for products list: ${tenantId}`, { service: 'ProductCache' });
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.warn('Error getting products from cache:', error);
      return null; // Return null to fall back to database
    }
  }

  /**
   * Cache products list
   */
  static async cacheProductsList(tenantId: string, query: any, data: any): Promise<void> {
    try {
      const cacheKey = PRODUCTS_LIST_KEY(tenantId);
      const queryHash = JSON.stringify(query);
      const fullKey = `${cacheKey}:${queryHash}`;

      await redis.setex(fullKey, PRODUCT_CACHE_TTL, JSON.stringify(data));
      logger.info(`Cached products list for tenant: ${tenantId}`, { service: 'ProductCache' });
    } catch (error) {
      logger.warn('Error caching products list:', error);
      // Continue without caching
    }
  }

  /**
   * Invalidate products cache for tenant
   */
  static async invalidateProductsCache(tenantId: string): Promise<void> {
    try {
      const cacheKey = PRODUCTS_LIST_KEY(tenantId);
      const pattern = `${cacheKey}:*`;

      // Get all matching keys
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Invalidated ${keys.length} product cache keys for tenant: ${tenantId}`, {
          service: 'ProductCache',
        });
      }
    } catch (error) {
      logger.warn('Error invalidating products cache:', error);
    }
  }

  /**
   * Get single product from cache
   */
  static async getProductFromCache(productId: string): Promise<any | null> {
    try {
      const cacheKey = PRODUCT_DETAIL_KEY(productId);
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for product: ${productId}`, { service: 'ProductCache' });
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.warn('Error getting product from cache:', error);
      return null;
    }
  }

  /**
   * Cache single product
   */
  static async cacheProduct(productId: string, data: any): Promise<void> {
    try {
      const cacheKey = PRODUCT_DETAIL_KEY(productId);
      await redis.setex(cacheKey, PRODUCT_CACHE_TTL, JSON.stringify(data));
      logger.info(`Cached product: ${productId}`, { service: 'ProductCache' });
    } catch (error) {
      logger.warn('Error caching product:', error);
    }
  }

  /**
   * Invalidate single product cache
   */
  static async invalidateProduct(productId: string): Promise<void> {
    try {
      const cacheKey = PRODUCT_DETAIL_KEY(productId);
      await redis.del(cacheKey);
      logger.info(`Invalidated cache for product: ${productId}`, { service: 'ProductCache' });
    } catch (error) {
      logger.warn('Error invalidating product cache:', error);
    }
  }

  /**
   * Clear all product cache
   */
  static async clearAllCache(): Promise<void> {
    try {
      const keys = await redis.keys('products:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Cleared all product cache (${keys.length} keys)`, { service: 'ProductCache' });
      }
    } catch (error) {
      logger.warn('Error clearing all product cache:', error);
    }
  }
}

export default ProductCacheService;
