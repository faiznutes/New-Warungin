/**
 * Integration Tests: POS Order Creation
 * Tests critical order flow with stock management
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testPrisma } from '../setup';
import { createTestTenant, createTestUser, createTestProduct, createTestCustomer } from '../helpers/test-helpers';
import orderService from '../../src/services/order.service';
import productService from '../../src/services/product.service';

describe('POS Order Integration Tests', () => {
  let tenant: any;
  let user: any;
  let product: any;
  let customer: any;

  beforeAll(async () => {
    tenant = await createTestTenant({
      name: 'POS Test Tenant',
      email: 'postest@warungin.com',
      slug: 'pos-test-tenant',
    });

    user = await createTestUser({
      tenantId: tenant.id,
      email: 'cashier@example.com',
      role: 'CASHIER',
    });

    product = await createTestProduct({
      tenantId: tenant.id,
      name: 'Test Product',
      price: 15000,
      stock: 100,
    });

    customer = await createTestCustomer({
      tenantId: tenant.id,
      name: 'Test Customer',
    });
  });

  it('should create order successfully and reduce stock', async () => {
    const initialStock = product.stock;
    const quantity = 5;

    const order = await orderService.createOrder(tenant.id, {
      items: [
        {
          productId: product.id,
          quantity,
          price: product.price,
        },
      ],
      customerId: customer.id,
      paymentMethod: 'CASH',
      total: product.price * quantity,
    });

    expect(order).toBeDefined();
    expect(order.status).toBe('PENDING');

    // Verify stock was reduced
    const updatedProduct = await productService.getProductById(product.id, tenant.id);
    expect(updatedProduct?.stock).toBe(initialStock - quantity);
  });

  it('should fail to create order if stock is insufficient', async () => {
    // Get current stock
    const currentProduct = await productService.getProductById(product.id, tenant.id);
    const currentStock = currentProduct?.stock || 0;

    // Try to order more than available
    await expect(
      orderService.createOrder(tenant.id, {
        items: [
          {
            productId: product.id,
            quantity: currentStock + 10,
            price: product.price,
          },
        ],
        customerId: customer.id,
        paymentMethod: 'CASH',
        total: product.price * (currentStock + 10),
      })
    ).rejects.toThrow();
  });

  it('should handle concurrent orders with distributed lock', async () => {
    // This test verifies that distributed locking prevents race conditions
    const currentProduct = await productService.getProductById(product.id, tenant.id);
    const currentStock = currentProduct?.stock || 0;
    const orderQuantity = 2;

    // Create multiple orders concurrently
    const orders = await Promise.all([
      orderService.createOrder(tenant.id, {
        items: [
          {
            productId: product.id,
            quantity: orderQuantity,
            price: product.price,
          },
        ],
        customerId: customer.id,
        paymentMethod: 'CASH',
        total: product.price * orderQuantity,
      }),
      orderService.createOrder(tenant.id, {
        items: [
          {
            productId: product.id,
            quantity: orderQuantity,
            price: product.price,
          },
        ],
        customerId: customer.id,
        paymentMethod: 'CASH',
        total: product.price * orderQuantity,
      }),
    ]);

    expect(orders).toHaveLength(2);

    // Verify stock was reduced correctly (2 orders * 2 quantity = 4 total)
    const updatedProduct = await productService.getProductById(product.id, tenant.id);
    expect(updatedProduct?.stock).toBe(currentStock - (orderQuantity * 2));
  });

  it('should prevent duplicate orders with same idempotency key', async () => {
    const idempotencyKey = `test-key-${Date.now()}`;
    const orderData = {
      items: [
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
        },
      ],
      customerId: customer.id,
      paymentMethod: 'CASH',
      total: product.price,
    };

    // Create first order
    const order1 = await orderService.createOrder(tenant.id, orderData, idempotencyKey);
    
    // Try to create duplicate with same idempotency key
    const order2 = await orderService.createOrder(tenant.id, orderData, idempotencyKey);

    // Should return the same order
    expect(order2.id).toBe(order1.id);
  });
});
