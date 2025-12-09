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
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock('../../src/utils/encryption', () => ({
  encrypt: vi.fn((val: string) => `encrypted-${val}`),
  decrypt: vi.fn((val: string) => val.replace('encrypted-', '')),
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

    const tenant = await tenantService.createTenant({
      name: 'Test Tenant',
      subscriptionPlan: 'BASIC',
    });

    expect(tenant).toBeDefined();
    expect(tenant.name).toBe('Test Tenant');
    expect(tenant.subscriptionPlan).toBe('BASIC');
  });

  it('should generate email from tenant name', async () => {
    (prisma.tenant.findUnique as any).mockResolvedValue(null);
    (prisma.tenant.create as any).mockResolvedValue({
      id: 'tenant-1',
      name: 'Nasi Padang Barokah',
      email: 'PadangBarokah@warungin.com',
      slug: 'nasi-padang-barokah',
    });
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-1',
      email: 'PadangBarokah@warungin.com',
    });

    const tenant = await tenantService.createTenant({
      name: 'Nasi Padang Barokah',
    });

    expect(tenant.email).toContain('@warungin.com');
    expect(tenant.email).not.toContain('Nasi');
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

    const result = await tenantService.getTenants({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should get tenant by ID', async () => {
    (prisma.tenant.findFirst as any).mockResolvedValue({
      id: 'tenant-1',
      name: 'Test Tenant',
      email: 'test@warungin.com',
      isActive: true,
    });

    const tenant = await tenantService.getTenantById('tenant-1');

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
