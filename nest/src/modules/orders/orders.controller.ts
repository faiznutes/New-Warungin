import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { GetOrdersDto } from "./dto/get-orders.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("orders")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@TenantId() tenantId: string, @Query() query: GetOrdersDto) {
    return this.ordersService.getOrders(tenantId, query);
  }

  @Get("stats/summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getOrderStats(
    @TenantId() tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.ordersService.getOrderStats(tenantId, startDate, endDate);
  }

  @Get(":id")
  async getOrderById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.ordersService.getOrderById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async createOrder(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(dto, tenantId, user.id);
  }

  @Put(":id/status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async updateOrderStatus(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body("status") status: string,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      { status } as any,
      tenantId,
    );
  }

  @Put(":id/kitchen-status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async updateKitchenStatus(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body("status") status: "PENDING" | "COOKING" | "READY" | "SERVED",
  ) {
    return this.ordersService.updateKitchenStatus(id, status, tenantId);
  }

  @Put(":id/confirm")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async confirmOrder(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.ordersService.confirmOrder(id, tenantId);
  }

  @Put(":id/cancel")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async cancelOrder(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.ordersService.cancelOrder(id, tenantId);
  }

  @Put(":id/complete")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async completeOrder(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.ordersService.completeOrder(id, tenantId);
  }

  @Post(":id/items")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async addItems(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body("items") items: any[],
  ) {
    return this.ordersService.addItems(id, items, tenantId);
  }

  @Put("bulk-update-kitchen")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "KITCHEN")
  async bulkUpdateKitchen(
    @TenantId() tenantId: string,
    @Body()
    body: {
      orderIds: string[];
      status: "PENDING" | "COOKING" | "READY" | "SERVED";
    },
  ) {
    return this.ordersService.bulkUpdateKitchen(
      body.orderIds,
      body.status,
      tenantId,
    );
  }

  @Post("bulk-refund")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async bulkRefund(
    @TenantId() tenantId: string,
    @Body() body: { orderIds: string[] },
  ) {
    return this.ordersService.bulkRefund(body.orderIds, tenantId);
  }

  @Post("bulk-delete")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async bulkDelete(
    @TenantId() tenantId: string,
    @Body() body: { orderIds: string[] },
  ) {
    return this.ordersService.bulkDelete(body.orderIds, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async updateOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: any,
  ) {
    return this.ordersService.updateOrder(id, dto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async deleteOrder(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.ordersService.deleteOrder(id, tenantId);
  }

  @Get("search")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async searchOrders(@TenantId() tenantId: string, @Query("q") query: string) {
    return this.ordersService.searchOrders(tenantId, query);
  }

  @Get("by-status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getOrdersByStatus(
    @TenantId() tenantId: string,
    @Query("status") status: string,
  ) {
    return this.ordersService.getOrdersByStatus(tenantId, status);
  }

  @Post("batch-status")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async batchUpdateStatus(
    @TenantId() tenantId: string,
    @Body() body: { orderIds: string[]; status: string },
  ) {
    return this.ordersService.batchUpdateStatus(
      tenantId,
      body.orderIds,
      body.status,
    );
  }
}
