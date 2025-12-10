/**
 * Store Shift Service
 * Manajemen shift global per store (buka toko)
 * Shift type: pagi, siang, sore, malam
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

export interface StoreShiftData {
  id: string;
  tenantId: string;
  outletId: string;
  shiftType: string; // pagi, siang, sore, malam
  openedBy: string;
  openedAt: Date;
  closedAt?: Date | null;
  status: 'open' | 'closed';
  modalAwal?: number | null;
  catatan?: string | null;
  opener?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  outlet?: {
    id: string;
    name: string;
  };
}

export interface CreateStoreShiftInput {
  outletId: string;
  shiftType: string; // pagi, siang, sore, malam
  modalAwal?: number;
  catatan?: string;
}

class StoreShiftService {
  /**
   * Get current open shift for a store
   */
  async getCurrentShift(tenantId: string, outletId: string): Promise<StoreShiftData | null> {
    try {
      const shift = await prisma.storeShift.findFirst({
        where: {
          tenantId,
          outletId,
          status: 'open',
        },
        include: {
          opener: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          openedAt: 'desc',
        },
      });

      if (!shift) {
        return null;
      }

      return this.formatStoreShift(shift);
    } catch (error: any) {
      logger.error('Error getting current shift:', error);
      throw error;
    }
  }

  /**
   * Get all open shifts for a tenant (across all stores)
   */
  async getOpenShifts(tenantId: string, outletId?: string): Promise<StoreShiftData[]> {
    try {
      const where: any = {
        tenantId,
        status: 'open',
      };

      if (outletId) {
        where.outletId = outletId;
      }

      const shifts = await prisma.storeShift.findMany({
        where,
        include: {
          opener: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          openedAt: 'desc',
        },
      });

      return shifts.map(shift => this.formatStoreShift(shift));
    } catch (error: any) {
      logger.error('Error getting open shifts:', error);
      throw error;
    }
  }

  /**
   * Open a new shift for a store
   */
  async openShift(
    tenantId: string,
    userId: string,
    data: CreateStoreShiftInput
  ): Promise<StoreShiftData> {
    try {
      // Validate shift type
      const validShiftTypes = ['pagi', 'siang', 'sore', 'malam'];
      if (!validShiftTypes.includes(data.shiftType)) {
        throw new Error(`Shift type harus salah satu dari: ${validShiftTypes.join(', ')}`);
      }

      // Check if there's already an open shift for this store and shift type
      const existingShift = await prisma.storeShift.findFirst({
        where: {
          tenantId,
          outletId: data.outletId,
          shiftType: data.shiftType,
          status: 'open',
        },
      });

      if (existingShift) {
        throw new Error(`Shift ${data.shiftType} untuk store ini masih terbuka. Silakan tutup shift sebelumnya terlebih dahulu.`);
      }

      // Verify outlet exists and is active
      const outlet = await prisma.outlet.findFirst({
        where: {
          id: data.outletId,
          tenantId,
          isActive: true,
        },
      });

      if (!outlet) {
        throw new Error('Store tidak ditemukan atau tidak aktif');
      }

      // Create shift
      const shift = await prisma.storeShift.create({
        data: {
          tenantId,
          outletId: data.outletId,
          shiftType: data.shiftType,
          openedBy: userId,
          modalAwal: data.modalAwal ? new Prisma.Decimal(data.modalAwal) : null,
          catatan: data.catatan || null,
          status: 'open',
          openedAt: new Date(),
        },
        include: {
          opener: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return this.formatStoreShift(shift);
    } catch (error: any) {
      logger.error('Error opening shift:', error);
      throw error;
    }
  }

  /**
   * Close a shift
   */
  async closeShift(
    tenantId: string,
    outletId: string,
    shiftId: string,
    userId: string
  ): Promise<StoreShiftData> {
    try {
      // Find the shift
      const shift = await prisma.storeShift.findFirst({
        where: {
          id: shiftId,
          tenantId,
          outletId,
          status: 'open',
        },
      });

      if (!shift) {
        throw new Error('Shift tidak ditemukan atau sudah ditutup');
      }

      // Close the shift
      const closedShift = await prisma.storeShift.update({
        where: { id: shiftId },
        data: {
          status: 'closed',
          closedAt: new Date(),
        },
        include: {
          opener: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return this.formatStoreShift(closedShift);
    } catch (error: any) {
      logger.error('Error closing shift:', error);
      throw error;
    }
  }

  /**
   * Get shift history
   */
  async getShiftHistory(
    tenantId: string,
    outletId?: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {
        tenantId,
      };

      if (outletId) {
        where.outletId = outletId;
      }

      const [shifts, total] = await Promise.all([
        prisma.storeShift.findMany({
          where,
          skip,
          take: limit,
          include: {
            opener: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            outlet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            openedAt: 'desc',
          },
        }),
        prisma.storeShift.count({ where }),
      ]);

      return {
        data: shifts.map(shift => this.formatStoreShift(shift)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error getting shift history:', error);
      throw error;
    }
  }

  /**
   * Get active users in a shift (for kitchen/dapur)
   */
  async getActiveUsersInShift(tenantId: string, outletId: string, shiftId?: string): Promise<any[]> {
    try {
      // If shiftId provided, get users from that shift
      // Otherwise, get users from current open shift
      let shift;
      if (shiftId) {
        shift = await prisma.storeShift.findUnique({
          where: { id: shiftId },
        });
      } else {
        shift = await prisma.storeShift.findFirst({
          where: {
            tenantId,
            outletId,
            status: 'open',
          },
        });
      }

      if (!shift) {
        return [];
      }

      // Get all users who have orders in this shift
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          outletId,
          storeShiftId: shift.id,
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        distinct: ['userId'],
      });

      // Get unique users
      const uniqueUsers = new Map();
      orders.forEach(order => {
        if (order.user && !uniqueUsers.has(order.user.id)) {
          uniqueUsers.set(order.user.id, order.user);
        }
      });

      return Array.from(uniqueUsers.values());
    } catch (error: any) {
      logger.error('Error getting active users in shift:', error);
      throw error;
    }
  }

  /**
   * Format store shift data
   */
  private formatStoreShift(shift: any): StoreShiftData {
    return {
      id: shift.id,
      tenantId: shift.tenantId,
      outletId: shift.outletId,
      shiftType: shift.shiftType,
      openedBy: shift.openedBy,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      status: shift.status as 'open' | 'closed',
      modalAwal: shift.modalAwal ? Number(shift.modalAwal) : null,
      catatan: shift.catatan,
      opener: shift.opener,
      outlet: shift.outlet,
    };
  }
}

export default new StoreShiftService();

