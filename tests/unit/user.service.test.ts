/**
 * Unit Tests: User Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from '../../src/services/user.service';
import prisma from '../../src/config/database';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock('../../src/utils/encryption', () => ({
  encrypt: vi.fn((val: string) => `encrypted-${val}`),
  decrypt: vi.fn((val: string) => val.replace('encrypted-', '')),
}));

vi.mock('../../src/services/addon.service', () => ({
  default: {
    getTenantAddons: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../src/services/plan-features.service', () => ({
  default: {
    checkPlanLimit: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

describe('User Service Unit Tests', () => {
  const tenantId = 'tenant-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get users with pagination', async () => {
    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user-1',
        name: 'User 1',
        email: 'user1@example.com',
        role: 'ADMIN_TENANT',
        isActive: true,
        defaultPassword: 'encrypted-password',
      },
    ]);
    (prisma.user.count as any).mockResolvedValue(1);

    const result = await userService.getUsers(tenantId, 1, 10);

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });

  it('should get user by ID', async () => {
    (prisma.user.findFirst as any).mockResolvedValue({
      id: 'user-1',
      name: 'User 1',
      email: 'user1@example.com',
      role: 'ADMIN_TENANT',
      isActive: true,
      defaultPassword: 'encrypted-password',
    });

    const user = await userService.getUserById('user-1', tenantId);

    expect(user).toBeDefined();
    expect(user?.email).toBe('user1@example.com');
  });

  it('should create user', async () => {
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-2',
      name: 'New User',
      email: 'newuser@example.com',
      role: 'CASHIER',
      isActive: true,
      tenantId,
    });

    const user = await userService.createUser({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'Password123!',
      role: 'CASHIER',
    }, tenantId);

    expect(user).toBeDefined();
    expect(user.email).toBe('newuser@example.com');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should update user', async () => {
    (prisma.user.findFirst as any).mockResolvedValue({
      id: 'user-1',
      tenantId,
    });
    (prisma.user.update as any).mockResolvedValue({
      id: 'user-1',
      name: 'Updated User',
      email: 'user1@example.com',
      role: 'SUPERVISOR',
    });

    const updated = await userService.updateUser('user-1', {
      name: 'Updated User',
      role: 'SUPERVISOR',
    }, tenantId, 'SUPER_ADMIN');

    expect(updated.name).toBe('Updated User');
    expect(updated.role).toBe('SUPERVISOR');
  });
});
