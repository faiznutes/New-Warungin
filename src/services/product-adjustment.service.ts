import prisma from '../config/database';
import { z } from 'zod';

export const createProductAdjustmentSchema = z.discriminatedUnion('type', [
  // Regular adjustment (INCREASE/DECREASE)
  z.object({
    type: z.enum(['INCREASE', 'DECREASE']),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
  }),
  // Stock transfer
  z.object({
    type: z.literal('TRANSFER'),
    reason: z.string().min(1),
    fromOutletId: z.string().min(1),
    toOutletId: z.string().min(1),
    transferItems: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })).min(1),
  }),
]);

export type CreateProductAdjustmentInput = z.infer<typeof createProductAdjustmentSchema>;

export class ProductAdjustmentService {
  /**
   * Get all product adjustments for a tenant
   */
  async getAdjustments(tenantId: string, query: { 
    page?: number; 
    limit?: number; 
    productId?: string;
    search?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(query.productId && { productId: query.productId }),
      ...(query.type && { type: query.type }),
      ...(query.startDate && query.endDate && {
        createdAt: {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate + 'T23:59:59.999Z'),
        },
      }),
    };

    // Handle search filter
    if (query.search) {
      where.OR = [
        { reason: { contains: query.search, mode: 'insensitive' } },
        // Only search in product if product exists (handle deleted products)
        {
          AND: [
            { product: { isNot: null } },
            {
              product: {
                OR: [
                  { name: { contains: query.search, mode: 'insensitive' } },
                  { sku: { contains: query.search, mode: 'insensitive' } },
                ],
              },
            },
          ],
        },
      ];
    }

    const [adjustments, total] = await Promise.all([
      prisma.productAdjustment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.productAdjustment.count({ where }),
    ]);

    // Handle null products (deleted products) - map after query
    const adjustedData = adjustments.map(adj => ({
      ...adj,
      product: adj.product || { id: adj.productId, name: 'Produk Dihapus', sku: null },
    }));

    return {
      data: adjustedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a product adjustment
   * This will update the product stock and create an adjustment record
   * For TRANSFER type, creates two adjustments (DECREASE from source, INCREASE to destination)
   */
  async createAdjustment(
    data: CreateProductAdjustmentInput,
    tenantId: string,
    userId: string
  ) {
    // Handle stock transfer (multiple products)
    if (data.type === 'TRANSFER') {
      if ('transferItems' in data && data.transferItems && data.transferItems.length > 0) {
        return await this.createStockTransfer(data as Extract<CreateProductAdjustmentInput, { type: 'TRANSFER' }>, tenantId, userId);
      }
      throw new Error('Stock transfer requires transferItems');
    }

    // Regular adjustment (INCREASE/DECREASE)
    if (!('productId' in data) || !('quantity' in data)) {
      throw new Error('Regular adjustment requires productId and quantity');
    }

    const regularData = data as Extract<CreateProductAdjustmentInput, { type: 'INCREASE' | 'DECREASE' }>;

    // Use transaction to ensure data consistency
    return prisma.$transaction(async (tx) => {
      // Get current product
      const product = await tx.product.findFirst({
        where: {
          id: regularData.productId,
          tenantId,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const stockBefore = product.stock;
      let stockAfter: number;

      // Calculate new stock
      if (regularData.type === 'INCREASE') {
        stockAfter = stockBefore + regularData.quantity;
      } else {
        // DECREASE
        stockAfter = Math.max(0, stockBefore - regularData.quantity);
      }

      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: stockAfter },
      });

      // Create adjustment record
      const adjustment = await tx.productAdjustment.create({
        data: {
          tenantId,
          productId: regularData.productId,
          userId,
          type: regularData.type,
          quantity: regularData.quantity,
          reason: regularData.reason,
          stockBefore,
          stockAfter,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return adjustment;
    });
  }

  /**
   * Create stock transfer (multiple products between outlets)
   * Creates DECREASE adjustment for source and INCREASE for destination
   */
  private async createStockTransfer(
    data: Extract<CreateProductAdjustmentInput, { type: 'TRANSFER' }>,
    tenantId: string,
    userId: string
  ) {
    if (!data.fromOutletId || !data.toOutletId || !data.transferItems || data.transferItems.length === 0) {
      throw new Error('Stock transfer requires fromOutletId, toOutletId, and transferItems');
    }

    return prisma.$transaction(async (tx) => {
      const adjustments = [];

      // Get outlet names for reason
      const fromOutlet = await tx.outlet.findFirst({
        where: { id: data.fromOutletId, tenantId },
        select: { name: true },
      });
      const toOutlet = await tx.outlet.findFirst({
        where: { id: data.toOutletId, tenantId },
        select: { name: true },
      });

      if (!fromOutlet || !toOutlet) {
        throw new Error('Outlet not found');
      }

      // Process each transfer item
      for (const item of data.transferItems) {
        // Get product
        const product = await tx.product.findFirst({
          where: {
            id: item.productId,
            tenantId,
          },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const stockBefore = product.stock;

        // Check if enough stock
        if (stockBefore < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${stockBefore}, Required: ${item.quantity}`);
        }

        // DECREASE from source
        const decreaseAfter = stockBefore - item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: decreaseAfter },
        });

        const decreaseAdjustment = await tx.productAdjustment.create({
          data: {
            tenantId,
            productId: item.productId,
            userId,
            type: 'DECREASE',
            quantity: item.quantity,
            reason: `Stock Transfer: Dari ${fromOutlet.name} ke ${toOutlet.name}. ${data.reason || ''}`,
            stockBefore,
            stockAfter: decreaseAfter,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // INCREASE to destination
        // Note: In a real multi-outlet system, you'd need outlet-specific stock
        // For now, we'll just create the increase adjustment record
        // The actual stock increase should be handled by receiving the transfer
        const increaseAdjustment = await tx.productAdjustment.create({
          data: {
            tenantId,
            productId: item.productId,
            userId,
            type: 'INCREASE',
            quantity: item.quantity,
            reason: `Stock Transfer: Dari ${fromOutlet.name} ke ${toOutlet.name} (Received). ${data.reason || ''}`,
            stockBefore: decreaseAfter,
            stockAfter: stockBefore, // Will be updated when transfer is received
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        adjustments.push(decreaseAdjustment, increaseAdjustment);
      }

      return adjustments;
    });
  }

  /**
   * Get adjustment by ID
   */
  async getAdjustmentById(id: string, tenantId: string) {
    return prisma.productAdjustment.findFirst({
      where: { id, tenantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}

export default new ProductAdjustmentService();

