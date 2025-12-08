/**
 * Purchase Order Service
 * Manages purchase orders for inventory management
 */

import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import productService from './product.service';
import supplierService from './supplier.service';

interface CreatePurchaseOrderInput {
  supplierId: string;
  expectedDate?: Date;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

interface UpdatePurchaseOrderInput {
  status?: string;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    receivedQuantity?: number;
    notes?: string;
  }>;
}

class PurchaseOrderService {
  /**
   * Generate unique order number
   */
  private async generateOrderNumber(tenantId: string): Promise<string> {
    const count = await prisma.purchaseOrder.count({
      where: { tenantId },
    });
    return `PO-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Get all purchase orders for tenant
   */
  async getPurchaseOrders(tenantId: string, query: { page?: number; limit?: number; status?: string; supplierId?: string }) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = { tenantId };
      if (query.status) {
        where.status = query.status;
      }
      if (query.supplierId) {
        where.supplierId = query.supplierId;
      }

      const [purchaseOrders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          skip,
          take: limit,
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      return {
        data: purchaseOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error getting purchase orders:', error);
      throw error;
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(id: string, tenantId: string) {
    try {
      const purchaseOrder = await prisma.purchaseOrder.findFirst({
        where: { id, tenantId },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      return purchaseOrder;
    } catch (error: any) {
      logger.error('Error getting purchase order:', error);
      throw error;
    }
  }

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(tenantId: string, userId: string, data: CreatePurchaseOrderInput) {
    try {
      // Validate input
      if (!data.items || data.items.length === 0) {
        throw new Error('Purchase order must have at least one item');
      }

      // Verify supplier exists
      await supplierService.getSupplierById(data.supplierId, tenantId);

      // Verify all products exist and belong to tenant
      const productIds = data.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          tenantId,
        },
        select: { id: true },
      });

      if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        throw new Error(`Products not found: ${missingIds.join(', ')}`);
      }

      // Calculate total amount
      const totalAmount = new Prisma.Decimal(
        data.items.reduce((sum, item) => {
          const quantity = Number(item.quantity);
          const unitPrice = Number(item.unitPrice);
          if (isNaN(quantity) || isNaN(unitPrice) || quantity <= 0 || unitPrice <= 0) {
            throw new Error(`Invalid quantity or unitPrice for product ${item.productId}`);
          }
          return sum + (quantity * unitPrice);
        }, 0)
      );

      return await prisma.$transaction(async (tx) => {
        // Generate order number
        const orderNumber = await this.generateOrderNumber(tenantId);

        // Create purchase order
        const purchaseOrder = await tx.purchaseOrder.create({
          data: {
            tenantId,
            supplierId: data.supplierId,
            orderNumber,
            expectedDate: data.expectedDate || undefined,
            totalAmount,
            notes: data.notes || undefined,
            createdBy: userId,
            status: 'PENDING',
            items: {
              create: data.items.map(item => {
                const quantity = Number(item.quantity);
                const unitPrice = new Prisma.Decimal(item.unitPrice);
                const totalPrice = new Prisma.Decimal(quantity * Number(item.unitPrice));
                
                return {
                  productId: item.productId,
                  quantity: quantity,
                  unitPrice: unitPrice,
                  totalPrice: totalPrice,
                  notes: item.notes || undefined,
                };
              }),
            },
          },
          include: {
            supplier: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        logger.info('Purchase order created successfully', {
          purchaseOrderId: purchaseOrder.id,
          orderNumber: purchaseOrder.orderNumber,
          tenantId,
          userId,
        });

        return purchaseOrder;
      });
    } catch (error: any) {
      logger.error('Error creating purchase order:', {
        error: error.message,
        stack: error.stack,
        tenantId,
        userId,
        data: {
          supplierId: data.supplierId,
          itemsCount: data.items?.length,
        },
      });
      throw error;
    }
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(id: string, tenantId: string, userId: string, data: UpdatePurchaseOrderInput) {
    try {
      const purchaseOrder = await this.getPurchaseOrderById(id, tenantId);

      // If updating to RECEIVED, update product stock
      if (data.status === 'RECEIVED' && purchaseOrder.status !== 'RECEIVED') {
        return await this.receivePurchaseOrder(id, tenantId, userId, data.receivedDate);
      }

      // Calculate new total if items updated
      let totalAmount: any = purchaseOrder.totalAmount;
      if (data.items) {
        totalAmount = new Prisma.Decimal(
          data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
        );
      }

      return await prisma.$transaction(async (tx) => {
        // Update purchase order
        const updatedOrder = await tx.purchaseOrder.update({
          where: { id: purchaseOrder.id },
          data: {
            status: data.status || purchaseOrder.status,
            expectedDate: data.expectedDate || purchaseOrder.expectedDate,
            notes: data.notes || purchaseOrder.notes,
            totalAmount,
            ...(data.status === 'APPROVED' && { approvedBy: userId }),
          },
        });

        // Update items if provided
        if (data.items) {
          // Delete existing items
          await tx.purchaseOrderItem.deleteMany({
            where: { purchaseOrderId: purchaseOrder.id },
          });

          // Create new items
          await tx.purchaseOrderItem.createMany({
            data: data.items.map(item => ({
              purchaseOrderId: purchaseOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              receivedQuantity: item.receivedQuantity || 0,
              notes: item.notes,
            })),
          });
        }

        return await this.getPurchaseOrderById(id, tenantId);
      });
    } catch (error: any) {
      logger.error('Error updating purchase order:', error);
      throw error;
    }
  }

  /**
   * Receive purchase order (update stock)
   */
  async receivePurchaseOrder(id: string, tenantId: string, userId: string, receivedDate?: Date) {
    try {
      const purchaseOrder = await this.getPurchaseOrderById(id, tenantId);

      if (purchaseOrder.status === 'RECEIVED') {
        throw new Error('Purchase order already received');
      }

      return await prisma.$transaction(async (tx) => {
        // Update stock for each item
        for (const item of purchaseOrder.items) {
          const receivedQty = item.receivedQuantity || item.quantity;
          if (receivedQty > 0) {
            await productService.updateStock(
              item.productId,
              receivedQty,
              tenantId,
              'add'
            );

            // Update received quantity
            await tx.purchaseOrderItem.update({
              where: { id: item.id },
              data: { receivedQuantity: receivedQty },
            });
          }
        }

        // Update purchase order status
        const updatedOrder = await tx.purchaseOrder.update({
          where: { id: purchaseOrder.id },
          data: {
            status: 'RECEIVED',
            receivedDate: receivedDate || new Date(),
          },
        });

        return await this.getPurchaseOrderById(id, tenantId);
      });
    } catch (error: any) {
      logger.error('Error receiving purchase order:', error);
      throw error;
    }
  }

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(id: string, tenantId: string) {
    try {
      const purchaseOrder = await this.getPurchaseOrderById(id, tenantId);

      if (purchaseOrder.status === 'RECEIVED') {
        throw new Error('Cannot cancel received purchase order');
      }

      return await prisma.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: { status: 'CANCELLED' },
      });
    } catch (error: any) {
      logger.error('Error cancelling purchase order:', error);
      throw error;
    }
  }
}

export default new PurchaseOrderService();

