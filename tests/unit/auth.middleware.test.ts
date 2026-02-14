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
  res.headersSent = false;
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

// Reusable DB user factory
const makeDbUser = (overrides: any = {}) => ({
  id: 'user-1',
  email: 'a@b.com',
  name: 'Test',
  isActive: true,
  role: 'ADMIN_TENANT',
  tenantId: 't1',
  permissions: {},
  tenant: { id: 't1', isActive: true },
  ...overrides,
});

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Positive path ---
  it('should pass and set req.role to DB role when token is valid and roles match', async () => {
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', tenantId: 't1', role: 'ADMIN_TENANT' });
    (prisma.user.findUnique as any).mockResolvedValue(makeDbUser());

    const req: any = mockRequest('valid-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    // CRITICAL: req.role must come from DB, not JWT
    expect(req.role).toBe('ADMIN_TENANT');
    expect(req.user.role).toBe('ADMIN_TENANT');
    expect(req.userId).toBe('user-1');
    expect(req.tenantId).toBe('t1');
  });

  // --- Missing token ---
  it('should return 401 when no token is provided', async () => {
    const req: any = mockRequest(); // no token
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: No token provided' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- Expired token ---
  it('should return 401 with specific message for expired token', async () => {
    const expiredError = new Error('jwt expired');
    (expiredError as any).name = 'TokenExpiredError';
    (jwt.verify as any).mockImplementation(() => { throw expiredError; });

    const req: any = mockRequest('expired-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: Token expired' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- Invalid token ---
  it('should return 401 for malformed/invalid token', async () => {
    const jwtError = new Error('invalid signature');
    (jwtError as any).name = 'JsonWebTokenError';
    (jwt.verify as any).mockImplementation(() => { throw jwtError; });

    const req: any = mockRequest('bad-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: Invalid token' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- Role mismatch (privilege escalation attempt) ---
  it('should reject when token role does not match DB role', async () => {
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', tenantId: 't1', role: 'SUPER_ADMIN' });
    (prisma.user.findUnique as any).mockResolvedValue(makeDbUser({ role: 'CASHIER' }));

    const req: any = mockRequest('fake-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: Role mismatch' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- User not found ---
  it('should return 401 when user does not exist in DB', async () => {
    (jwt.verify as any).mockReturnValue({ userId: 'deleted-user', tenantId: 't1', role: 'CASHIER' });
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const req: any = mockRequest('valid-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: User not found' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- Inactive user ---
  it('should return 401 when user is inactive', async () => {
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', tenantId: 't1', role: 'CASHIER' });
    (prisma.user.findUnique as any).mockResolvedValue(makeDbUser({ role: 'CASHIER', isActive: false }));

    const req: any = mockRequest('valid-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized: User account is inactive' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- Inactive tenant ---
  it('should return 403 when tenant is inactive', async () => {
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', tenantId: 't1', role: 'ADMIN_TENANT' });
    (prisma.user.findUnique as any).mockResolvedValue(makeDbUser({
      tenant: { id: 't1', isActive: false },
    }));

    const req: any = mockRequest('valid-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Forbidden: Tenant is inactive' }));
    expect(next).not.toHaveBeenCalled();
  });

  // --- Database error ---
  it('should return 503 on database connection error', async () => {
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', tenantId: 't1', role: 'ADMIN_TENANT' });
    const dbError = new Error('Can\'t reach database server');
    (dbError as any).code = 'P1001';
    (prisma.user.findUnique as any).mockRejectedValue(dbError);

    const req: any = mockRequest('valid-token');
    const res: any = mockResponse();
    const next = vi.fn();

    await authGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
  });
});