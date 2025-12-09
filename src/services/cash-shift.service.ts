/**
 * Cash Shift Service
 * Manajemen uang modal dan rekap fisik kasir
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

export interface CashShiftData {
  id: string;
  tenantId: string;
  kasirId: string;
  shiftStart: Date;
  shiftEnd?: Date | null;
  modalAwal: number;
  uangFisikTutup?: number | null;
  saldoSeharusnya?: number | null;
  selisih?: number | null;
  status: 'open' | 'closed';
  catatan?: string | null;
  totalPenjualan?: number;
  kasir?: {
    id: string;
    name: string;
    email: string;
  };
}

export class CashShiftService {
  /**
   * Buka shift kasir
   */
  async openShift(tenantId: string, kasirId: string, modalAwal: number, catatan?: string): Promise<CashShiftData> {
    // Validasi: tidak boleh ada shift aktif
    const existingShift = await prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId,
        status: 'open',
      },
    });

    if (existingShift) {
      throw new Error('Kasir masih memiliki shift yang belum ditutup. Silakan tutup shift sebelumnya terlebih dahulu.');
    }

    // Validasi modal awal harus > 0
    if (modalAwal <= 0) {
      throw new Error('Modal awal harus lebih besar dari 0');
    }

    // Validasi kasir adalah CASHIER
    const kasir = await prisma.user.findUnique({
      where: { id: kasirId },
    });

    if (!kasir || kasir.role !== 'CASHIER') {
      throw new Error('Hanya kasir yang dapat membuka shift');
    }

    if (kasir.tenantId !== tenantId) {
      throw new Error('Kasir tidak terdaftar di tenant ini');
    }

    const shift = await prisma.cashShift.create({
      data: {
        tenantId,
        kasirId,
        modalAwal: new Prisma.Decimal(modalAwal),
        catatan: catatan || null,
        status: 'open',
        shiftStart: new Date(),
      },
      include: {
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.formatCashShift(shift);
  }

  /**
   * Tutup shift kasir
   */
  async closeShift(
    tenantId: string,
    kasirId: string,
    uangFisikTutup: number,
    catatan?: string
  ): Promise<CashShiftData> {
    // Cari shift aktif
    const shift = await prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId,
        status: 'open',
      },
    });

    if (!shift) {
      throw new Error('Tidak ada shift aktif yang ditemukan');
    }

    // Hitung total penjualan dari transaksi di shift ini
    const totalPenjualan = await this.calculateTotalSales(tenantId, kasirId, shift.shiftStart, new Date());

    // Hitung saldo seharusnya
    const modalAwal = parseFloat(shift.modalAwal.toString());
    const saldoSeharusnya = modalAwal + totalPenjualan;

    // Hitung selisih
    const selisih = uangFisikTutup - saldoSeharusnya;

    // Update shift
    const updatedShift = await prisma.cashShift.update({
      where: { id: shift.id },
      data: {
        shiftEnd: new Date(),
        uangFisikTutup: new Prisma.Decimal(uangFisikTutup),
        saldoSeharusnya: new Prisma.Decimal(saldoSeharusnya),
        selisih: new Prisma.Decimal(selisih),
        status: 'closed',
        catatan: catatan || shift.catatan,
      },
      include: {
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.formatCashShift(updatedShift, totalPenjualan);
  }

  /**
   * Get shift aktif kasir
   */
  async getCurrentShift(tenantId: string, kasirId: string): Promise<CashShiftData | null> {
    const shift = await prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId,
        status: 'open',
      },
      include: {
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        shiftStart: 'desc',
      },
    });

    if (!shift) {
      return null;
    }

    // Hitung total penjualan
    const totalPenjualan = await this.calculateTotalSales(tenantId, kasirId, shift.shiftStart, new Date());

    return this.formatCashShift(shift, totalPenjualan);
  }

  /**
   * Get riwayat shift kasir
   */
  async getShiftHistory(
    tenantId: string,
    kasirId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: CashShiftData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (kasirId) {
      where.kasirId = kasirId;
    }

    const [shifts, total] = await Promise.all([
      prisma.cashShift.findMany({
        where,
        include: {
          kasir: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          shiftStart: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.cashShift.count({ where }),
    ]);

    // Hitung total penjualan untuk setiap shift
    const shiftsWithSales = await Promise.all(
      shifts.map(async (shift) => {
        const totalPenjualan = shift.status === 'open'
          ? await this.calculateTotalSales(tenantId, shift.kasirId, shift.shiftStart, new Date())
          : shift.saldoSeharusnya
            ? parseFloat(shift.saldoSeharusnya.toString()) - parseFloat(shift.modalAwal.toString())
            : 0;
        return this.formatCashShift(shift, totalPenjualan);
      })
    );

    return {
      data: shiftsWithSales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Hitung total penjualan dari order yang completed di shift
   * Menggunakan Order.total karena lebih akurat (sudah termasuk discount, dll)
   */
  private async calculateTotalSales(
    tenantId: string,
    kasirId: string,
    shiftStart: Date,
    shiftEnd: Date
  ): Promise<number> {
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        userId: kasirId,
        status: 'COMPLETED',
        createdAt: {
          gte: shiftStart,
          lte: shiftEnd,
        },
      },
      select: {
        total: true,
      },
    });

    return orders.reduce((sum, order) => {
      return sum + parseFloat(order.total.toString());
    }, 0);
  }

  /**
   * Format cash shift data
   */
  private formatCashShift(shift: any, totalPenjualan?: number): CashShiftData {
    const modalAwal = parseFloat(shift.modalAwal.toString());
    const saldoSeharusnya = shift.saldoSeharusnya
      ? parseFloat(shift.saldoSeharusnya.toString())
      : totalPenjualan
        ? modalAwal + totalPenjualan
        : undefined;

    return {
      id: shift.id,
      tenantId: shift.tenantId,
      kasirId: shift.kasirId,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      modalAwal,
      uangFisikTutup: shift.uangFisikTutup ? parseFloat(shift.uangFisikTutup.toString()) : null,
      saldoSeharusnya,
      selisih: shift.selisih ? parseFloat(shift.selisih.toString()) : null,
      status: shift.status as 'open' | 'closed',
      catatan: shift.catatan,
      totalPenjualan: totalPenjualan || (saldoSeharusnya ? saldoSeharusnya - modalAwal : 0),
      kasir: shift.kasir,
    };
  }

  /**
   * Check apakah kasir punya shift aktif
   */
  async hasActiveShift(tenantId: string, kasirId: string): Promise<boolean> {
    const shift = await prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId,
        status: 'open',
      },
    });

    return !!shift;
  }
}

export default new CashShiftService();
