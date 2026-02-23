import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetOrdersDto } from "./dto/get-orders.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { parsePagination } from "../../common/utils/pagination.util";

const VALID_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${datePart}-${timePart}-${randPart}`;
  }

  private validateTenantId(tenantId: string | null | undefined): string {
    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }
    return tenantId;
  }

  async getOrders(tenantId: string, query: GetOrdersDto) {
    this.validateTenantId(tenantId);

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where: { tenantId } }),
    ]);

    return {
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrderById(id: string, tenantId: string) {
    this.validateTenantId(tenantId);

    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async createOrder(dto: CreateOrderDto, tenantId: string, userId: string) {
    this.validateTenantId(tenantId);

    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true },
    });

    if (!user) {
      throw new ForbiddenException("User not found in tenant context");
    }

    if (!dto.items?.length) {
      throw new BadRequestException("Order items are required");
    }

    const idempotencyKey = (dto as any).idempotencyKey as string | undefined;

    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, tenantId, isActive: true },
      select: { id: true, price: true, stock: true, cost: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("Some products are invalid or inactive");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const requestedQty = new Map<string, number>();
    for (const item of dto.items) {
      requestedQty.set(
        item.productId,
        (requestedQty.get(item.productId) || 0) + Number(item.quantity),
      );
    }

    for (const [productId, qty] of requestedQty.entries()) {
      const product = productMap.get(productId);
      if (!product) {
        throw new BadRequestException(`Product ${productId} not found`);
      }
      if (product.stock < qty) {
        throw new BadRequestException(
          `Insufficient stock for product ${productId}`,
        );
      }
    }

    const orderItemsData = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const snapshotPrice = Number(product.price);
      const quantity = Number(item.quantity);
      const subtotal = snapshotPrice * quantity;
      const unitCost = product.cost ? Number(product.cost) : null;
      const profit = unitCost !== null ? (snapshotPrice - unitCost) * quantity : null;

      return {
        productId: item.productId,
        quantity,
        price: snapshotPrice,
        subtotal,
        cost: unitCost,
        profit,
      };
    });

    const subtotal = orderItemsData.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = Math.max(0, Math.min(Number(dto.discount || 0), subtotal));
    const total = Math.max(0, subtotal - discount);

    // Use atomic transaction to ensure idempotency check + order creation is atomic
    const order = await this.prisma.$transaction(async (tx) => {
      // Check idempotency key if provided to prevent duplicate orders
      // This check is now inside transaction to prevent race conditions
      if (idempotencyKey) {
        const existingOrder = await tx.order.findFirst({
          where: { idempotencyKey, tenantId },
        });
        if (existingOrder) {
          return existingOrder;
        }
      }

      const orderNumber = this.generateOrderNumber();

      // Create new order with idempotency key (unique constraint will prevent duplicates)
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tenantId,
          userId,
          customerId: dto.customerId || null,
          memberId: dto.memberId || null,
          outletId: dto.outletId || null,
          temporaryCustomerName: dto.temporaryCustomerName || null,
          subtotal,
          discount,
          total,
          status: "PENDING",
          sendToKitchen: Boolean(dto.sendToKitchen),
          kitchenStatus: dto.sendToKitchen ? "PENDING" : null,
          notes: dto.notes || null,
          idempotencyKey: idempotencyKey || null,
        },
      });

      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          cost: item.cost,
          profit: item.profit,
        })),
      });

      for (const [productId, qty] of requestedQty.entries()) {
        const stockResult = await tx.product.updateMany({
          where: {
            id: productId,
            tenantId,
            stock: { gte: qty },
          },
          data: { stock: { decrement: qty } },
        });

        if (stockResult.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${productId}`,
          );
        }
      }

      return newOrder;
    });

    return order;
  }

  async updateOrder(id: string, dto: any, tenantId: string) {
    const order = await this.getOrderById(id, tenantId);

    // Validate status if provided - prevent mass assignment
    if (dto.status && !VALID_ORDER_STATUSES.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Valid values: ${VALID_ORDER_STATUSES.join(", ")}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes && { notes: dto.notes }),
      } as any,
    });

    return updated;
  }

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    tenantId: string,
  ) {
    const order = await this.getOrderById(id, tenantId);

    // Validate status - prevent mass assignment
    if (!VALID_ORDER_STATUSES.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Valid values: ${VALID_ORDER_STATUSES.join(", ")}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
    });

    return updated;
  }

  async getOrderStats(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [totalOrders, revenueData, completedOrders, pendingOrders] =
      await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.aggregate({
          where: { ...where, status: "COMPLETED" },
          _sum: { total: true },
        }),
        this.prisma.order.count({ where: { ...where, status: "COMPLETED" } }),
        this.prisma.order.count({ where: { ...where, status: "PENDING" } }),
      ]);

    const totalRevenue = revenueData._sum.total
      ? Number(revenueData._sum.total)
      : 0;

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      averageOrderValue:
        completedOrders > 0 ? totalRevenue / completedOrders : 0,
    };
  }

  async updateKitchenStatus(
    id: string,
    status: "PENDING" | "COOKING" | "READY" | "SERVED",
    tenantId: string,
  ) {
    const order = await this.getOrderById(id, tenantId);

    if (!order.sendToKitchen) {
      throw new BadRequestException("Order is not sent to kitchen");
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { kitchenStatus: status },
    });

    return updated;
  }

  async confirmOrder(id: string, tenantId: string) {
    const order = await this.getOrderById(id, tenantId);

    if (order.status !== "PENDING") {
      throw new BadRequestException("Only pending orders can be confirmed");
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    return updated;
  }

  async cancelOrder(id: string, tenantId: string) {
    // Use atomic transaction with proper tenant isolation
    const result = await this.prisma.$transaction(async (tx) => {
      // Fetch order with tenant isolation
      const order = await tx.order.findFirst({
        where: { id, tenantId },
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      // Prevent double cancel - check if already cancelled
      if (order.status === "CANCELLED") {
        throw new BadRequestException("Order is already cancelled");
      }

      // Only PENDING and PROCESSING orders can be cancelled
      if (order.status !== "PENDING" && order.status !== "PROCESSING") {
        throw new BadRequestException(
          `Cannot cancel order with status: ${order.status}. Only PENDING or PROCESSING orders can be cancelled.`,
        );
      }

      // Fetch order items within the same transaction
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
      });

      // Restore stock for each item (if stock was decremented)
      // Only restore if order was not cancelled before
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return { message: "Order cancelled successfully", orderId: id };
    });

    return result;
  }

  async completeOrder(id: string, tenantId: string) {
    const order = await this.getOrderById(id, tenantId);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return updated;
  }

  async addItems(id: string, items: any[], tenantId: string) {
    // Use atomic transaction to ensure items and total are updated together
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, tenantId },
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.status !== "PENDING") {
        throw new BadRequestException("Can only add items to pending orders");
      }

      // Fetch current product prices to ensure price consistency
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, tenantId },
        select: { id: true, price: true },
      });

      const productPriceMap = new Map(
        products.map((p) => [p.id, Number(p.price)]),
      );

      // Create order items with current product prices (snapshot)
      const orderItems = await tx.orderItem.createMany({
        data: items.map((item) => {
          const currentPrice =
            productPriceMap.get(item.productId) || item.price;
          return {
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            price: currentPrice,
            subtotal: currentPrice * item.quantity,
          };
        }),
      });

      const totalIncrease = items.reduce((sum, item) => {
        const currentPrice = productPriceMap.get(item.productId) || item.price;
        return sum + currentPrice * item.quantity;
      }, 0);

      await tx.order.update({
        where: { id },
        data: { total: { increment: totalIncrease } },
      });

      return { message: "Items added successfully", count: orderItems.count };
    });
  }

  async bulkUpdateKitchen(
    orderIds: string[],
    status: "PENDING" | "COOKING" | "READY" | "SERVED",
    tenantId: string,
  ) {
    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
        tenantId,
        sendToKitchen: true,
      },
    });

    if (orders.length !== orderIds.length) {
      throw new BadRequestException(
        "Some orders not found or not sent to kitchen",
      );
    }

    await this.prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        tenantId,
        sendToKitchen: true,
      },
      data: { kitchenStatus: status },
    });

    return { message: "Kitchen status updated", count: orderIds.length };
  }

  async bulkRefund(orderIds: string[], tenantId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
        tenantId,
        status: "COMPLETED",
      },
    });

    if (orders.length !== orderIds.length) {
      throw new BadRequestException(
        "Some orders not found or not eligible for refund",
      );
    }

    await this.prisma.order.updateMany({
      where: { id: { in: orderIds }, tenantId },
      data: { status: "REFUNDED" as any },
    });

    return { message: "Orders refunded", count: orderIds.length };
  }

  async bulkDelete(orderIds: string[], tenantId: string) {
    await this.prisma.order.updateMany({
      where: { id: { in: orderIds }, tenantId },
      data: { status: "CANCELLED" as any },
    });

    return { message: "Orders deleted", count: orderIds.length };
  }

  async deleteOrder(id: string, tenantId: string) {
    const order = await this.getOrderById(id, tenantId);

    await this.prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" as any },
    });

    return { message: "Order deleted successfully" };
  }

  async searchOrders(tenantId: string, query: string) {
    return this.prisma.order.findMany({
      where: {
        tenantId,
        OR: [
          { id: { contains: query } },
          { orderNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
  }

  async getOrdersByStatus(tenantId: string, status: string) {
    return this.prisma.order.findMany({
      where: { tenantId, status: status as any },
      take: 50,
    });
  }

  async batchUpdateStatus(
    tenantId: string,
    orderIds: string[],
    status: string,
  ) {
    await this.prisma.order.updateMany({
      where: { id: { in: orderIds }, tenantId },
      data: { status: status as any },
    });

    return { message: "Orders updated", count: orderIds.length };
  }
}
