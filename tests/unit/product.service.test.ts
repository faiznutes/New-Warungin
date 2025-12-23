/**
 * Unit Tests: Product Service - Stock Operations
 * Tests for stock update, validation, retry mechanism, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import productService from '../../src/services/product.service';
import prisma from '../../src/config/database';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    product: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../src/utils/distributed-lock', () => ({
  withLock: vi.fn((key: string, fn: () => Promise<any>) => fn()),
}));

vi.mock('../../src/utils/cache', () => ({
  default: {
    delete: vi.fn(),
  },
}));

vi.mock('../../src/utils/metrics', () => ({
  stockUpdateDuration: {
    observe: vi.fn(),
  },
  stockUpdateTotal: {
    inc: vi.fn(),
  },
  stockUpdateFailures: {
    inc: vi.fn(),
  },
  stockRetryAttempts: {
    inc: vi.fn(),
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
    STOCK_LOCK_TIMEOUT: 10,
  },
}));

describe('Product Service - Stock Operations', () => {
  const tenantId = 'tenant-1';
  const productId = 'product-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateStock - Add Operation', () => {
    it('should add stock successfully', async () => {
      const initialStock = 100;
      const addQuantity = 50;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: initialStock + addQuantity,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        addQuantity,
        tenantId,
        'add'
      );

      expect(result).toBeDefined();
      expect(result.stock).toBe(initialStock + addQuantity);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId, tenantId },
        data: { stock: initialStock + addQuantity },
      });
    });

    it('should handle adding zero stock', async () => {
      const initialStock = 100;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        0,
        tenantId,
        'add'
      );

      expect(result.stock).toBe(initialStock);
    });
  });

  describe('updateStock - Subtract Operation', () => {
    it('should subtract stock successfully when sufficient stock available', async () => {
      const initialStock = 100;
      const subtractQuantity = 30;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: initialStock - subtractQuantity,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        subtractQuantity,
        tenantId,
        'subtract'
      );

      expect(result).toBeDefined();
      expect(result.stock).toBe(initialStock - subtractQuantity);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId, tenantId },
        data: { stock: initialStock - subtractQuantity },
      });
    });

    it('should throw error when insufficient stock', async () => {
      const initialStock = 50;
      const subtractQuantity = 100; // More than available

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      await expect(
        productService.updateStock(
          productId,
          subtractQuantity,
          tenantId,
          'subtract'
        )
      ).rejects.toThrow('Insufficient stock');

      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should allow subtracting exact stock amount', async () => {
      const initialStock = 100;
      const subtractQuantity = 100; // Exact amount

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: 0,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        subtractQuantity,
        tenantId,
        'subtract'
      );

      expect(result.stock).toBe(0);
    });
  });

  describe('updateStock - Set Operation', () => {
    it('should set stock to specific value', async () => {
      const newStock = 200;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: 100,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: newStock,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        newStock,
        tenantId,
        'set'
      );

      expect(result.stock).toBe(newStock);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId, tenantId },
        data: { stock: newStock },
      });
    });

    it('should allow setting stock to zero', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: 100,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: 0,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        0,
        tenantId,
        'set'
      );

      expect(result.stock).toBe(0);
    });
  });

  describe('updateStock - Validation', () => {
    it('should throw error when product not found', async () => {
      (prisma.product.findFirst as any).mockResolvedValue(null);

      await expect(
        productService.updateStock(productId, 10, tenantId, 'add')
      ).rejects.toThrow('Product not found');

      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should throw error when calculated stock is negative (add operation)', async () => {
      const initialStock = 10;
      const addQuantity = -20; // This would result in negative stock

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      // Note: In real scenario, add with negative would result in subtraction
      // But if somehow newStock becomes negative, it should be caught
      await expect(
        productService.updateStock(
          productId,
          -100, // Large negative that would make stock negative
          tenantId,
          'add'
        )
      ).rejects.toThrow('Stock cannot be negative');
    });

    it('should throw error when set operation results in negative stock', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: 100,
        name: 'Test Product',
        tenantId,
      });

      await expect(
        productService.updateStock(productId, -10, tenantId, 'set')
      ).rejects.toThrow('Stock cannot be negative');
    });
  });

  describe('updateStock - Retry Mechanism', () => {
    it('should retry on transient errors', async () => {
      const initialStock = 100;
      let callCount = 0;

      (prisma.product.findFirst as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call fails with transient error
          throw new Error('Connection timeout');
        }
        return Promise.resolve({
          id: productId,
          stock: initialStock,
          name: 'Test Product',
          tenantId,
        });
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: initialStock + 10,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        10,
        tenantId,
        'add'
      );

      expect(result).toBeDefined();
      expect(callCount).toBeGreaterThan(1); // Should have retried
    });

    it('should not retry on validation errors', async () => {
      (prisma.product.findFirst as any).mockResolvedValue(null);

      let callCount = 0;
      (prisma.product.findFirst as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve(null);
      });

      await expect(
        productService.updateStock(productId, 10, tenantId, 'add')
      ).rejects.toThrow('Product not found');

      // Should not retry on validation errors
      expect(callCount).toBe(1);
    });

    it('should not retry on insufficient stock error', async () => {
      const initialStock = 50;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      let callCount = 0;
      (prisma.product.findFirst as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          id: productId,
          stock: initialStock,
          name: 'Test Product',
          tenantId,
        });
      });

      await expect(
        productService.updateStock(productId, 100, tenantId, 'subtract')
      ).rejects.toThrow('Insufficient stock');

      // Should not retry on business logic errors
      expect(callCount).toBe(1);
    });
  });

  describe('updateStock - Tenant Isolation', () => {
    it('should only update product for correct tenant', async () => {
      const initialStock = 100;
      const correctTenantId = 'tenant-1';
      const wrongTenantId = 'tenant-2';

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId: correctTenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: initialStock + 10,
        name: 'Test Product',
        tenantId: correctTenantId,
      });

      await productService.updateStock(productId, 10, correctTenantId, 'add');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId, tenantId: correctTenantId },
        data: { stock: initialStock + 10 },
      });
    });

    it('should not find product from different tenant', async () => {
      const wrongTenantId = 'tenant-2';

      (prisma.product.findFirst as any).mockResolvedValue(null);

      await expect(
        productService.updateStock(productId, 10, wrongTenantId, 'add')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('updateStock - Edge Cases', () => {
    it('should handle very large stock values', async () => {
      const largeStock = 999999999;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: 100,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: largeStock,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        largeStock,
        tenantId,
        'set'
      );

      expect(result.stock).toBe(largeStock);
    });

    it('should handle decimal quantities correctly', async () => {
      const initialStock = 100.5;
      const addQuantity = 50.3;

      (prisma.product.findFirst as any).mockResolvedValue({
        id: productId,
        stock: initialStock,
        name: 'Test Product',
        tenantId,
      });

      (prisma.product.update as any).mockResolvedValue({
        id: productId,
        stock: initialStock + addQuantity,
        name: 'Test Product',
        tenantId,
      });

      const result = await productService.updateStock(
        productId,
        addQuantity,
        tenantId,
        'add'
      );

      expect(result.stock).toBeCloseTo(initialStock + addQuantity, 1);
    });
  });
});

