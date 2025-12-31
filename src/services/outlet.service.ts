import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

export interface CreateOutletInput {
  name: string;
  address?: string;
  phone?: string;
  shiftConfig?: Array<{ name: string; startTime: string; endTime: string }>;
  operatingHours?: Record<string, { open?: string; close?: string; isOpen: boolean }>;
}

export interface UpdateOutletInput {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  shiftConfig?: Array<{ name: string; startTime: string; endTime: string }>;
  operatingHours?: Record<string, { open?: string; close?: string; isOpen: boolean }>;
}

/**
 * Validation utilities for outlet data
 */
const OutletValidation = {
  /**
   * Validate outlet name
   */
  validateName(name: any): string {
    if (!name || typeof name !== 'string') {
      throw new Error('Nama outlet harus berupa teks');
    }
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      throw new Error('Nama outlet minimal 3 karakter');
    }
    if (trimmed.length > 100) {
      throw new Error('Nama outlet maksimal 100 karakter');
    }
    return trimmed;
  },

  /**
   * Validate phone number
   */
  validatePhone(phone: any): string | undefined {
    if (!phone) return undefined;
    if (typeof phone !== 'string') {
      throw new Error('Nomor telepon harus berupa teks');
    }
    const trimmed = phone.trim();
    if (trimmed.length > 20) {
      throw new Error('Nomor telepon maksimal 20 karakter');
    }
    if (!/^[\d\s\-\+\(\)]+$/.test(trimmed)) {
      throw new Error('Nomor telepon mengandung karakter tidak valid');
    }
    return trimmed;
  },

  /**
   * Validate address
   */
  validateAddress(address: any): string | undefined {
    if (!address) return undefined;
    if (typeof address !== 'string') {
      throw new Error('Alamat harus berupa teks');
    }
    const trimmed = address.trim();
    if (trimmed.length > 500) {
      throw new Error('Alamat maksimal 500 karakter');
    }
    return trimmed;
  },

  /**
   * Validate shift configuration
   */
  validateShiftConfig(config: any): Array<{ name: string; startTime: string; endTime: string }> | undefined {
    if (!config) return undefined;
    if (!Array.isArray(config)) {
      throw new Error('Konfigurasi shift harus berupa array');
    }
    if (config.length > 24) {
      throw new Error('Maksimal 24 shift per hari');
    }

    return config.map((shift, index) => {
      if (!shift.name || typeof shift.name !== 'string') {
        throw new Error(`Shift ${index + 1}: nama shift harus berupa teks`);
      }
      if (shift.name.length < 2 || shift.name.length > 50) {
        throw new Error(`Shift ${index + 1}: nama shift harus 2-50 karakter`);
      }
      if (!shift.startTime || !/^\d{2}:\d{2}$/.test(shift.startTime)) {
        throw new Error(`Shift ${index + 1}: jam mulai harus format HH:MM`);
      }
      if (!shift.endTime || !/^\d{2}:\d{2}$/.test(shift.endTime)) {
        throw new Error(`Shift ${index + 1}: jam selesai harus format HH:MM`);
      }

      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const [endHour, endMin] = shift.endTime.split(':').map(Number);
      
      if (startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59) {
        throw new Error(`Shift ${index + 1}: jam mulai tidak valid`);
      }
      if (endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59) {
        throw new Error(`Shift ${index + 1}: jam selesai tidak valid`);
      }

      return {
        name: shift.name.trim(),
        startTime: shift.startTime,
        endTime: shift.endTime,
      };
    });
  },

  /**
   * Validate operating hours
   */
  validateOperatingHours(hours: any): Record<string, { open?: string; close?: string; isOpen: boolean }> | undefined {
    if (!hours) return undefined;
    if (typeof hours !== 'object' || Array.isArray(hours)) {
      throw new Error('Jam operasional harus berupa objek');
    }

    const validDays = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    const result: Record<string, { open?: string; close?: string; isOpen: boolean }> = {};

    for (const [day, times] of Object.entries(hours)) {
      if (!validDays.includes(day.toLowerCase())) {
        throw new Error(`Hari tidak valid: ${day}. Gunakan: senin, selasa, rabu, kamis, jumat, sabtu, minggu`);
      }

      const dayTimes = times as any;
      if (!dayTimes || typeof dayTimes !== 'object') {
        throw new Error(`Data untuk hari ${day} harus berupa objek`);
      }

      const isOpen = dayTimes.isOpen === true || dayTimes.isOpen === false ? dayTimes.isOpen : true;

      if (isOpen) {
        if (!dayTimes.open || !/^\d{2}:\d{2}$/.test(dayTimes.open)) {
          throw new Error(`${day}: jam buka harus format HH:MM`);
        }
        if (!dayTimes.close || !/^\d{2}:\d{2}$/.test(dayTimes.close)) {
          throw new Error(`${day}: jam tutup harus format HH:MM`);
        }

        const [openHour, openMin] = dayTimes.open.split(':').map(Number);
        const [closeHour, closeMin] = dayTimes.close.split(':').map(Number);

        if (openHour < 0 || openHour > 23 || openMin < 0 || openMin > 59) {
          throw new Error(`${day}: jam buka tidak valid`);
        }
        if (closeHour < 0 || closeHour > 23 || closeMin < 0 || closeMin > 59) {
          throw new Error(`${day}: jam tutup tidak valid`);
        }
      }

      result[day.toLowerCase()] = {
        open: isOpen ? dayTimes.open : undefined,
        close: isOpen ? dayTimes.close : undefined,
        isOpen,
      };
    }

    return result;
  },
};

