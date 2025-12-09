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
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
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
});
