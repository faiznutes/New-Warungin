import { PrismaClient, Product } from '@prisma/client';
import { CreateProductInput, UpdateProductInput, GetProductsQuery } from '../validators/product.validator';
import prisma from '../config/database';
import CacheService from '../utils/cache';
import logger from '../utils/logger';

export class ProductService {
  async getProducts(tenantId: string, query: GetProductsQuery, useCache: boolean = true) {
    const { page, limit, search, category, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Create cache key based on query parameters
    const cacheKey = `products:${tenantId}:${JSON.stringify({ page, limit, search, category, isActive, sortBy, sortOrder })}`;

    // Try to get from cache first
    if (useCache) {
      try {
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        // If cache read fails, continue with database query
        logger.warn('Failed to read products from cache', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    const where: any = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result (5 minutes TTL for products list)
    if (useCache) {
      try {
        await CacheService.set(cacheKey, result, 300);
      } catch (error) {
        // If cache write fails, continue without caching
        logger.warn('Failed to cache products', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return result;
  }

  async getProductById(id: string, tenantId: string, useCache: boolean = true): Promise<Product | null> {
    const cacheKey = `product:${tenantId}:${id}`;

    // Try to get from cache first
    if (useCache) {
      try {
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          return cached as Product | null;
        }
      } catch (error) {
        // If cache read fails, continue with database query
        logger.warn('Failed to read product from cache', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    // Cache the result (10 minutes TTL for individual product)
    if (product && useCache) {
      try {
        await CacheService.set(cacheKey, product, 600);
      } catch (error) {
        // If cache write fails, continue without caching
        logger.warn('Failed to cache product', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return product;
  }

  async createProduct(data: CreateProductInput, tenantId: string): Promise<Product> {
    // Check limit using plan-features service (includes base plan + addons)
    const planFeaturesService = (await import('./plan-features.service')).default;
    const limitCheck = await planFeaturesService.checkPlanLimit(tenantId, 'products');
    
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.message || `Product limit reached (${limitCheck.currentUsage}/${limitCheck.limit}). Upgrade your plan or addon to add more products.`);
    }

    // Validate barcode uniqueness per tenant (if barcode provided)
    if (data.barcode) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          tenantId,
          barcode: data.barcode,
        },
      });
      
      if (existingProduct) {
        throw new Error(`Barcode ${data.barcode} already exists for another product in this tenant`);
      }
    }

    const product = await prisma.product.create({
      data: {
        tenantId,
        name: data.name,
        price: data.price,
        stock: data.stock || 0,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        cost: data.cost,
        minStock: data.minStock,
        category: data.category,
        image: data.image,
        emoji: data.emoji,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isConsignment: data.isConsignment || false,
      },
    });

    // Invalidate cache for products list
    await this.invalidateProductCache(tenantId);

    return product;
  }

  /**
   * Invalidate product cache for a tenant
   */
  private async invalidateProductCache(tenantId: string): Promise<void> {
    try {
      // Delete all product-related cache keys for this tenant using CacheService
      await CacheService.deletePattern(`products:${tenantId}:*`);
      await CacheService.deletePattern(`product:${tenantId}:*`);
    } catch (error) {
      // If cache invalidation fails, log but don't throw
      logger.warn('Failed to invalidate product cache', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  async updateProduct(id: string, data: UpdateProductInput, tenantId: string): Promise<Product> {
    // Verify product belongs to tenant
    const product = await this.getProductById(id, tenantId, false); // Don't use cache for verification
    if (!product) {
      throw new Error('Product not found');
    }

    // Validate barcode uniqueness per tenant (if barcode is being updated)
    if (data.barcode) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          tenantId,
          barcode: data.barcode,
          id: { not: id }, // Exclude current product
        },
      });
      
      if (existingProduct) {
        throw new Error(`Barcode ${data.barcode} already exists for another product in this tenant`);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id, tenantId }, // Ensure tenantId is in where clause for multi-tenant isolation
      data,
    });

    // Invalidate cache
    await this.invalidateProductCache(tenantId);

    return updatedProduct;
  }

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    // Verify product belongs to tenant
    const product = await this.getProductById(id, tenantId, false); // Don't use cache for verification
    if (!product) {
      throw new Error('Product not found');
    }

    await prisma.product.delete({
      where: { id },
    });

    // Invalidate cache
    await this.invalidateProductCache(tenantId);
  }

  async updateStock(id: string, quantity: number, tenantId: string, operation: 'add' | 'subtract' | 'set' = 'set', emitSocketEvent: boolean = false): Promise<Product> {
    // Use distributed lock to prevent race conditions
    const { withLock } = await import('../utils/distributed-lock');
    const lockKey = `stock:${tenantId}:${id}`;
    
    return withLock(lockKey, async () => {
      const product = await this.getProductById(id, tenantId, false); // Don't use cache for verification
      if (!product) {
        throw new Error('Product not found');
      }

      let newStock: number;
      switch (operation) {
        case 'add':
          newStock = product.stock + quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, product.stock - quantity);
          break;
        case 'set':
        default:
          newStock = quantity;
          break;
      }

      const updatedProduct = await prisma.product.update({
        where: { id, tenantId }, // Ensure tenantId is in where clause for security
        data: { stock: newStock },
      });

      // Invalidate cache for this product and products list
      await this.invalidateProductCache(tenantId);
      
      // Also invalidate analytics cache that depends on products
      try {
        await CacheService.delete(`analytics:top-products:${tenantId}`);
      } catch (error) {
        logger.warn('Failed to invalidate analytics cache', { error: error instanceof Error ? error.message : String(error) });
      }

      // Emit socket event if requested (usually from order service, not from direct product update)
      if (emitSocketEvent) {
        try {
          const { emitToTenant } = await import('../socket/socket');
          emitToTenant(tenantId, 'product:stock-update', {
            productId: id,
            stock: updatedProduct.stock,
          });
        } catch (error) {
          // Ignore socket errors
          logger.warn('Failed to emit stock update socket event:', error);
        }
      }

      return updatedProduct;
    }, 10); // 10 seconds lock timeout for stock operations
  }

  async getLowStockProducts(tenantId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
      orderBy: { stock: 'asc' },
    });
  }
}

export default new ProductService();

