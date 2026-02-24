import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  GetDailySalesDto,
  GetProductSummaryDto,
  GetCustomerRevenueDto,
  GetShiftSummaryDto,
} from "./dto/report-query.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(period?: string, startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (period) {
      case "daily":
        start.setHours(0, 0, 0, 0);
        return { gte: start, lte: end };
      case "weekly":
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return { gte: start, lte: end };
      case "monthly":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return { gte: start, lte: end };
      default:
        return undefined;
    }
  }

  async getTenantReport(
    tenantId: string,
    query: {
      reportType?: string;
      period?: string;
      startDate?: string;
      endDate?: string;
      includeProducts?: boolean;
    },
  ) {
    const reportType = query.reportType || "sales";
    const createdAt = this.getDateRange(
      query.period,
      query.startDate,
      query.endDate,
    );
    const completedWhere: any = { tenantId, status: "COMPLETED" };
    if (createdAt) completedWhere.createdAt = createdAt;

    if (reportType === "sales") {
      const orders = await this.prisma.order.findMany({
        where: completedWhere,
        orderBy: { createdAt: "asc" },
        include: {
          items: query.includeProducts
            ? {
                include: {
                  product: {
                    select: { id: true, name: true, cost: true },
                  },
                },
              }
            : false,
          storeShift: query.includeProducts
            ? {
                include: {
                  opener: {
                    select: { id: true, name: true },
                  },
                },
              }
            : false,
        },
      });

      const byDateMap = new Map<string, any>();
      let totalRevenue = 0;
      let totalItems = 0;

      for (const order of orders) {
        const date = order.createdAt.toISOString().split("T")[0];
        if (!byDateMap.has(date)) {
          byDateMap.set(date, { date, revenue: 0, count: 0, orders: [] });
        }

        const entry = byDateMap.get(date);
        const total = Number(order.total || 0);
        entry.revenue += total;
        entry.count += 1;
        totalRevenue += total;

        if (query.includeProducts) {
          const itemCount = (order.items || []).reduce(
            (sum, i) => sum + Number(i.quantity || 0),
            0,
          );
          totalItems += itemCount;
          entry.orders.push(order);
        }
      }

      const byDate = Array.from(byDateMap.values());
      const totalOrders = orders.length;

      return {
        summary: {
          totalRevenue,
          totalOrders,
          totalItems,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        byDate,
      };
    }

    if (reportType === "financial") {
      const orders = await this.prisma.order.findMany({
        where: completedWhere,
        orderBy: { createdAt: "asc" },
        include: {
          items: {
            select: {
              quantity: true,
              price: true,
              cost: true,
            },
          },
        },
      });

      const byDateMap = new Map<string, any>();
      let revenue = 0;
      let costOfGoods = 0;

      for (const order of orders) {
        const date = order.createdAt.toISOString().split("T")[0];
        const orderRevenue = Number(order.total || 0);
        const orderCost = (order.items || []).reduce(
          (sum, item) =>
            sum + Number(item.cost || 0) * Number(item.quantity || 0),
          0,
        );
        const grossProfit = orderRevenue - orderCost;

        if (!byDateMap.has(date)) {
          byDateMap.set(date, {
            date,
            revenue: 0,
            costOfGoods: 0,
            grossProfit: 0,
            profitMargin: 0,
          });
        }

        const entry = byDateMap.get(date);
        entry.revenue += orderRevenue;
        entry.costOfGoods += orderCost;
        entry.grossProfit += grossProfit;

        revenue += orderRevenue;
        costOfGoods += orderCost;
      }

      const byDate = Array.from(byDateMap.values()).map((row) => ({
        ...row,
        profitMargin:
          row.revenue > 0 ? (row.grossProfit / row.revenue) * 100 : 0,
      }));
      const grossProfit = revenue - costOfGoods;
      const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

      return {
        revenue,
        costOfGoods,
        grossProfit,
        profitMargin,
        byDate,
      };
    }

    if (reportType === "product") {
      const groups = await this.prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: completedWhere },
        _sum: { quantity: true, subtotal: true },
      });

      const products = await this.prisma.product.findMany({
        where: {
          tenantId,
          id: { in: groups.map((g) => g.productId) },
        },
        select: {
          id: true,
          name: true,
          category: true,
          stock: true,
          minStock: true,
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      return {
        products: groups.map((g) => {
          const p = productMap.get(g.productId);
          const stockLevel = Number(p?.stock || 0);
          const minStock = Number(p?.minStock || 0);
          return {
            product: {
              id: p?.id,
              name: p?.name || "Unknown",
              category: p?.category || "",
            },
            totalSold: Number(g._sum.quantity || 0),
            totalRevenue: Number(g._sum.subtotal || 0),
            stockLevel,
            isLowStock: stockLevel <= minStock,
          };
        }),
      };
    }

    if (reportType === "customers") {
      const orders = await this.prisma.order.findMany({
        where: completedWhere,
        select: {
          customerId: true,
          memberId: true,
          total: true,
        },
      });

      const customerIds = Array.from(
        new Set(orders.map((o) => o.customerId).filter(Boolean)),
      ) as string[];
      const memberIds = Array.from(
        new Set(orders.map((o) => o.memberId).filter(Boolean)),
      ) as string[];

      const [customers, members] = await Promise.all([
        this.prisma.customer.findMany({
          where: { tenantId, id: { in: customerIds } },
          select: { id: true, name: true, email: true, phone: true },
        }),
        this.prisma.member.findMany({
          where: { tenantId, id: { in: memberIds } },
          select: { id: true, name: true, email: true, phone: true },
        }),
      ]);

      const customerMap = new Map(customers.map((c) => [c.id, c]));
      const memberMap = new Map(members.map((m) => [m.id, m]));

      const rollup = new Map<
        string,
        { totalSpent: number; totalOrders: number }
      >();
      for (const o of orders) {
        const key = o.customerId
          ? `customer:${o.customerId}`
          : o.memberId
            ? `member:${o.memberId}`
            : null;
        if (!key) continue;
        if (!rollup.has(key)) {
          rollup.set(key, { totalSpent: 0, totalOrders: 0 });
        }
        const r = rollup.get(key)!;
        r.totalSpent += Number(o.total || 0);
        r.totalOrders += 1;
      }

      const customerRows = Array.from(rollup.entries())
        .filter(([key]) => key.startsWith("customer:"))
        .map(([key, value]) => {
          const id = key.replace("customer:", "");
          const customer = customerMap.get(id);
          return {
            customer,
            totalSpent: value.totalSpent,
            totalOrders: value.totalOrders,
            averageOrder:
              value.totalOrders > 0 ? value.totalSpent / value.totalOrders : 0,
          };
        });

      const memberRows = Array.from(rollup.entries())
        .filter(([key]) => key.startsWith("member:"))
        .map(([key, value]) => {
          const id = key.replace("member:", "");
          const member = memberMap.get(id);
          return {
            member,
            totalSpent: value.totalSpent,
            totalOrders: value.totalOrders,
            averageOrder:
              value.totalOrders > 0 ? value.totalSpent / value.totalOrders : 0,
          };
        });

      return {
        customers: customerRows,
        members: memberRows,
      };
    }

    if (reportType === "inventory") {
      const products = await this.prisma.product.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          stock: true,
          minStock: true,
          cost: true,
          price: true,
        },
      });

      const sold = await this.prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: completedWhere },
        _sum: { quantity: true },
      });
      const soldMap = new Map(
        sold.map((s) => [s.productId, Number(s._sum.quantity || 0)]),
      );

      return {
        inventory: products.map((p) => {
          const currentStock = Number(p.stock || 0);
          const minStock = Number(p.minStock || 0);
          const unitValue = Number(p.cost || p.price || 0);
          return {
            product: {
              id: p.id,
              name: p.name,
              category: p.category,
            },
            currentStock,
            minStock,
            stockValue: currentStock * unitValue,
            totalSold: soldMap.get(p.id) || 0,
            isLowStock: currentStock <= minStock,
          };
        }),
      };
    }

    return { byDate: [], summary: {} };
  }

  async getDailySales(tenantId: string, query: GetDailySalesDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 30, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      status: { in: ["COMPLETED", "CANCELLED"] },
    };

    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    if (query.outletId) {
      where.outletId = query.outletId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        outletId: true,
        status: true,
        total: true,
        subtotal: true,
        discount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const dailyMap = new Map<string, any>();
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const outletKey = order.outletId || "default";
      const key = `${dateKey}-${outletKey}`;

      if (!dailyMap.has(key)) {
        dailyMap.set(key, {
          sales_date: dateKey,
          outlet_id: outletKey,
          order_count: 0,
          completed_orders: 0,
          gross_sales: 0,
          total_discount: 0,
          net_sales: 0,
        });
      }

      const entry = dailyMap.get(key);
      entry.order_count++;
      if (order.status === "COMPLETED") {
        entry.completed_orders++;
        entry.gross_sales += Number(order.subtotal || 0);
        entry.total_discount += Number(order.discount || 0);
        entry.net_sales += Number(order.total || 0);
      }
    }

    const data = Array.from(dailyMap.values())
      .sort((a: any, b: any) => b.sales_date.localeCompare(a.sales_date))
      .slice(skip, skip + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total: dailyMap.size,
        totalPages: Math.ceil(dailyMap.size / limit),
      },
    };
  }

  async getProductSummary(tenantId: string, query: GetProductSummaryDto) {
    const limit = Math.min(query.limit || 50, 100);

    const where: any = {
      order: {
        tenantId,
        status: "COMPLETED",
      },
    };

    if (query.startDate && query.endDate) {
      where.order.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const orderItems = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where,
      _sum: { quantity: true, subtotal: true },
      orderBy: {
        _sum: { subtotal: "desc" },
      },
      take: limit,
    });

    if (orderItems.length === 0) {
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      };
    }

    const productIds = orderItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, sku: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const data = orderItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        product_id: item.productId,
        product_name: product?.name || "Unknown",
        category: product?.category || "",
        sku: product?.sku || "",
        quantity_sold: item._sum.quantity || 0,
        revenue: Number(item._sum.subtotal || 0),
      };
    });

    return {
      data,
      pagination: { page: 1, limit, total: data.length, totalPages: 1 },
    };
  }

  async getCustomerRevenue(tenantId: string, query: GetCustomerRevenueDto) {
    const limit = Math.min(query.limit || 20, 100);
    const sortBy = query.sortBy || "total";

    const where: any = {
      tenantId,
      status: "COMPLETED",
    };

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        customerId: true,
        total: true,
      },
      take: 1000,
    });

    const customerMap = new Map<
      string,
      { customerId: string; totalRevenue: number; orderCount: number }
    >();
    for (const order of orders) {
      if (!order.customerId) continue;

      if (!customerMap.has(order.customerId)) {
        customerMap.set(order.customerId, {
          customerId: order.customerId,
          totalRevenue: 0,
          orderCount: 0,
        });
      }

      const entry = customerMap.get(order.customerId)!;
      entry.totalRevenue += Number(order.total || 0);
      entry.orderCount++;
    }

    const data = Array.from(customerMap.values())
      .sort((a, b) =>
        sortBy === "orderCount"
          ? b.orderCount - a.orderCount
          : b.totalRevenue - a.totalRevenue,
      )
      .slice(0, limit);

    return {
      data,
      pagination: { page: 1, limit, total: data.length, totalPages: 1 },
    };
  }

  async getShiftSummary(tenantId: string, query: GetShiftSummaryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.startDate && query.endDate) {
      where.openedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const [shifts, total] = await Promise.all([
      this.prisma.storeShift.findMany({
        where,
        orderBy: { openedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.storeShift.count({ where }),
    ]);

    return {
      data: shifts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSummaryDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenue, activeShifts, totalProducts] =
      await Promise.all([
        this.prisma.order.count({
          where: { tenantId, createdAt: { gte: today } },
        }),
        this.prisma.order.aggregate({
          where: { tenantId, createdAt: { gte: today }, status: "COMPLETED" },
          _sum: { total: true },
        }),
        this.prisma.storeShift.count({ where: { tenantId, status: "open" } }),
        this.prisma.product.count({ where: { tenantId, isActive: true } }),
      ]);

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      activeShifts,
      totalProducts,
    };
  }

  async getRevenueTrend(tenantId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, total: true },
    });

    const dailyRevenue: Record<string, number> = {};
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      dailyRevenue[dateKey] =
        (dailyRevenue[dateKey] || 0) + Number(order.total || 0);
    }

    const data = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { data };
  }
}
