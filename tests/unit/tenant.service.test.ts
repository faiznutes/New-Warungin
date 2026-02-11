/**
 * Unit Tests: Tenant Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import tenantService from '../../src/services/tenant.service';
import prisma from '../../src/config/database';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    tenant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      create: vi.fn(),
      updateMany: vi.fn(),
      createMany: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
    $transaction: vi.fn(async (callback) => {
      // Execute callback with mocked tx
      const tx = {
        tenant: {
          create: vi.fn().mockImplementation((args) => Promise.resolve({
            id: 'tenant-1',
            name: args.data.name,
            email: args.data.email || 'test@warungin.com',
            subscriptionPlan: args.data.subscriptionPlan,
            isActive: true,
          })),
          update: vi.fn().mockResolvedValue({}),
        },
        subscription: {
          create: vi.fn().mockResolvedValue({ id: 'sub-1' }),
        },
        user: {
          create: vi.fn().mockImplementation((args) => Promise.resolve({
            id: 'user-' + Math.random(),
            email: args.data.email,
            name: args.data.name,
            role: args.data.role,
          })),
          updateMany: vi.fn().mockResolvedValue({ count: 4 }),
        },
        receiptTemplate: {
          create: vi.fn().mockResolvedValue({ id: 'template-1' }),
        },
      };
      return callback(tx);
    }),
  },
}));

vi.mock('../../src/utils/encryption', () => ({
  encrypt: vi.fn((val: string) => `encrypted-${val}`),
  decrypt: vi.fn((val: string) => val.replace('encrypted-', '')),
}));

vi.mock('../../src/services/user.service', () => ({
  default: {
    createUser: vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'test@warungin.com',
      role: 'ADMIN_TENANT',
    }),
  },
}));

describe('Tenant Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create tenant successfully', async () => {
    (prisma.tenant.findUnique as any).mockResolvedValue(null); // No existing tenant
    (prisma.tenant.create as any).mockResolvedValue({
      id: 'tenant-1',
      name: 'Test Tenant',
      email: 'TestTenant@warungin.com',
      slug: 'test-tenant',
      subscriptionPlan: 'BASIC',
      isActive: true,
    });
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-1',
      email: 'TestTenant@warungin.com',
      role: 'ADMIN_TENANT',
    });

    const result = await tenantService.createTenant({
      name: 'Test Tenant',
      subscriptionPlan: 'BASIC',
    });

    expect(result.tenant).toBeDefined();
    expect(result.tenant.name).toBe('Test Tenant');
    expect(result.tenant.subscriptionPlan).toBe('BASIC');
  });

  it('should generate email from tenant name', async () => {
    (prisma.tenant.findUnique as any).mockResolvedValue(null);

    const result = await tenantService.createTenant({
      name: 'Nasi Padang Barokah',
      subscriptionPlan: 'BASIC',
    });

    expect(result.tenant).toBeDefined();
    expect(result.tenant.email).toContain('@warungin.com');
    // The mocked transaction returns args.data.email OR default.
    // Since createTenant logic generates email and passes it to tx.create,
    // args.data.email will be the generated email.
    // So checking if it contains 'Nasi' might fail if logic strips it?
    // Logic: removes 'Nasi', 'Warung' etc.
    // 'Nasi Padang Barokah' -> 'PadangBarokah'
    expect(result.tenant.email).not.toContain('Nasi');
  });

  it('should get tenants with pagination', async () => {
    (prisma.tenant.findMany as any).mockResolvedValue([
      {
        id: 'tenant-1',
        name: 'Tenant 1',
        email: 'tenant1@warungin.com',
        isActive: true,
      },
    ]);
    (prisma.tenant.count as any).mockResolvedValue(1);

    const result = await tenantService.getTenants(1, 10);

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should get tenant by ID', async () => {
    (prisma.tenant.findUnique as any).mockResolvedValue({
      id: 'tenant-1',
      name: 'Test Tenant',
      email: 'test@warungin.com',
      isActive: true,
    });

    const tenant = await tenantService.getTenantById('tenant-1');
    // getTenantById returns the tenant object directly (or from cache)

    expect(tenant).toBeDefined();
    expect(tenant?.id).toBe('tenant-1');
  });

  it('should throw error for duplicate tenant email', async () => {
    (prisma.tenant.findUnique as any).mockResolvedValue({
      id: 'existing-tenant',
      email: 'existing@warungin.com',
    });

    await expect(
      tenantService.createTenant({
        name: 'Duplicate Tenant',
      })
    ).rejects.toThrow();
  });
});
