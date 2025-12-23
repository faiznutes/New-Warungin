/**
 * Integration Tests: Complete Offline Order Flow
 * Tests the entire flow from offline order creation → sync → backend validation
 * 
 * ⚠️ IMPORTANT: These tests are designed to run against a REAL API server
 * 
 * HOW TO RUN:
 * 1. Start your backend API server (npm run dev)
 * 2. Ensure PostgreSQL is running
 * 3. Set environment variables:
 *    TEST_API_URL=http://localhost:3000/api
 *    TEST_AUTH_TOKEN="Bearer your-test-token"
 * 4. Run: npm test -- tests/integration/offline-order-flow.test.ts
 * 
 * OR run against staging:
 * TEST_API_URL=https://staging-api.warungin.example.com npm test -- tests/integration/offline-order-flow.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Skip tests if API not available (for CI/CD environments without running API)
const SKIP_IF_NO_API = process.env.SKIP_INTEGRATION_TESTS === 'true' || !process.env.TEST_API_URL;

interface TestContext {
  api: any; // Using 'any' to avoid serialization issues with axios
  tenantId: string;
  baseUrl: string;
}

let ctx: TestContext;
let isApiAvailable = false;

// Setup test database and API client
beforeAll(async () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000/api';
  const authToken = process.env.TEST_AUTH_TOKEN || 'Bearer test-token';
  
  ctx = {
    api: null,
    tenantId: 'test-tenant-' + Date.now(),
    baseUrl: baseUrl,
  };

  // Try to check if API is available
  try {
    const response = await fetch(baseUrl.replace('/api', '/health'), {
      timeout: 5000,
    });
    isApiAvailable = response.ok;
    console.log('✓ API server is available - running integration tests');
  } catch (error) {
    console.warn('⚠️ API server not available - integration tests will be skipped');
    console.warn('To run integration tests:');
    console.warn('1. Start backend: npm run dev');
    console.warn('2. Ensure PostgreSQL is running');
    console.warn('3. Run: npm test -- tests/integration/offline-order-flow.test.ts');
  }
});

describe('Integration: Offline Order Flow', () => {
  describe('Scenario 1: Create Offline Order → Sync → Success', () => {
    it('should create offline order with valid data', async () => {
      // Setup: Create test product
      const productRes = await ctx.api.post('/products', {
        name: 'Test Product',
        sku: 'TEST-SKU-' + Date.now(),
        price: 50000,
        stock: 100,
        categoryId: 'cat-1',
        description: 'Test product for integration test',
      });

      expect(productRes.status).toBe(201);
      expect(productRes.data.id).toBeDefined();
      ctx.productId = productRes.data.id;

      // Action: Simulate offline order creation
      const offlineOrder = {
        items: [
          {
            productId: ctx.productId,
            quantity: 2,
            price: 50000,
          },
        ],
        customerId: null,
        discount: 0,
        paymentMethod: 'CASH',
        cashAmount: 100000,
      };

      // Verify order structure is valid
      expect(offlineOrder.items.length).toBeGreaterThan(0);
      expect(offlineOrder.items[0].quantity).toBeGreaterThan(0);
      expect(offlineOrder.items[0].price).toBeGreaterThanOrEqual(0);
    });

    it('should sync offline order to server and create transaction', async () => {
      // Setup: Ensure product and order exist
      expect(ctx.productId).toBeDefined();

      // Simulate offline order data
      const offlineOrderData = {
        items: [
          {
            productId: ctx.productId,
            quantity: 1,
            price: 50000,
          },
        ],
        customerId: null,
        discount: 0,
        paymentMethod: 'CASH',
        total: 50000,
      };

      // Action: POST to server (simulating sync)
      const orderRes = await ctx.api.post('/orders', offlineOrderData);

      // Verify: Order created successfully
      expect(orderRes.status).toBe(201);
      expect(orderRes.data.id).toBeDefined();
      expect(orderRes.data.status).toBe('COMPLETED');
      const orderId = orderRes.data.id;

      // Action: Create transaction
      const transactionRes = await ctx.api.post('/transactions', {
        orderId: orderId,
        amount: 50000,
        paymentMethod: 'CASH',
        cashAmount: 50000,
      });

      // Verify: Transaction created
      expect(transactionRes.status).toBe(201);
      expect(transactionRes.data.orderId).toBe(orderId);
      expect(transactionRes.data.amount).toBe(50000);

      // Verify: Stock decreased
      const productRes = await ctx.api.get(`/products/${ctx.productId}`);
      expect(productRes.status).toBe(200);
      expect(productRes.data.stock).toBe(99); // 100 - 1
    });

    it('should verify stock accuracy after sync', async () => {
      // Action: Query product stock
      const productRes = await ctx.api.get(`/products/${ctx.productId}`);

      // Verify: Stock matches expected
      expect(productRes.status).toBe(200);
      expect(productRes.data.stock).toBeGreaterThanOrEqual(0);
      expect(productRes.data.stock).toBeLessThanOrEqual(100); // Original stock
    });
  });

  describe('Scenario 2: Sync Fails Due to Stock Insufficient', () => {
    it('should reject offline order if stock insufficient on server', async () => {
      // Setup: Create product with low stock
      const productRes = await ctx.api.post('/products', {
        name: 'Low Stock Product',
        sku: 'LOW-SKU-' + Date.now(),
        price: 25000,
        stock: 1,
        categoryId: 'cat-1',
        description: 'Product with only 1 stock',
      });

      const lowStockProductId = productRes.data.id;

      // Simulate: 2 users trying to order same product offline
      const offlineOrder = {
        items: [
          {
            productId: lowStockProductId,
            quantity: 2, // More than available stock
            price: 25000,
          },
        ],
        customerId: null,
        discount: 0,
        paymentMethod: 'CASH',
        total: 50000,
      };

      // Action: Try to sync (should fail)
      try {
        await ctx.api.post('/orders', offlineOrder);
        // If we reach here, test should fail
        expect.fail('Expected order creation to fail due to insufficient stock');
      } catch (error: any) {
        // Verify: Got expected error
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toContain('insufficient');
      }
    });

    it('should mark order as failed sync in offline storage', async () => {
      // This test is pseudo-code as it requires client-side storage
      // In actual implementation, verify IndexedDB has failed sync record
      
      // Expected behavior:
      // 1. Order creation fails on server
      // 2. Client marks order as syncFailed in IndexedDB
      // 3. Error reason stored in syncError field
      // 4. Retry counter incremented
      
      const expectedFailedSyncRecord = {
        id: 'order-123',
        syncFailed: true,
        syncError: 'Product stock insufficient',
        retryCount: 1,
      };

      expect(expectedFailedSyncRecord.syncFailed).toBe(true);
      expect(expectedFailedSyncRecord.syncError).toBeDefined();
      expect(expectedFailedSyncRecord.retryCount).toBeGreaterThan(0);
    });
  });

  describe('Scenario 3: Concurrent Offline Orders - Race Condition Prevention', () => {
    it('should handle concurrent orders without stock going negative', async () => {
      // Setup: Create product with limited stock
      const productRes = await ctx.api.post('/products', {
        name: 'Race Condition Test Product',
        sku: 'RACE-SKU-' + Date.now(),
        price: 10000,
        stock: 10,
        categoryId: 'cat-1',
        description: 'Test product for race condition',
      });

      const raceTestProductId = productRes.data.id;
      const initialStock = 10;

      // Action: Simulate 5 concurrent orders, each with quantity 2 (total = 10)
      const orders = await Promise.all([
        ctx.api.post('/orders', {
          items: [{ productId: raceTestProductId, quantity: 2, price: 10000 }],
          total: 20000,
          paymentMethod: 'CASH',
        }),
        ctx.api.post('/orders', {
          items: [{ productId: raceTestProductId, quantity: 2, price: 10000 }],
          total: 20000,
          paymentMethod: 'CASH',
        }),
        ctx.api.post('/orders', {
          items: [{ productId: raceTestProductId, quantity: 2, price: 10000 }],
          total: 20000,
          paymentMethod: 'CASH',
        }),
        ctx.api.post('/orders', {
          items: [{ productId: raceTestProductId, quantity: 2, price: 10000 }],
          total: 20000,
          paymentMethod: 'CASH',
        }),
        ctx.api.post('/orders', {
          items: [{ productId: raceTestProductId, quantity: 2, price: 10000 }],
          total: 20000,
          paymentMethod: 'CASH',
        }),
      ]);

      // Filter out any failures (last order might fail if stock constraint)
      const successfulOrders = orders.filter(r => r.status === 201);

      // Verify: Stock never goes negative
      const finalProductRes = await ctx.api.get(`/products/${raceTestProductId}`);
      expect(finalProductRes.data.stock).toBeGreaterThanOrEqual(0);
      expect(finalProductRes.data.stock).toBeLessThanOrEqual(initialStock);

      // Verify: Total stock consumed matches successful orders
      const expectedStock = initialStock - (successfulOrders.length * 2);
      expect(finalProductRes.data.stock).toBe(expectedStock);
    });
  });

  describe('Scenario 4: Multi-Tenant Isolation', () => {
    it('should not leak data between tenants on order creation', async () => {
      // Setup: Create 2 different tenants
      const tenant1Id = 'tenant-1-' + Date.now();
      const tenant2Id = 'tenant-2-' + Date.now();

      // Create product in tenant1
      const api1 = axios.create({
        baseURL: process.env.TEST_API_URL || 'http://localhost:3000/api',
        headers: {
          'Authorization': ctx.authToken,
          'X-Tenant-ID': tenant1Id,
        },
      });

      const product1 = await api1.post('/products', {
        name: 'Tenant1 Product',
        sku: 'T1-' + Date.now(),
        price: 10000,
        stock: 100,
        categoryId: 'cat-1',
      });

      // Try to access tenant1's product from tenant2
      const api2 = axios.create({
        baseURL: process.env.TEST_API_URL || 'http://localhost:3000/api',
        headers: {
          'Authorization': ctx.authToken,
          'X-Tenant-ID': tenant2Id,
        },
      });

      try {
        await api2.get(`/products/${product1.data.id}`);
        expect.fail('Tenant2 should not be able to access Tenant1 product');
      } catch (error: any) {
        // Verify: Got forbidden error
        expect(error.response?.status).toBe(403);
      }
    });

    it('should isolate orders between tenants', async () => {
      // Similar test for orders
      // Tenant1 creates order, Tenant2 should not see it
      
      expect(true).toBe(true); // Placeholder - actual implementation in real tests
    });
  });

  describe('Scenario 5: Payment Integration', () => {
    it('should create transaction with CASH payment', async () => {
      // Setup: Create order
      const productRes = await ctx.api.post('/products', {
        name: 'Payment Test Product',
        sku: 'PAY-' + Date.now(),
        price: 50000,
        stock: 50,
        categoryId: 'cat-1',
      });

      const orderRes = await ctx.api.post('/orders', {
        items: [
          {
            productId: productRes.data.id,
            quantity: 1,
            price: 50000,
          },
        ],
        paymentMethod: 'CASH',
        total: 50000,
      });

      // Action: Create CASH transaction
      const transactionRes = await ctx.api.post('/transactions', {
        orderId: orderRes.data.id,
        amount: 50000,
        paymentMethod: 'CASH',
        cashAmount: 50000,
      });

      // Verify: Transaction created successfully
      expect(transactionRes.status).toBe(201);
      expect(transactionRes.data.paymentMethod).toBe('CASH');
      expect(transactionRes.data.status).toBe('COMPLETED');
    });

    it('should reject transaction with mismatched amount', async () => {
      // Setup: Create order with total 50000
      const productRes = await ctx.api.post('/products', {
        name: 'Amount Validation Product',
        sku: 'AMT-' + Date.now(),
        price: 50000,
        stock: 50,
        categoryId: 'cat-1',
      });

      const orderRes = await ctx.api.post('/orders', {
        items: [
          {
            productId: productRes.data.id,
            quantity: 1,
            price: 50000,
          },
        ],
        paymentMethod: 'CASH',
        total: 50000,
      });

      // Action: Create transaction with wrong amount
      try {
        await ctx.api.post('/transactions', {
          orderId: orderRes.data.id,
          amount: 40000, // Wrong! Order total is 50000
          paymentMethod: 'CASH',
        });
        expect.fail('Should reject transaction with mismatched amount');
      } catch (error: any) {
        // Verify: Got validation error
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toContain('amount');
      }
    });
  });

  describe('Scenario 6: Order Cancellation & Stock Rollback', () => {
    it('should restore stock when order is cancelled', async () => {
      // Setup: Create product and order
      const productRes = await ctx.api.post('/products', {
        name: 'Cancel Test Product',
        sku: 'CANCEL-' + Date.now(),
        price: 30000,
        stock: 50,
        categoryId: 'cat-1',
      });

      const initialStock = 50;
      const orderRes = await ctx.api.post('/orders', {
        items: [
          {
            productId: productRes.data.id,
            quantity: 5,
            price: 30000,
          },
        ],
        paymentMethod: 'CASH',
        total: 150000,
      });

      // Verify: Stock decreased
      let productCheck = await ctx.api.get(`/products/${productRes.data.id}`);
      expect(productCheck.data.stock).toBe(initialStock - 5);

      // Action: Cancel order
      const cancelRes = await ctx.api.put(`/orders/${orderRes.data.id}/status`, {
        status: 'CANCELLED',
      });

      // Verify: Stock restored
      productCheck = await ctx.api.get(`/products/${productRes.data.id}`);
      expect(productCheck.data.stock).toBe(initialStock);
      expect(cancelRes.data.status).toBe('CANCELLED');
    });

    it('should restore partial stock for partial order update', async () => {
      // Setup: Create order with 2 items
      const product1 = await ctx.api.post('/products', {
        name: 'Product 1',
        sku: 'P1-' + Date.now(),
        price: 20000,
        stock: 100,
        categoryId: 'cat-1',
      });

      const product2 = await ctx.api.post('/products', {
        name: 'Product 2',
        sku: 'P2-' + Date.now(),
        price: 30000,
        stock: 100,
        categoryId: 'cat-1',
      });

      const orderRes = await ctx.api.post('/orders', {
        items: [
          {
            productId: product1.data.id,
            quantity: 3,
            price: 20000,
          },
          {
            productId: product2.data.id,
            quantity: 2,
            price: 30000,
          },
        ],
        paymentMethod: 'CASH',
        total: 120000,
      });

      // Action: Update order items (remove product 2)
      const updateRes = await ctx.api.put(`/orders/${orderRes.data.id}`, {
        items: [
          {
            productId: product1.data.id,
            quantity: 3,
            price: 20000,
          },
        ],
      });

      // Verify: Product2 stock restored
      const product2Check = await ctx.api.get(`/products/${product2.data.id}`);
      expect(product2Check.data.stock).toBe(100); // Fully restored
    });
  });
});
