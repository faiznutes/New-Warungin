/**
 * Unit Test: Addon Service
 * 
 * Test untuk memastikan addon service bekerja dengan benar
 */

import { describe, it, expect, beforeEach } from 'vitest';
import addonService from '../../src/services/addon.service';
import prisma from '../../src/config/database';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    tenantAddon: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
    outlet: {
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock('../../src/services/plan-features.service', () => ({
  default: {
    checkPlanLimit: vi.fn().mockResolvedValue({ allowed: true, currentUsage: 0, limit: 100 }),
  },
}));

vi.mock('../../src/services/reward-point.service', () => ({
  default: {
    awardPointsFromAddon: vi.fn(),
  },
}));

describe('AddonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (prisma.tenantAddon.findMany as any).mockResolvedValue([]);
    (prisma.tenantAddon.count as any).mockResolvedValue(0);
    (prisma.tenantAddon.create as any).mockImplementation((args) => Promise.resolve({ ...args.data, id: 'addon-1' }));
    (prisma.tenantAddon.update as any).mockImplementation((args) => Promise.resolve({ ...args.data, id: args.where.id }));
    (prisma.user.count as any).mockResolvedValue(0);
    (prisma.product.count as any).mockResolvedValue(0);
    (prisma.outlet.count as any).mockResolvedValue(0);
  });

  describe('getAvailableAddons', () => {
    it('should return all available addons', async () => {
      const addons = await addonService.getAvailableAddons();
      expect(Array.isArray(addons)).toBe(true);
      expect(addons.length).toBeGreaterThan(0);
    });

    it('should include all required addon fields', async () => {
      const addons = await addonService.getAvailableAddons();
      const firstAddon = addons[0];

      expect(firstAddon).toHaveProperty('id');
      expect(firstAddon).toHaveProperty('name');
      expect(firstAddon).toHaveProperty('type');
      expect(firstAddon).toHaveProperty('description');
      expect(firstAddon).toHaveProperty('price');
    });
  });

  describe('getTenantAddons', () => {
    it('should return active addons for tenant', async () => {
      (prisma.tenantAddon.findMany as any).mockResolvedValue([
        {
          id: 'addon-1',
          addonId: 'add_users',
          addonType: 'ADD_USERS',
          status: 'active',
          limit: 5,
        }
      ]);
      (prisma.tenantAddon.count as any).mockResolvedValue(1);

      const tenantId = 'test-tenant-id';
      const result = await addonService.getTenantAddons(tenantId);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should exclude expired addons', async () => {
      // Test: Addon dengan expiresAt < now tidak muncul
    });

    it('should calculate current usage for limit-based addons', async () => {
      // Test: ADD_USERS, ADD_PRODUCTS, ADD_OUTLETS menampilkan currentUsage
    });
  });

  describe('subscribeAddon', () => {
    it('should create new addon subscription', async () => {
      const tenantId = 'test-tenant-id';
      const addonData = {
        addonId: 'export_reports',
        addonName: 'Export Laporan',
        addonType: 'EXPORT_REPORTS',
      };

      (prisma.tenant.findUnique as any).mockResolvedValue({ id: tenantId, subscriptionEnd: new Date() });
      (prisma.tenantAddon.findUnique as any).mockResolvedValue(null); // No existing addon

      const addon = await addonService.subscribeAddon(tenantId, addonData);

      expect(addon).toHaveProperty('id');
      expect(addon.addonType).toBe('EXPORT_REPORTS');
      expect(addon.status).toBe('active');
    });

    it('should reuse existing addon subscription (non-limit addon)', async () => {
      const tenantId = 'test-tenant-id';
      const addonData = {
        addonId: 'export_reports',
        addonName: 'Export Laporan',
        addonType: 'EXPORT_REPORTS',
      };

      (prisma.tenant.findUnique as any).mockResolvedValue({ id: tenantId, subscriptionEnd: new Date() });
      (prisma.tenantAddon.findUnique as any).mockResolvedValue({
        id: 'existing-addon',
        addonType: 'EXPORT_REPORTS',
        status: 'active',
        limit: null // Non-limit addon
      });

      const addon = await addonService.subscribeAddon(tenantId, addonData);
      expect(addon).toBeDefined();
      expect(prisma.tenantAddon.update).toHaveBeenCalled();
    });

    it('should allow multiple subscriptions for limit-based addons', async () => {
      const tenantId = 'test-tenant-id';
      const addonData = {
        addonId: 'add_users',
        addonName: 'Tambah User',
        addonType: 'ADD_USERS',
        limit: 5
      };

      (prisma.tenant.findUnique as any).mockResolvedValue({ id: tenantId, subscriptionEnd: new Date() });
      (prisma.tenantAddon.findUnique as any).mockResolvedValue({
        id: 'existing-addon',
        addonType: 'ADD_USERS',
        status: 'active',
        limit: 5
      });

      await addonService.subscribeAddon(tenantId, addonData);

      expect(prisma.tenantAddon.update).toHaveBeenCalled();
      const updateCall = (prisma.tenantAddon.update as any).mock.calls[0][0];
      expect(updateCall.data.limit).toBe(10); // 5 + 5
    });
  });

  describe('unsubscribeAddon', () => {
    it('should deactivate addon', async () => {
      const tenantId = 'test-tenant-id';
      const addonId = 'export_reports';

      (prisma.tenantAddon.findUnique as any).mockResolvedValue({
        id: 'addon-1',
        tenantId,
        addonId,
        status: 'active'
      });

      await addonService.unsubscribeAddon(tenantId, addonId);

      const updateCall = (prisma.tenantAddon.update as any).mock.calls[0][0];

      expect(updateCall.data.status).toBe('inactive');
    });
  });

  describe('checkLimit', () => {
    it('should return allowed: true if under limit', async () => {
      // Test: Usage < limit
    });

    it('should return allowed: false if at limit', async () => {
      // Test: Usage >= limit
    });

    it('should return allowed: true for unlimited plans', async () => {
      // Test: ENTERPRISE plan dengan limit -1
    });
  });
});
