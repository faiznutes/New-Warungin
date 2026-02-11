// Integration test for concurrent order creation to validate atomic stock decrement
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

// Skip test if no TEST_DATABASE_URL provided
const TEST_DB = process.env.TEST_DATABASE_URL;
if (!TEST_DB) {
  // Create a skipped test suite to indicate reason
  describe.skip('integration: order concurrency (skipped)', () => {
    it('skipped because TEST_DATABASE_URL is not set', () => {
      expect(true).toBe(true);
    });
  });
} else {
  // Ensure prisma picks up the TEST_DATABASE_URL
  process.env.DATABASE_URL = TEST_DB;

  import prisma from '../../src/config/database';
  import OrderService from '../../src/services/order.service';

  describe('integration: order concurrency', () => {
    const tenantId = 'integration-concurrency-tenant';
    const productId = 'integration-concurrency-product';
    const orderService = new OrderService();

    beforeAll(async () => {
      // Connect and setup minimal fixtures
      await prisma.$connect();
      // Clean up if present
      await prisma.orderItem.deleteMany({ where: { } }).catch(() => {});
      await prisma.order.deleteMany({ where: { } }).catch(() => {});
      await prisma.product.deleteMany({ where: { id: productId } }).catch(() => {});
      await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});

      await prisma.tenant.create({ data: { id: tenantId, name: 'Integration Tenant' } });

      await prisma.product.create({
        data: {
          id: productId,
          tenantId,
          name: 'Concurrency Test Product',
          sku: 'CTP-1',
          price: 10000,
          stock: 1,
        },
      });
    });

    afterAll(async () => {
      // Cleanup
      await prisma.orderItem.deleteMany({ where: {} }).catch(() => {});
      await prisma.order.deleteMany({ where: {} }).catch(() => {});
      await prisma.product.deleteMany({ where: { id: productId } }).catch(() => {});
      await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
      await prisma.$disconnect();
    });

    it('allows only one order to succeed when stock is 1 (concurrent)', async () => {
      const payload = {
        items: [{ productId, quantity: 1, price: 10000 }],
        total: 10000,
      } as any;

      const p1 = orderService.createOrder(payload, 'user-a', tenantId);
      const p2 = orderService.createOrder(payload, 'user-b', tenantId);

      const results = await Promise.allSettled([p1, p2]);

      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // Verify final stock is 0
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      expect(prod).toBeTruthy();
      expect(prod!.stock).toBe(0);

      // Rejection reason should indicate insufficient stock or similar
      const reason = (rejected[0] as PromiseRejectedResult).reason as Error;
      expect(reason).toBeDefined();
      expect(reason.message.toLowerCase()).toMatch(/insufficient stock|stock/i);
    });
  });
}
