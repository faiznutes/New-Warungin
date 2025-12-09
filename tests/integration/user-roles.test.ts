/**
 * Integration Tests: User Roles and Permissions
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testPrisma } from '../setup';
import { createTestTenant, createTestUser } from '../helpers/test-helpers';
import userService from '../../src/services/user.service';

describe('User Roles Integration Tests', () => {
  let tenant: any;
  let superAdmin: any;
  let adminTenant: any;
  let supervisor: any;
  let cashier: any;
  let kitchen: any;

  beforeAll(async () => {
    tenant = await createTestTenant({
      name: 'Roles Test Tenant',
      email: 'rolestest@warungin.com',
      slug: 'roles-test-tenant',
    });

    // Create users with different roles
    superAdmin = await createTestUser({
      tenantId: tenant.id,
      email: 'superadmin@example.com',
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
    });

    adminTenant = await createTestUser({
      tenantId: tenant.id,
      email: 'admintenant@example.com',
      role: 'ADMIN_TENANT',
      name: 'Admin Tenant',
    });

    supervisor = await createTestUser({
      tenantId: tenant.id,
      email: 'supervisor@example.com',
      role: 'SUPERVISOR',
      name: 'Supervisor',
    });

    cashier = await createTestUser({
      tenantId: tenant.id,
      email: 'cashier@example.com',
      role: 'CASHIER',
      name: 'Cashier',
    });

    kitchen = await createTestUser({
      tenantId: tenant.id,
      email: 'kitchen@example.com',
      role: 'KITCHEN',
      name: 'Kitchen',
    });
  });

  it('should list all users for tenant', async () => {
    const result = await userService.getUsers(tenant.id, 1, 10);
    
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination.total).toBeGreaterThan(0);
    
    // All users should belong to the same tenant
    expect(result.data.every((u: any) => u.tenantId === tenant.id)).toBe(true);
  });

  it('should retrieve user by ID with correct role', async () => {
    const user = await userService.getUserById(adminTenant.id, tenant.id);
    
    expect(user).toBeDefined();
    expect(user?.role).toBe('ADMIN_TENANT');
    expect(user?.email).toBe('admintenant@example.com');
  });

  it('should update user role', async () => {
    const updated = await userService.updateUser(cashier.id, tenant.id, {
      role: 'SUPERVISOR',
    });

    expect(updated.role).toBe('SUPERVISOR');
    
    // Verify in database
    const user = await testPrisma.user.findUnique({
      where: { id: cashier.id },
    });
    expect(user?.role).toBe('SUPERVISOR');
  });

  it('should not allow cross-tenant user access', async () => {
    // Create another tenant
    const tenant2 = await createTestTenant({
      name: 'Tenant 2',
      email: 'tenant2roles@warungin.com',
      slug: 'tenant-2-roles',
    });

    // Try to access tenant1 user from tenant2
    const user = await userService.getUserById(adminTenant.id, tenant2.id);
    expect(user).toBeNull();
  });

  it('should handle user permissions correctly', async () => {
    const updated = await userService.updateUser(supervisor.id, tenant.id, {
      permissions: {
        canEditOrders: true,
        canDeleteOrders: false,
        canViewReports: true,
        canManageProducts: true,
      },
    });

    expect(updated.permissions).toBeDefined();
    expect(updated.permissions?.canEditOrders).toBe(true);
    expect(updated.permissions?.canDeleteOrders).toBe(false);
  });
});
