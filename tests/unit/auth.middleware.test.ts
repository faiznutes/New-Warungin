import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard } from '../../src/middlewares/auth';
import jwt from 'jsonwebtoken';
import prisma from '../../src/config/database';

vi.mock('jsonwebtoken');
vi.mock('../../src/config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    outlet: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../src/config/env', () => ({ default: { JWT_SECRET: 'test-secret' } }));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn();
  return res;
};

const mockRequest = (token?: string, overrides: any = {}) => {
  const req: any = {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
    path: '/test',
    method: 'GET',
    ...overrides,
  };
  return req;
};

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject when token role does not match DB role', async () => {
    // Mock JWT to return SUPER_ADMIN in token
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', tenantId: 't1', role: 'SUPER_ADMIN' });

    // Mock DB user to have different role
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', email: 'a@b.com', name: 'Test', isActive: true, role: 'CASHIER', tenantId: 't1', tenant: { id: 't1', isActive: true } });

    const req: any = mockRequest('fake-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: Role mismatch' }));
    expect(next).not.toHaveBeenCalled();
  });
});