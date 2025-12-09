/**
 * Integration Tests: Authentication
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testPrisma } from '../setup';
import { createTestTenant, createTestUser } from '../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import { login } from '../../src/services/auth.service';

describe('Authentication Integration Tests', () => {
  let testTenant: any;
  let testUser: any;

  beforeAll(async () => {
    // Create test tenant
    testTenant = await createTestTenant({
      name: 'Auth Test Tenant',
      email: 'authtest@warungin.com',
      slug: 'auth-test-tenant',
    });

    // Create test user
    testUser = await createTestUser({
      tenantId: testTenant.id,
      email: 'testuser@example.com',
      password: 'Test123!',
      role: 'ADMIN_TENANT',
      name: 'Test User',
    });
  });

  it('should login successfully with correct credentials', async () => {
    const result = await login({
      email: 'testuser@example.com',
      password: 'Test123!',
    });

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe('testuser@example.com');
    expect(result.user.role).toBe('ADMIN_TENANT');
  });

  it('should fail login with incorrect password', async () => {
    await expect(
      login({
        email: 'testuser@example.com',
        password: 'WrongPassword123!',
      })
    ).rejects.toThrow();
  });

  it('should fail login with non-existent email', async () => {
    await expect(
      login({
        email: 'nonexistent@example.com',
        password: 'Test123!',
      })
    ).rejects.toThrow();
  });

  it('should fail login with inactive user', async () => {
    // Create inactive user
    const inactiveUser = await createTestUser({
      tenantId: testTenant.id,
      email: 'inactive@example.com',
      password: 'Test123!',
      role: 'CASHIER',
    });

    // Deactivate user
    await testPrisma.user.update({
      where: { id: inactiveUser.id },
      data: { isActive: false },
    });

    await expect(
      login({
        email: 'inactive@example.com',
        password: 'Test123!',
      })
    ).rejects.toThrow('tidak aktif');
  });
});
