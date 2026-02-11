/**
 * Unit Tests: Auth Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../src/services/auth.service';
import prisma from '../../src/config/database';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock('../../src/utils/jwt', () => ({
  generateToken: vi.fn(() => 'mock-jwt-token'),
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
}));

vi.mock('../../src/utils/refresh-token', () => ({
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
  setTokenFamily: vi.fn(),
}));

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN_TENANT',
        name: 'Test User',
        isActive: true,
        tenant: {
          id: 'tenant-1',
          isActive: true,
        },
      },
    ]);

    const result = await login({
      email: 'test@example.com',
      password: 'Test123!',
    });

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw error for invalid password', async () => {
    const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);

    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN_TENANT',
        name: 'Test User',
        isActive: true,
        tenant: {
          id: 'tenant-1',
          isActive: true,
        },
      },
    ]);

    await expect(
      login({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      })
    ).rejects.toThrow();
  });

  it('should throw error for inactive user', async () => {
    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user-1',
        email: 'test@example.com',
        password: await bcrypt.hash('Test123!', 10),
        role: 'ADMIN_TENANT',
        name: 'Test User',
        isActive: false, // Inactive
        tenant: {
          id: 'tenant-1',
          isActive: true,
        },
      },
    ]);

    await expect(
      login({
        email: 'test@example.com',
        password: 'Test123!',
      })
    ).rejects.toThrow('tidak aktif');
  });
});
