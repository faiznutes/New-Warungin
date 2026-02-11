import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supervisorStoreGuard, supervisorStoresGuard } from '../../src/middlewares/supervisor-store-guard';
import logger from '../../src/utils/logger';

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn();
  res.headersSent = false;
  return res;
}

describe('supervisorStoreGuard', () => {
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should call next for non-supervisor roles', async () => {
    const req: any = { role: 'ADMIN_TENANT', query: {}, body: {}, params: {}, path: '/test', method: 'GET' };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoreGuard()(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow access when supervisor has allowed store', async () => {
    const req: any = { role: 'SUPERVISOR', query: { storeId: 's1' }, body: {}, params: {}, path: '/orders', method: 'GET', userId: 'u1', permissions: { allowedStoreIds: ['s1'] } };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoreGuard()(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny access when supervisor permissions missing', async () => {
    const req: any = { role: 'SUPERVISOR', query: { storeId: 's1' }, body: {}, params: {}, path: '/orders', method: 'GET', userId: 'u1' };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoreGuard()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny access when allowedStoreIds is empty', async () => {
    const req: any = { role: 'SUPERVISOR', query: { storeId: 's1' }, body: {}, params: {}, path: '/orders', method: 'GET', userId: 'u1', permissions: { allowedStoreIds: [] } };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoreGuard()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny access when requested store not allowed', async () => {
    const req: any = { role: 'SUPERVISOR', query: { storeId: 's2' }, body: {}, params: {}, path: '/orders', method: 'GET', userId: 'u1', permissions: { allowedStoreIds: ['s1'] } };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoreGuard()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});


describe('supervisorStoresGuard', () => {
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should call next for non-supervisor roles', async () => {
    const req: any = { role: 'ADMIN_TENANT', query: {}, body: {}, params: {}, path: '/bulk', method: 'POST' };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoresGuard()(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow bulk when supervisor has allowed stores', async () => {
    const req: any = { role: 'SUPERVISOR', body: { storeIds: ['s1', 's2'] }, path: '/bulk', method: 'POST', userId: 'u1', permissions: { allowedStoreIds: ['s1', 's2', 's3'] } };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoresGuard()(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny bulk when permissions missing', async () => {
    const req: any = { role: 'SUPERVISOR', body: { storeIds: ['s1'] }, path: '/bulk', method: 'POST', userId: 'u1' };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoresGuard()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny bulk when some stores unauthorized', async () => {
    const req: any = { role: 'SUPERVISOR', body: { storeIds: ['s1','s4'] }, path: '/bulk', method: 'POST', userId: 'u1', permissions: { allowedStoreIds: ['s1','s2'] } };
    const res = mockRes();
    const next = vi.fn();

    await supervisorStoresGuard()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.unauthorizedStores).toContain('s4');
    expect(next).not.toHaveBeenCalled();
  });
});
