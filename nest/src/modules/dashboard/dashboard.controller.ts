import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { Request } from "express";

interface AuthRequest extends Request {
  user?: any;
  assignedStoreId?: string;
}

@Controller("dashboard")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getDashboardSummary(@TenantId() tenantId: string) {
    return this.dashboardService.getDashboardSummary(tenantId);
  }

  @Get("recent-orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getRecentOrders(
    @TenantId() tenantId: string,
    @Query("limit") limit: number = 10,
  ) {
    return this.dashboardService.getRecentOrders(tenantId, limit);
  }

  @Get("top-products")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getTopProducts(
    @TenantId() tenantId: string,
    @Query("limit") limit: number = 10,
  ) {
    return this.dashboardService.getTopProducts(tenantId, limit);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getDashboardStats(
    @TenantId() tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Req() req?: AuthRequest,
  ) {
    try {
      const userRole = req?.user?.role;
      const outletId = req?.assignedStoreId || req?.user?.assignedStoreId;

      return this.dashboardService.getDashboardStats(
        tenantId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        true,
        outletId,
      );
    } catch (error) {
      console.error("Dashboard stats error:", error);
      throw error;
    }
  }

  @Get("stats/cashier")
  @Roles("CASHIER")
  async getCashierStats(@TenantId() tenantId: string, @Req() req: AuthRequest) {
    const user = req.user;
    if (user.role !== "CASHIER") {
      throw new ForbiddenException("Access denied. Cashier only.");
    }

    const assignedStoreId = req.assignedStoreId || user.assignedStoreId;
    return this.dashboardService.getCashierStats(
      tenantId,
      user.id,
      assignedStoreId,
    );
  }

  @Get("stats/kitchen")
  @Roles("KITCHEN")
  async getKitchenStats(@TenantId() tenantId: string, @Req() req: AuthRequest) {
    const user = req.user;
    if (user.role !== "KITCHEN") {
      throw new ForbiddenException("Access denied. Kitchen only.");
    }

    const assignedStoreId = req.assignedStoreId || user.assignedStoreId;
    return this.dashboardService.getKitchenStats(tenantId, assignedStoreId);
  }
}
