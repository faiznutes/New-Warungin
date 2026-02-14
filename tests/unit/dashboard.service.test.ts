import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import prisma from '../../src/config/database';
import dashboardService from '../../src/services/dashboard.service';
import CacheService from '../../src/utils/cache';

// Mock Prisma
vi.mock('../../src/config/database', () => ({
    default: {
        $queryRaw: vi.fn(),
        order: {
            count: vi.fn(),
            aggregate: vi.fn(),
            findMany: vi.fn(),
            groupBy: vi.fn(),
        },
        product: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
        customer: {
            count: vi.fn(),
        },
        member: {
            count: vi.fn(),
        },
        orderItem: {
            groupBy: vi.fn(),
        },
    },
}));

// Mock CacheService
vi.mock('../../src/utils/cache', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

describe('Dashboard Service', () => {
    const tenantId = 'tenant-123';
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getSalesChartData', () => {
        it('should return sales data with missing dates filled', async () => {
            // Mock raw query response
            const mockSalesData = [
                { date: '2023-01-01', total: 1000, count: 2 },
                { date: '2023-01-03', total: 500, count: 1 },
            ];
            (prisma.$queryRaw as any).mockResolvedValue(mockSalesData);

            // Call service
            // Test a small range: Jan 1 to Jan 3 (3 days)
            const testStart = new Date('2023-01-01');
            const testEnd = new Date('2023-01-03');
            const result = await dashboardService.getSalesChartData(tenantId, testStart, testEnd);

            expect(prisma.$queryRaw).toHaveBeenCalled();

            // Should have 3 entries (Jan 1, Jan 2, Jan 3)
            expect(result).toHaveLength(3);

            // Jan 1: Data exists
            expect(result[0]).toEqual({
                date: '2023-01-01',
                total: 1000,
                count: 2,
            });

            // Jan 2: Missing data, should be 0
            expect(result[1]).toEqual({
                date: '2023-01-02',
                total: 0,
                count: 0,
            });

            // Jan 3: Data exists
            expect(result[2]).toEqual({
                date: '2023-01-03',
                total: 500,
                count: 1,
            });
        });

        it('should use default 30 days if no dates provided', async () => {
            (prisma.$queryRaw as any).mockResolvedValue([]);
            await dashboardService.getSalesChartData(tenantId);

            // Check if query was called
            expect(prisma.$queryRaw).toHaveBeenCalled();

            // Only checking call, not logic (since dates vary)
        });
    });

    describe('getDashboardStats', () => {
        it('should return stats from database when cache miss', async () => {
            // Mock Cache Miss
            (CacheService.get as any).mockResolvedValue(null);

            // Mock DB responses
            (prisma.order.count as any).mockResolvedValue(10); // Total orders
            (prisma.order.aggregate as any).mockResolvedValue({ _sum: { total: 10000 } }); // Revenue
            (prisma.product.count as any).mockResolvedValue(5);
            (prisma.customer.count as any).mockResolvedValue(2);
            (prisma.member.count as any).mockResolvedValue(1);
            (prisma.product.findMany as any).mockResolvedValue([]); // Low stock & Top Product details
            (prisma.order.findMany as any).mockResolvedValue([]); // Recent orders
            (prisma.order.groupBy as any).mockResolvedValue([]); // Sales by status
            (prisma.orderItem.groupBy as any).mockResolvedValue([]); // Top products
            (prisma.$queryRaw as any).mockResolvedValue([]); // Sales chart

            const result = await dashboardService.getDashboardStats(tenantId, startDate, endDate, true);

            expect(CacheService.get).toHaveBeenCalled();
            expect(prisma.order.count).toHaveBeenCalled();
            expect(result.overview.totalOrders).toBe(10);
            expect(result.charts.salesOverTime).toBeDefined(); // Check for new field

            // Should set cache
            expect(CacheService.set).toHaveBeenCalled();
        });

        it('should return cached data if available', async () => {
            const cachedData = { overview: { totalOrders: 99 } };
            (CacheService.get as any).mockResolvedValue(cachedData);

            const result = await dashboardService.getDashboardStats(tenantId, startDate, endDate, true);

            expect(prisma.order.count).not.toHaveBeenCalled();
            expect(result).toEqual(cachedData);
        });
    });
});
