
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requireShift } from '../../src/middlewares/shift-guard';
import storeShiftService from '../../src/services/store-shift.service';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
vi.mock('../../src/services/store-shift.service');
vi.mock('../../src/utils/logger', () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('Shift Guard Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            user: {
                id: 'user-1',
                role: 'CASHIER',
                tenantId: 'tenant-1',
            },
            headers: {},
            permissions: { assignedStoreId: 'outlet-1' }, // Legacy location
        } as any;

        // Fix for requireTenantId which might look at req.user.tenantId or req.headers
        (req as any).tenantId = 'tenant-1';

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            setHeader: vi.fn(),
        };
        next = vi.fn() as any;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should allow SUPERVISOR to bypass shift check', async () => {
        (req as any).user.role = 'SUPERVISOR';

        await requireShift(req as any, res as any, next);

        expect(next).toHaveBeenCalled();
        expect(storeShiftService.getCurrentShift).not.toHaveBeenCalled();
    });

    it('should allow ADMIN_TENANT to bypass shift check', async () => {
        (req as any).user.role = 'ADMIN_TENANT';

        await requireShift(req as any, res as any, next);

        expect(next).toHaveBeenCalled();
        expect(storeShiftService.getCurrentShift).not.toHaveBeenCalled();
    });

    it('should block CASHIER if no shift is open', async () => {
        (req as any).user.role = 'CASHIER';
        (req as any).user.assignedStoreId = 'outlet-1';

        // Mock no open shift
        vi.mocked(storeShiftService.getCurrentShift).mockResolvedValue(null);

        await requireShift(req as any, res as any, next);

        expect(storeShiftService.getCurrentShift).toHaveBeenCalledWith('tenant-1', 'outlet-1');
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'SHIFT_REQUIRED',
            redirectTo: '/app/cashier/cash-shift'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should allow CASHIER if shift IS open', async () => {
        (req as any).user.role = 'CASHIER';
        (req as any).user.assignedStoreId = 'outlet-1';

        const mockShift = { id: 'shift-123', status: 'open' };
        vi.mocked(storeShiftService.getCurrentShift).mockResolvedValue(mockShift as any);

        await requireShift(req as any, res as any, next);

        expect(next).toHaveBeenCalled();
        expect((req as any).currentShift).toEqual(mockShift);
        expect((req as any).storeShiftId).toBe('shift-123');
    });

    it('should allow KITCHEN if no shift is open BUT with warning header', async () => {
        (req as any).user.role = 'KITCHEN';
        (req as any).user.assignedStoreId = 'outlet-1';

        vi.mocked(storeShiftService.getCurrentShift).mockResolvedValue(null);

        await requireShift(req as any, res as any, next);

        expect(next).toHaveBeenCalled(); // Allowed
        expect(res.setHeader).toHaveBeenCalledWith('X-Shift-Warning', expect.stringContaining('Shift belum dibuka'));
    });

    it('should allow if user has no assigned store', async () => {
        (req as any).user.role = 'CASHIER';
        (req as any).user.assignedStoreId = undefined;
        (req as any).assignedStoreId = undefined; // Check both locations

        await requireShift(req as any, res as any, next);

        expect(next).toHaveBeenCalled();
        expect(storeShiftService.getCurrentShift).not.toHaveBeenCalled();
    });
});
