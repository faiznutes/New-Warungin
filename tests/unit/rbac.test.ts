import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleGuard } from '../../src/middlewares/auth';
import { supervisorStoreGuard } from '../../src/middlewares/supervisor-store-guard';
import { requireTenantId } from '../../src/utils/tenant';

describe('RBAC & Security', () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
        req = {
            headers: {},
            user: {
                id: 'user-1',
                role: 'USER',
                permissions: {},
            },
            role: 'USER',
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            setHeader: vi.fn(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    describe('roleGuard', () => {
        it('should allow user with required role', () => {
            req.role = 'ADMIN_TENANT';
            const middleware = roleGuard('ADMIN_TENANT', 'SUPER_ADMIN');
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should block user without required role', () => {
            req.role = 'CASHIER';
            const middleware = roleGuard('ADMIN_TENANT', 'SUPER_ADMIN');
            middleware(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Forbidden: Insufficient permissions',
            }));
        });

        it('should block request with no role', () => {
            req.role = undefined;
            const middleware = roleGuard('ADMIN_TENANT');
            middleware(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('supervisorStoreGuard', () => {
        it('should bypass for valid NON-SUPERVISOR roles (e.g. ADMIN_TENANT)', async () => {
            req.role = 'ADMIN_TENANT';
            const middleware = supervisorStoreGuard();
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow SUPERVISOR with access to requested store', async () => {
            req.role = 'SUPERVISOR';
            req.query = { storeId: 'store-1' };
            req.user.permissions = { allowedStoreIds: ['store-1', 'store-2'] };

            const middleware = supervisorStoreGuard();
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should block SUPERVISOR accessing unauthorized store', async () => {
            req.role = 'SUPERVISOR';
            req.query = { storeId: 'store-3' }; // Not in allowed list
            req.user.permissions = { allowedStoreIds: ['store-1', 'store-2'] };

            const middleware = supervisorStoreGuard();
            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                code: 'STORE_ACCESS_DENIED',
            }));
        });

        it('should block SUPERVISOR if permissions are missing', async () => {
            req.role = 'SUPERVISOR';
            req.query = { storeId: 'store-1' };
            req.user.permissions = {}; // Empty permissions

            const middleware = supervisorStoreGuard();
            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('requireTenantId', () => {
        it('should return tenantId if present in user', () => {
            req.user.tenantId = 'tenant-1';
            expect(requireTenantId(req)).toBe('tenant-1');
        });

        it('should throw if tenantId is missing for normal user', () => {
            req.user.tenantId = undefined;
            req.user.role = 'CASHIER';
            expect(() => requireTenantId(req)).toThrow('Tenant ID is required');
        });

        it('should allow SUPER_ADMIN to supply tenantId via query param', () => {
            req.user.role = 'SUPER_ADMIN';
            req.query = { tenantId: 'tenant-target' };
            expect(requireTenantId(req)).toBe('tenant-target');
        });

        it('should throw if SUPER_ADMIN does not supply tenantId', () => {
            req.user.role = 'SUPER_ADMIN';
            req.query = {};
            expect(() => requireTenantId(req)).toThrow('Tenant ID is required');
        });
    });
});
