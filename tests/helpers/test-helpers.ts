/**
 * Test Helper Functions
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { testPrisma } from '../setup';

/**
 * Create a test tenant
 */
export async function createTestTenant(data?: {
  name?: string;
  email?: string;
  slug?: string;
  subscriptionPlan?: string;
}) {
  const tenant = await testPrisma.tenant.create({
    data: {
      name: data?.name || 'Test Tenant',
      email: data?.email || `test-${Date.now()}@example.com`,
      slug: data?.slug || `test-tenant-${Date.now()}`,
      subscriptionPlan: data?.subscriptionPlan || 'BASIC',
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  });
  return tenant;
}

/**
 * Create a test user
 */
export async function createTestUser(data: {
  tenantId: string;
  email?: string;
  password?: string;
  role?: string;
  name?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password || 'Test123!', 10);
  
  const user = await testPrisma.user.create({
    data: {
      tenantId: data.tenantId,
      email: data.email || `user-${Date.now()}@example.com`,
      password: hashedPassword,
      role: data.role || 'ADMIN',
      name: data.name || 'Test User',
      isActive: true,
    },
  });
  return user;
}

/**
 * Create a test product
 */
export async function createTestProduct(data: {
  tenantId: string;
  name?: string;
  price?: number;
  stock?: number;
}) {
  const product = await testPrisma.product.create({
    data: {
      tenantId: data.tenantId,
      name: data.name || 'Test Product',
      price: data.price || 10000,
      stock: data.stock || 100,
      description: 'Test product description',
      category: 'Test Category',
      isActive: true,
    },
  });
  return product;
}

/**
 * Create a test customer
 */
export async function createTestCustomer(data: {
  tenantId: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  const customer = await testPrisma.customer.create({
    data: {
      tenantId: data.tenantId,
      name: data.name || 'Test Customer',
      email: data.email || `customer-${Date.now()}@example.com`,
      phone: data.phone || '081234567890',
    },
  });
  return customer;
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  // Cleanup is handled in setup.ts afterAll
  // This function can be used for specific cleanup if needed
}

/**
 * Generate JWT token for testing (mock)
 */
export function generateTestToken(payload: { userId: string; tenantId: string; role: string }) {
  // In real tests, use the actual JWT service
  // This is a placeholder
  return `test-token-${payload.userId}-${payload.tenantId}`;
}

/**
 * Wait for async operations
 */
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