export class OutletService {
  /**
   * Get paginated list of outlets for a tenant
   * @param tenantId - Tenant identifier
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   * @param userRole - User role for permission checking
   * @param userPermissions - User permissions object
   * @returns Paginated outlets list
   */
  async getOutlets(tenantId: string, page: number = 1, limit: number = 50, userRole?: string, userPermissions?: any) {
    try {
      const skip = (page - 1) * limit;

      // Filter by allowedStoreIds for SUPERVISOR role
      let whereFilter: any = { tenantId };
      if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
        const allowedStoreIds = userPermissions.allowedStoreIds;
        if (allowedStoreIds.length > 0) {
          whereFilter.id = { in: allowedStoreIds };
        } else {
          // No stores assigned, return empty
          return {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          };
        }
      }

      const [outlets, total] = await Promise.all([
        prisma.outlet.findMany({
          where: whereFilter,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.outlet.count({ where: whereFilter }),
      ]);

      return {
        data: outlets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error fetching outlets', { error: error.message, tenantId });
      throw new Error('Gagal mengambil data outlet');
    }
  }

  /**
   * Get a single outlet by ID
   * @param tenantId - Tenant identifier
   * @param outletId - Outlet identifier
   * @returns Outlet data
   */
  async getOutlet(tenantId: string, outletId: string) {
    try {
      const outlet = await prisma.outlet.findFirst({
        where: {
          id: outletId,
          tenantId,
        },
      });
      if (!outlet) {
        throw new Error('Outlet tidak ditemukan');
      }
      return outlet;
    } catch (error: any) {
      logger.error('Error fetching outlet', { error: error.message, outletId });
      throw error;
    }
  }

  /**
   * Create a new outlet
   * @param tenantId - Tenant identifier
   * @param data - Outlet data
   * @returns Created outlet
   */
  async createOutlet(tenantId: string, data: CreateOutletInput) {
    try {
      // Validate input
      const validatedData = {
        tenantId,
        name: OutletValidation.validateName(data.name),
        address: OutletValidation.validateAddress(data.address),
        phone: OutletValidation.validatePhone(data.phone),
        shiftConfig: OutletValidation.validateShiftConfig(data.shiftConfig),
        operatingHours: OutletValidation.validateOperatingHours(data.operatingHours),
      };

      const outlet = await prisma.outlet.create({
        data: validatedData as any,
      });

      logger.info('Outlet created successfully', { outletId: outlet.id, tenantId });
      await this.invalidateAnalyticsCache(tenantId);

      return outlet;
    } catch (error: any) {
      logger.error('Error creating outlet', { error: error.message, tenantId });
      throw error;
    }
  }

  /**
   * Update an outlet
   * @param tenantId - Tenant identifier
   * @param outletId - Outlet identifier
   * @param data - Updated outlet data
   * @param userRole - User role for permission checking
   * @param userPermissions - User permissions object
   * @returns Updated outlet
   */
  async updateOutlet(
    tenantId: string,
    outletId: string,
    data: UpdateOutletInput,
    userRole?: string,
    userPermissions?: any
  ) {
    try {
      // Check if user is SUPERVISOR and trying to edit outlet they don't have access to
      if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
        const allowedStoreIds = userPermissions.allowedStoreIds;
        if (!allowedStoreIds.includes(outletId)) {
          throw new Error('Anda tidak memiliki akses untuk mengedit outlet ini');
        }
      }

      await this.getOutlet(tenantId, outletId);

      // Validate input
      const validatedData: any = {};
      if (data.name !== undefined) validatedData.name = OutletValidation.validateName(data.name);
      if (data.address !== undefined) validatedData.address = OutletValidation.validateAddress(data.address);
      if (data.phone !== undefined) validatedData.phone = OutletValidation.validatePhone(data.phone);
      if (data.isActive !== undefined) validatedData.isActive = typeof data.isActive === 'boolean' ? data.isActive : true;
      if (data.shiftConfig !== undefined) validatedData.shiftConfig = OutletValidation.validateShiftConfig(data.shiftConfig);
      if (data.operatingHours !== undefined) validatedData.operatingHours = OutletValidation.validateOperatingHours(data.operatingHours);

      const updated = await prisma.outlet.update({
        where: { id: outletId },
        data: validatedData,
      });

      logger.info('Outlet updated successfully', { outletId, tenantId });
      await this.invalidateAnalyticsCache(tenantId);

      return updated;
    } catch (error: any) {
      logger.error('Error updating outlet', { error: error.message, outletId });
      throw error;
    }
  }

  /**
   * Delete an outlet (soft or hard delete depending on orders)
   * @param tenantId - Tenant identifier
   * @param outletId - Outlet identifier
   * @returns Deleted/deactivated outlet
   */
  async deleteOutlet(tenantId: string, outletId: string) {
    try {
      const outlet = await this.getOutlet(tenantId, outletId);

      // Check if outlet has orders
      const orderCount = await prisma.order.count({
        where: { outletId },
      });

      let result;
      if (orderCount > 0) {
        // Soft delete: set isActive to false
        result = await prisma.outlet.update({
          where: { id: outletId },
          data: { isActive: false },
        });
        logger.info('Outlet soft deleted', { outletId, reason: 'has orders', orderCount });
      } else {
        // Hard delete if no orders
        result = await prisma.outlet.delete({
          where: { id: outletId },
        });
        logger.info('Outlet hard deleted', { outletId });
      }

      await this.invalidateAnalyticsCache(tenantId);
      return result;
    } catch (error: any) {
      logger.error('Error deleting outlet', { error: error.message, outletId });
      throw error;
    }
  }

  /**
   * Invalidate analytics cache for a tenant
   */
  private async invalidateAnalyticsCache(tenantId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis) {
        const keys = await redis.keys(`analytics:*:${tenantId}`);
        const keys2 = await redis.keys(`analytics:${tenantId}:*`);
        const allKeys = [...keys, ...keys2];
        if (allKeys.length > 0) {
          await redis.del(...allKeys);
          logger.info('Invalidated analytics cache', {
            tenantId,
            cacheKeysDeleted: allKeys.length,
          });
        }
      }
    } catch (error: any) {
      logger.warn('Failed to invalidate analytics cache', {
        error: error.message,
        tenantId,
      });
    }
  }
}

export default new OutletService();
