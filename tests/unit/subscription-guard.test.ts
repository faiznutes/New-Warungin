import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscriptionGuard } from '../../src/middlewares/subscription-guard';
import prisma from '../../src/config/database';
import * as userStatusService from '../../src/services/user-status.service';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
    default: {
        tenant: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        subscription: {
            findFirst: vi.fn(),
        },
    },
}));

vi.mock('../../src/services/user-status.service', () => ({
    updateUserStatusBasedOnSubscription: vi.fn(),
    getTotalRemainingSubscriptionTime: vi.fn(),
}));

describe('Subscription Guard', () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
        req = {
            role: 'CASHIER',
            tenantId: 'tenant-1',
            user: { id: 'user-1' },
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    it('should bypass check for ADMIN_TENANT', async () => {
        req.role = 'ADMIN_TENANT';
        await subscriptionGuard(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should block if tenantId is missing', async () => {
        req.tenantId = undefined;
        await subscriptionGuard(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'TENANT_ID_MISSING' }));
    });

    it('should block if tenant is inactive', async () => {
        (prisma.tenant.findUnique as any).mockResolvedValue({
            id: 'tenant-1',
            isActive: false,
        });

        await subscriptionGuard(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'TENANT_INACTIVE' }));
    });

    it('should block if subscription is expired', async () => {
        (prisma.tenant.findUnique as any).mockResolvedValue({
            id: 'tenant-1',
            isActive: true,
            subscriptionPlan: 'PRO',
        });

        // Mock expired date (yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        (userStatusService.getTotalRemainingSubscriptionTime as any).mockResolvedValue(yesterday);

        await subscriptionGuard(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'SUBSCRIPTION_EXPIRED' }));
    });

    it('should allow if subscription is active', async () => {
        (prisma.tenant.findUnique as any).mockResolvedValue({
            id: 'tenant-1',
            isActive: true,
            subscriptionPlan: 'PRO',
        });

        // Mock future date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        (userStatusService.getTotalRemainingSubscriptionTime as any).mockResolvedValue(tomorrow);

        await subscriptionGuard(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
