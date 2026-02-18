import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTenantId(tenantId: string | null | undefined): string {
    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }
    return tenantId;
  }

  async getDashboardSummary(tenantId: string) {
    this.validateTenantId(tenantId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProducts,
      totalCustomers,
      totalMembers,
      todayOrders,
      todayRevenue,
      lowStockProducts,
      pendingOrders,
    ] = await Promise.all([
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.member.count({ where: { tenantId, isActive: true } }),
      this.prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: today, lt: tomorrow },
          status: { in: ["COMPLETED", "PROCESSING"] },
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          tenantId,
          createdAt: { gte: today, lt: tomorrow },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),
      this.prisma.product.count({
        where: {
          tenantId,
          isActive: true,
          minStock: { gt: 0 },
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId,
          status: "PENDING",
        },
      }),
    ]);

    return {
      totalProducts,
      totalCustomers,
      totalMembers,
      todayOrders,
      todayRevenue: todayRevenue._sum.amount || 0,
      lowStockProducts,
      pendingOrders,
    };
  }

  async getRecentOrders(tenantId: string, limit: number = 10) {
    this.validateTenantId(tenantId);

    return this.prisma.order.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        user: {
          select: { name: true },
        },
      },
    });
  }

  async getTopProducts(tenantId: string, limit: number = 10) {
    this.validateTenantId(tenantId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ["COMPLETED", "PROCESSING"] },
        },
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });

    const productSales: { [key: string]: { name: string; quantity: number } } =
      {};

    for (const item of orderItems) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.product.name,
          quantity: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
    }

    return Object.entries(productSales)
      .map(([id, data]) => ({ productId: id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async getDashboardStats(
    tenantId: string | null,
    startDate?: Date,
    endDate?: Date,
    includeMetrics?: boolean,
    outletId?: string,
  ) {
    if (!tenantId) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        totalTransactions: 0,
      };
    }

    const start = startDate || new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate || new Date();
    end.setHours(23, 59, 59, 999);

    const outletFilter = outletId ? { outletId } : {};

    const where = {
      tenantId,
      createdAt: { gte: start, lte: end },
      ...outletFilter,
    };

    const [totalOrders, completedOrders, pendingOrders, cancelledOrders] =
      await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.count({
          where: { ...where, status: "COMPLETED" },
        }),
        this.prisma.order.count({
          where: { ...where, status: "PENDING" },
        }),
        this.prisma.order.count({
          where: { ...where, status: "CANCELLED" },
        }),
      ]);

    const revenueResult = await this.prisma.order.aggregate({
      where: { ...where, status: "COMPLETED" },
      _sum: { total: true },
    });

    const transactionResult = await this.prisma.transaction.aggregate({
      where: { ...where, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const totalRevenue = Number(revenueResult._sum.total || 0);
    const totalTransactions = Number(transactionResult._sum.amount || 0);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      totalTransactions,
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    };
  }

  async getCashierStats(
    tenantId: string,
    userId: string,
    assignedStoreId?: string,
  ) {
    this.validateTenantId(tenantId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const outletFilter = assignedStoreId ? { outletId: assignedStoreId } : {};

    const [todayOrders, todayRevenue, recentTransactions] = await Promise.all([
      this.prisma.order.count({
        where: {
          tenantId,
          userId,
          createdAt: { gte: today },
          ...outletFilter,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          tenantId,
          userId,
          status: "COMPLETED",
          createdAt: { gte: today },
          ...outletFilter,
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        where: {
          tenantId,
          userId,
          ...outletFilter,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      recentTransactions,
    };
  }

  async getKitchenStats(tenantId: string, assignedStoreId?: string) {
    this.validateTenantId(tenantId);

    const outletFilter = assignedStoreId ? { outletId: assignedStoreId } : {};

    const [pendingOrders, cookingOrders, readyOrders] = await Promise.all([
      this.prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: "PENDING",
          ...outletFilter,
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: "COOKING",
          ...outletFilter,
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: "READY",
          ...outletFilter,
        },
      }),
    ]);

    return {
      pendingOrders,
      cookingOrders,
      readyOrders,
      totalOrders: pendingOrders + cookingOrders + readyOrders,
    };
  }
}
