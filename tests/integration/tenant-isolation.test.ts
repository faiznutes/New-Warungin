/**
 * Integration Tests: Tenant Isolation
 * Critical security test to ensure no cross-tenant data access
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testPrisma } from '../setup';
import { createTestTenant, createTestUser, createTestProduct } from '../helpers/test-helpers';
import userService from '../../src/services/user.service';
import productService from '../../src/services/product.service';

describe('Tenant Isolation Integration Tests', () => {
  let tenant1: any;
  let tenant2: any;
  let user1: any;
  let user2: any;
  let product1: any;
  let product2: any;

  beforeAll(async () => {
    // Create two separate tenants
    tenant1 = await createTestTenant({
      name: 'Tenant 1',
      email: 'tenant1@warungin.com',
      slug: 'tenant-1',
    });

    tenant2 = await createTestTenant({
      name: 'Tenant 2',
      email: 'tenant2@warungin.com',
      slug: 'tenant-2',
    });

    // Create users for each tenant
    user1 = await createTestUser({
      tenantId: tenant1.id,
      email: 'user1@tenant1.com',
      role: 'ADMIN_TENANT',
    });

    user2 = await createTestUser({
      tenantId: tenant2.id,
      email: 'user2@tenant2.com',
      role: 'ADMIN_TENANT',
    });

    // Create products for each tenant
    product1 = await createTestProduct({
      tenantId: tenant1.id,
      name: 'Product Tenant 1',
      price: 10000,
    });

    product2 = await createTestProduct({
      tenantId: tenant2.id,
      name: 'Product Tenant 2',
      price: 20000,
    });
  });

  it('should not allow tenant 1 to access tenant 2 users', async () => {
    const users = await userService.getUsers(tenant1.id, 1, 10);
    
    // Should only return users from tenant1
    expect(users.data.every((u: any) => u.tenantId === tenant1.id)).toBe(true);
    expect(users.data.find((u: any) => u.id === user2.id)).toBeUndefined();
  });

  it('should not allow tenant 2 to access tenant 1 users', async () => {
    const users = await userService.getUsers(tenant2.id, 1, 10);
    
    // Should only return users from tenant2
    expect(users.data.every((u: any) => u.tenantId === tenant2.id)).toBe(true);
    expect(users.data.find((u: any) => u.id === user1.id)).toBeUndefined();
  });

  it('should not allow tenant 1 to access tenant 2 products', async () => {
    const product = await productService.getProductById(product2.id, tenant1.id);
    expect(product).toBeNull();
  });

  it('should not allow tenant 2 to access tenant 1 products', async () => {
    const product = await productService.getProductById(product1.id, tenant2.id);
    expect(product).toBeNull();
  });

  it('should not allow tenant 1 to update tenant 2 product', async () => {
    await expect(
      productService.updateProduct(product2.id, tenant1.id, {
        name: 'Hacked Product',
      })
    ).rejects.toThrow();
  });

  it('should not allow tenant 2 to update tenant 1 product', async () => {
    await expect(
      productService.updateProduct(product1.id, tenant2.id, {
        name: 'Hacked Product',
      })
    ).rejects.toThrow();
  });
});
