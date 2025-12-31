import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import OutletService, { CreateOutletInput, UpdateOutletInput } from '../src/services/outlet.service';
import prisma from '../src/config/database';
import { getRedisClient } from '../src/config/redis';
import logger from '../src/utils/logger';

// Mock dependencies
vi.mock('../src/config/database', () => ({
  default: {
    outlet: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    order: {
      count: vi.fn(),
    },
  },
}));

vi.mock('../src/config/redis', () => ({
  getRedisClient: vi.fn(),
}));

vi.mock('../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('OutletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ========================
  // getOutlets Tests
  // ========================
  describe('getOutlets', () => {
    it('should return paginated outlets for a tenant', async () => {
      const mockOutlets = [
        {
          id: '1',
          tenantId: 'tenant1',
          name: 'Outlet 1',
          address: 'Address 1',
          phone: '081234567890',
          isActive: true,
          shiftConfig: [],
          operatingHours: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.outlet.findMany).mockResolvedValue(mockOutlets as any);
      vi.mocked(prisma.outlet.count).mockResolvedValue(1);

      const result = await OutletService.getOutlets('tenant1', 1, 50);

      expect(result.data).toEqual(mockOutlets);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      });
    });

    it('should respect SUPERVISOR role permissions', async () => {
      vi.mocked(prisma.outlet.findMany).mockResolvedValue([]);
      vi.mocked(prisma.outlet.count).mockResolvedValue(0);

      const allowedStoreIds = ['store1', 'store2'];
      await OutletService.getOutlets('tenant1', 1, 50, 'SUPERVISOR', { allowedStoreIds });

      expect(prisma.outlet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant1',
            id: { in: allowedStoreIds },
          }),
        })
      );
    });

    it('should return empty list for SUPERVISOR with no allowed stores', async () => {
      const result = await OutletService.getOutlets('tenant1', 1, 50, 'SUPERVISOR', { allowedStoreIds: [] });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      vi.mocked(prisma.outlet.findMany).mockRejectedValue(error);

      await expect(OutletService.getOutlets('tenant1')).rejects.toThrow('Gagal mengambil data outlet');
      expect(logger.error).toHaveBeenCalledWith('Error fetching outlets', expect.any(Object));
    });
  });

  // ========================
  // getOutlet Tests
  // ========================
  describe('getOutlet', () => {
    it('should return outlet by ID', async () => {
      const mockOutlet = {
        id: '1',
        tenantId: 'tenant1',
        name: 'Outlet 1',
        address: 'Address 1',
        phone: '081234567890',
        isActive: true,
        shiftConfig: [],
        operatingHours: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.outlet.findFirst).mockResolvedValue(mockOutlet as any);

      const result = await OutletService.getOutlet('tenant1', '1');
      expect(result).toEqual(mockOutlet);
    });

    it('should throw error if outlet not found', async () => {
      vi.mocked(prisma.outlet.findFirst).mockResolvedValue(null);

      await expect(OutletService.getOutlet('tenant1', 'invalid')).rejects.toThrow('Outlet tidak ditemukan');
    });
  });

  // ========================
  // createOutlet Tests
  // ========================
  describe('createOutlet', () => {
    it('should create outlet with valid data', async () => {
      const input: CreateOutletInput = {
        name: 'New Outlet',
        address: 'Test Address',
        phone: '081234567890',
        shiftConfig: [
          { name: 'Pagi', startTime: '06:00', endTime: '14:00' },
          { name: 'Sore', startTime: '14:00', endTime: '22:00' },
        ],
        operatingHours: {
          senin: { open: '06:00', close: '22:00', isOpen: true },
          selasa: { open: '06:00', close: '22:00', isOpen: true },
        },
      };

      const mockCreated = {
        id: 'new-outlet-1',
        tenantId: 'tenant1',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.outlet.create).mockResolvedValue(mockCreated as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.createOutlet('tenant1', input);
      expect(result).toEqual(mockCreated);
      expect(logger.info).toHaveBeenCalledWith('Outlet created successfully', expect.any(Object));
    });

    it('should validate name is required and 3-100 chars', async () => {
      const invalidInputs = [
        { name: '' } as CreateOutletInput,
        { name: 'ab' } as CreateOutletInput,
        { name: 'a'.repeat(101) } as CreateOutletInput,
      ];

      for (const input of invalidInputs) {
        await expect(OutletService.createOutlet('tenant1', input)).rejects.toThrow();
      }
    });

    it('should validate phone number format', async () => {
      const input: CreateOutletInput = {
        name: 'Valid Outlet',
        phone: 'invalid@phone',
      };

      await expect(OutletService.createOutlet('tenant1', input)).rejects.toThrow(
        'Nomor telepon mengandung karakter tidak valid'
      );
    });

    it('should validate shift config format', async () => {
      const input: CreateOutletInput = {
        name: 'Valid Outlet',
        shiftConfig: [
          { name: 'Pagi', startTime: 'invalid', endTime: '14:00' },
        ],
      };

      await expect(OutletService.createOutlet('tenant1', input)).rejects.toThrow('format HH:MM');
    });

    it('should validate operating hours day names', async () => {
      const input: CreateOutletInput = {
        name: 'Valid Outlet',
        operatingHours: {
          'invalid-day': { open: '06:00', close: '22:00', isOpen: true },
        },
      };

      await expect(OutletService.createOutlet('tenant1', input)).rejects.toThrow('Hari tidak valid');
    });
  });

  // ========================
  // updateOutlet Tests
  // ========================
  describe('updateOutlet', () => {
    it('should update outlet with valid data', async () => {
      const existingOutlet = {
        id: '1',
        tenantId: 'tenant1',
        name: 'Old Name',
        address: 'Old Address',
        phone: '081234567890',
        isActive: true,
        shiftConfig: [],
        operatingHours: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateInput: UpdateOutletInput = {
        name: 'Updated Outlet',
        address: 'Updated Address',
      };

      const updatedOutlet = {
        ...existingOutlet,
        ...updateInput,
      };

      vi.mocked(prisma.outlet.findFirst).mockResolvedValue(existingOutlet as any);
      vi.mocked(prisma.outlet.update).mockResolvedValue(updatedOutlet as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.updateOutlet('tenant1', '1', updateInput);
      expect(result.name).toBe('Updated Outlet');
      expect(result.address).toBe('Updated Address');
    });

    it('should prevent SUPERVISOR from editing unauthorized outlets', async () => {
      const input: UpdateOutletInput = { name: 'Updated' };
      vi.mocked(prisma.outlet.findFirst).mockResolvedValue({} as any);

      await expect(
        OutletService.updateOutlet('tenant1', 'store2', input, 'SUPERVISOR', { allowedStoreIds: ['store1'] })
      ).rejects.toThrow('tidak memiliki akses');
    });

    it('should handle partial updates', async () => {
      const existingOutlet = {
        id: '1',
        tenantId: 'tenant1',
        name: 'Outlet',
        address: 'Address',
        phone: '081234567890',
        isActive: true,
        shiftConfig: [],
        operatingHours: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.outlet.findFirst).mockResolvedValue(existingOutlet as any);
      vi.mocked(prisma.outlet.update).mockResolvedValue(existingOutlet as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.updateOutlet('tenant1', '1', { isActive: false });
      expect(prisma.outlet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: false }),
        })
      );
    });
  });

  // ========================
  // deleteOutlet Tests
  // ========================
  describe('deleteOutlet', () => {
    it('should soft delete outlet with orders', async () => {
      const existingOutlet = {
        id: '1',
        tenantId: 'tenant1',
        name: 'Outlet',
        address: 'Address',
        phone: '081234567890',
        isActive: true,
        shiftConfig: [],
        operatingHours: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.outlet.findFirst).mockResolvedValue(existingOutlet as any);
      vi.mocked(prisma.order.count).mockResolvedValue(5);
      vi.mocked(prisma.outlet.update).mockResolvedValue({
        ...existingOutlet,
        isActive: false,
      } as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.deleteOutlet('tenant1', '1');
      expect(prisma.outlet.update).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Outlet soft deleted', expect.any(Object));
    });

    it('should hard delete outlet without orders', async () => {
      const existingOutlet = {
        id: '1',
        tenantId: 'tenant1',
        name: 'Outlet',
        address: 'Address',
        phone: '081234567890',
        isActive: true,
        shiftConfig: [],
        operatingHours: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.outlet.findFirst).mockResolvedValue(existingOutlet as any);
      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.outlet.delete).mockResolvedValue(existingOutlet as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      await OutletService.deleteOutlet('tenant1', '1');
      expect(prisma.outlet.delete).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Outlet hard deleted', expect.any(Object));
    });
  });

  // ========================
  // Validation Tests (Detailed)
  // ========================
  describe('Validation - Name', () => {
    it('should reject null/undefined names', async () => {
      await expect(OutletService.createOutlet('tenant1', { name: null } as any)).rejects.toThrow(
        'Nama outlet harus berupa teks'
      );
    });

    it('should trim whitespace from names', async () => {
      vi.mocked(prisma.outlet.create).mockResolvedValue({
        id: '1',
        tenantId: 'tenant1',
        name: 'Test Outlet',
        address: undefined,
        phone: undefined,
        isActive: true,
        shiftConfig: undefined,
        operatingHours: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.createOutlet('tenant1', { name: '  Test Outlet  ' });
      expect(result.name).toBe('Test Outlet');
    });
  });

  describe('Validation - Phone', () => {
    it('should accept valid phone numbers', async () => {
      const validPhones = ['081234567890', '0812 3456 7890', '+62-812-3456-7890', '(0812) 3456-7890'];

      for (const phone of validPhones) {
        vi.mocked(prisma.outlet.create).mockResolvedValue({
          id: '1',
          tenantId: 'tenant1',
          name: 'Test',
          address: undefined,
          phone,
          isActive: true,
          shiftConfig: undefined,
          operatingHours: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

        const result = await OutletService.createOutlet('tenant1', { name: 'Test', phone });
        expect(result.phone).toBe(phone);
      }
    });

    it('should reject phone with invalid characters', async () => {
      await expect(OutletService.createOutlet('tenant1', { name: 'Test', phone: 'abc@def#123' })).rejects.toThrow();
    });

    it('should reject phone longer than 20 chars', async () => {
      await expect(
        OutletService.createOutlet('tenant1', { name: 'Test', phone: '08123456789012345678901' })
      ).rejects.toThrow('maksimal 20 karakter');
    });
  });

  describe('Validation - Address', () => {
    it('should accept valid addresses', async () => {
      vi.mocked(prisma.outlet.create).mockResolvedValue({
        id: '1',
        tenantId: 'tenant1',
        name: 'Test',
        address: 'Jln. Test No. 123',
        phone: undefined,
        isActive: true,
        shiftConfig: undefined,
        operatingHours: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.createOutlet('tenant1', { name: 'Test', address: 'Jln. Test No. 123' });
      expect(result.address).toBe('Jln. Test No. 123');
    });

    it('should reject address longer than 500 chars', async () => {
      const longAddress = 'a'.repeat(501);
      await expect(OutletService.createOutlet('tenant1', { name: 'Test', address: longAddress })).rejects.toThrow(
        'maksimal 500 karakter'
      );
    });
  });

  describe('Validation - Shift Config', () => {
    it('should accept valid shift configuration', async () => {
      const validShiftConfig = [
        { name: 'Pagi', startTime: '06:00', endTime: '14:00' },
        { name: 'Sore', startTime: '14:00', endTime: '22:00' },
        { name: 'Malam', startTime: '22:00', endTime: '06:00' },
      ];

      vi.mocked(prisma.outlet.create).mockResolvedValue({
        id: '1',
        tenantId: 'tenant1',
        name: 'Test',
        address: undefined,
        phone: undefined,
        isActive: true,
        shiftConfig: validShiftConfig,
        operatingHours: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.createOutlet('tenant1', { name: 'Test', shiftConfig: validShiftConfig });
      expect(result.shiftConfig).toEqual(validShiftConfig);
    });

    it('should reject more than 24 shifts', async () => {
      const manyShifts = Array.from({ length: 25 }, (_, i) => ({
        name: `Shift ${i + 1}`,
        startTime: `${String(i).padStart(2, '0')}:00`,
        endTime: `${String((i + 1) % 24).padStart(2, '0')}:00`,
      }));

      await expect(OutletService.createOutlet('tenant1', { name: 'Test', shiftConfig: manyShifts })).rejects.toThrow(
        'Maksimal 24 shift'
      );
    });

    it('should validate time format HH:MM', async () => {
      const invalidShifts = [
        { name: 'Pagi', startTime: '6:00', endTime: '14:00' }, // Missing leading zero
        { name: 'Pagi', startTime: '06:0', endTime: '14:00' }, // Missing minute digit
        { name: 'Pagi', startTime: '25:00', endTime: '14:00' }, // Invalid hour
        { name: 'Pagi', startTime: '06:60', endTime: '14:00' }, // Invalid minute
      ];

      for (const shift of invalidShifts) {
        await expect(OutletService.createOutlet('tenant1', { name: 'Test', shiftConfig: [shift] })).rejects.toThrow();
      }
    });
  });

  describe('Validation - Operating Hours', () => {
    it('should accept valid operating hours', async () => {
      const validHours = {
        senin: { open: '06:00', close: '22:00', isOpen: true },
        selasa: { open: '06:00', close: '22:00', isOpen: true },
        rabu: { open: '06:00', close: '22:00', isOpen: true },
        kamis: { open: '06:00', close: '22:00', isOpen: true },
        jumat: { open: '06:00', close: '22:00', isOpen: true },
        sabtu: { open: '08:00', close: '23:00', isOpen: true },
        minggu: { open: '08:00', close: '23:00', isOpen: true },
      };

      vi.mocked(prisma.outlet.create).mockResolvedValue({
        id: '1',
        tenantId: 'tenant1',
        name: 'Test',
        address: undefined,
        phone: undefined,
        isActive: true,
        shiftConfig: undefined,
        operatingHours: validHours,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      const result = await OutletService.createOutlet('tenant1', { name: 'Test', operatingHours: validHours });
      expect(result.operatingHours).toEqual(validHours);
    });

    it('should reject invalid day names', async () => {
      const invalidHours = {
        'invalid-day': { open: '06:00', close: '22:00', isOpen: true },
      };

      await expect(OutletService.createOutlet('tenant1', { name: 'Test', operatingHours: invalidHours })).rejects.toThrow(
        'Hari tidak valid'
      );
    });

    it('should handle closed days', async () => {
      const hoursWithClosedDay = {
        senin: { isOpen: false },
        selasa: { open: '06:00', close: '22:00', isOpen: true },
      };

      vi.mocked(prisma.outlet.create).mockResolvedValue({
        id: '1',
        tenantId: 'tenant1',
        name: 'Test',
        address: undefined,
        phone: undefined,
        isActive: true,
        shiftConfig: undefined,
        operatingHours: hoursWithClosedDay,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(getRedisClient).mockReturnValue({ del: vi.fn() } as any);

      await OutletService.createOutlet('tenant1', { name: 'Test', operatingHours: hoursWithClosedDay });
      expect(prisma.outlet.create).toHaveBeenCalled();
    });
  });
});
