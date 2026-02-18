import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactions(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const { page, limit, skip } = parsePagination(
      query.page || 1,
      query.limit || 20,
    );

    let where: any = { tenantId };

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate + "T23:59:59.999Z"),
      };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { order: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(id: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.tenantId !== tenantId) {
      throw new NotFoundException("Transaction not found");
    }

    return transaction;
  }

  async createTransaction(
    data: {
      orderId: string;
      amount: number;
      paymentMethod: string;
      status?: string;
      reference?: string;
      qrCode?: string;
      qrCodeImage?: string;
      notes?: string;
      servedBy?: string;
    },
    userId: string,
    tenantId: string,
  ) {
    const {
      orderId,
      amount,
      paymentMethod,
      status,
      reference,
      qrCode,
      qrCodeImage,
      notes,
      servedBy,
    } = data;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.tenantId !== tenantId) {
      throw new NotFoundException("Order not found");
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        orderId,
        userId,
        amount: Number(amount),
        paymentMethod: paymentMethod as any,
        status: (status || "PENDING") as any,
        reference,
        qrCode,
        qrCodeImage,
        notes,
        servedBy,
      },
    });

    return transaction;
  }
}
