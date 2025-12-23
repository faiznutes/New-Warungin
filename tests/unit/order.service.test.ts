/**
 * Unit Tests: Order Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import orderService from '../../src/services/order.service';
import prisma from '../../src/config/database';
import productService from '../../src/services/product.service';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    order: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    member: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

vi.mock('../../src/services/product.service', () => ({
  default: {
    getProductById: vi.fn(),
    updateStock: vi.fn(),
  },
}));

vi.mock('../../src/utils/metrics', () => ({
  stockRollbackTotal: {
    inc: vi.fn(),
  },
  stockRollbackDuration: {
    observe: vi.fn(),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../src/config/env', () => ({
  default: {
    ORDER_TRANSACTION_TIMEOUT: 30,
  },
}));

vi.mock('../../src/utils/cache', () => ({
  default: {
    delete: vi.fn(),
  },
}));

describe('Order Service Unit Tests', () => {
  const tenantId = 'tenant-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get orders with pagination', async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: 'order-1',
        tenantId,
        status: 'PENDING',
        total: 50000,
        items: [],
      },
    ]);
    (prisma.order.count as any).mockResolvedValue(1);

    const result = await orderService.getOrders(tenantId, {
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should get order by ID', async () => {
    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      tenantId,
      status: 'PENDING',
      total: 50000,
    });

    const order = await orderService.getOrderById('order-1', tenantId);

    expect(order).toBeDefined();
    expect(order?.id).toBe('order-1');
  });

  it('should create order with stock reduction', async () => {
    const productId = 'product-1';
    const quantity = 2;
    const price = 25000;

    (productService.getProductById as any).mockResolvedValue({
      id: productId,
      stock: 100,
      price,
    });

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'order-1',
            tenantId,
            status: 'PENDING',
            total: price * quantity,
          }),
        },
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: productId,
            stock: 100,
          }),
          update: vi.fn().mockResolvedValue({
            id: productId,
            stock: 98,
          }),
        },
      };
      return callback(tx);
    });

    const order = await orderService.createOrder(tenantId, {
      items: [
        {
          productId,
          quantity,
          price,
        },
      ],
      paymentMethod: 'CASH',
      total: price * quantity,
    });

    expect(order).toBeDefined();
    expect(order.status).toBe('PENDING');
  });

  it('should fail to create order with insufficient stock', async () => {
    const productId = 'product-1';
    const quantity = 200; // More than available stock

    (productService.getProductById as any).mockResolvedValue({
      id: productId,
      stock: 100, // Only 100 available
      price: 25000,
    });

    await expect(
      orderService.createOrder(tenantId, {
        items: [
          {
            productId,
            quantity,
            price: 25000,
          },
        ],
        paymentMethod: 'CASH',
        total: 25000 * quantity,
      })
    ).rejects.toThrow();
  });

  describe('Stock Rollback on Order Cancellation/Refund', () => {
    it('should restore stock atomically when order is cancelled', async () => {
      const orderId = 'order-1';
      const productId1 = 'product-1';
      const productId2 = 'product-2';
      const quantity1 = 5;
      const quantity2 = 3;

      const mockOrder = {
        id: orderId,
        tenantId,
        status: 'PENDING',
        total: 50000,
        items: [
          { id: 'item-1', productId: productId1, quantity: quantity1, price: 5000 },
          { id: 'item-2', productId: productId2, quantity: quantity2, price: 10000 },
        ],
      };

      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      // Mock transaction for stock rollback
      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            findFirst: vi.fn((args: any) => {
              if (args.where.id === productId1) {
                return Promise.resolve({ id: productId1, stock: 95 }); // Already reduced
              }
              if (args.where.id === productId2) {
                return Promise.resolve({ id: productId2, stock: 97 }); // Already reduced
              }
              return Promise.resolve(null);
            }),
            update: vi.fn((args: any) => {
              if (args.where.id === productId1) {
                return Promise.resolve({ id: productId1, stock: 95 + quantity1 });
              }
              if (args.where.id === productId2) {
                return Promise.resolve({ id: productId2, stock: 97 + quantity2 });
              }
              return Promise.resolve(null);
            }),
          },
        };
        return callback(tx);
      });

      (prisma.order.update as any).mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
      });

      const result = await orderService.updateOrderStatus(
        orderId,
        { status: 'CANCELLED' },
        tenantId
      );

      expect(result.status).toBe('CANCELLED');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should restore stock atomically when order is refunded', async () => {
      const orderId = 'order-1';
      const productId = 'product-1';
      const quantity = 10;

      const mockOrder = {
        id: orderId,
        tenantId,
        status: 'COMPLETED',
        total: 50000,
        items: [
          { id: 'item-1', productId, quantity, price: 5000 },
        ],
      };

      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            findFirst: vi.fn().mockResolvedValue({ id: productId, stock: 90 }),
            update: vi.fn().mockResolvedValue({ id: productId, stock: 100 }),
          },
        };
        return callback(tx);
      });

      (prisma.order.update as any).mockResolvedValue({
        ...mockOrder,
        status: 'REFUNDED',
      });

      const result = await orderService.updateOrderStatus(
        orderId,
        { status: 'REFUNDED' },
        tenantId
      );

      expect(result.status).toBe('REFUNDED');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should not restore stock if order is already cancelled', async () => {
      const orderId = 'order-1';
      const mockOrder = {
        id: orderId,
        tenantId,
        status: 'CANCELLED', // Already cancelled
        total: 50000,
        items: [],
      };

      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      (prisma.order.update as any).mockResolvedValue(mockOrder);

      await orderService.updateOrderStatus(
        orderId,
        { status: 'CANCELLED' },
        tenantId
      );

      // Should not call transaction for stock restore if already cancelled
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should handle stock rollback failure gracefully', async () => {
      const orderId = 'order-1';
      const productId = 'product-1';
      const quantity = 10;

      const mockOrder = {
        id: orderId,
        tenantId,
        status: 'PENDING',
        total: 50000,
        items: [
          { id: 'item-1', productId, quantity, price: 5000 },
        ],
      };

      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      // Mock transaction failure
      (prisma.$transaction as any).mockRejectedValue(
        new Error('Database transaction failed')
      );

      await expect(
        orderService.updateOrderStatus(orderId, { status: 'CANCELLED' }, tenantId)
      ).rejects.toThrow('Database transaction failed');

      // Order status should not be updated if stock rollback fails
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should restore stock for all items in order', async () => {
      const orderId = 'order-1';
      const items = [
        { id: 'item-1', productId: 'product-1', quantity: 5, price: 5000 },
        { id: 'item-2', productId: 'product-2', quantity: 3, price: 10000 },
        { id: 'item-3', productId: 'product-3', quantity: 2, price: 15000 },
      ];

      const mockOrder = {
        id: orderId,
        tenantId,
        status: 'PENDING',
        total: 100000,
        items,
      };

      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const updatedProducts: any[] = [];

      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            findFirst: vi.fn((args: any) => {
              const item = items.find(i => i.productId === args.where.id);
              return Promise.resolve({
                id: args.where.id,
                stock: 50, // Current stock
              });
            }),
            update: vi.fn((args: any) => {
              const item = items.find(i => i.productId === args.where.id);
              const updated = {
                id: args.where.id,
                stock: 50 + (item?.quantity || 0),
              };
              updatedProducts.push(updated);
              return Promise.resolve(updated);
            }),
          },
        };
        return callback(tx);
      });

      (prisma.order.update as any).mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
      });

      await orderService.updateOrderStatus(orderId, { status: 'CANCELLED' }, tenantId);

      // Should restore stock for all 3 products
      expect(updatedProducts).toHaveLength(3);
      expect(updatedProducts[0].stock).toBe(55); // 50 + 5
      expect(updatedProducts[1].stock).toBe(53); // 50 + 3
      expect(updatedProducts[2].stock).toBe(52); // 50 + 2
    });
  });

  describe('Order Validation', () => {
    it('should validate order items have valid productId', async () => {
      await expect(
        orderService.createOrder(tenantId, {
          items: [
            {
              productId: '', // Invalid: empty string
              quantity: 1,
              price: 10000,
            },
          ],
          paymentMethod: 'CASH',
          total: 10000,
        })
      ).rejects.toThrow();
    });

    it('should validate order items have positive quantity', async () => {
      await expect(
        orderService.createOrder(tenantId, {
          items: [
            {
              productId: 'product-1',
              quantity: 0, // Invalid: zero quantity
              price: 10000,
            },
          ],
          paymentMethod: 'CASH',
          total: 10000,
        })
      ).rejects.toThrow();
    });

    it('should validate order items have non-negative price', async () => {
      await expect(
        orderService.createOrder(tenantId, {
          items: [
            {
              productId: 'product-1',
              quantity: 1,
              price: -1000, // Invalid: negative price
            },
          ],
          paymentMethod: 'CASH',
          total: 10000,
        })
      ).rejects.toThrow();
    });
  });
});
