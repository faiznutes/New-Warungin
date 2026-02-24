import { Controller, Get, Post, Query, UseGuards, Res } from "@nestjs/common";
import { Response } from "express";
import { ReportsService } from "./reports.service";
import {
  GetDailySalesDto,
  GetProductSummaryDto,
  GetCustomerRevenueDto,
  GetShiftSummaryDto,
} from "./dto/report-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("reports")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("dashboard/summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getSummaryDashboard(@TenantId() tenantId: string) {
    return this.reportsService.getSummaryDashboard(tenantId);
  }

  @Get("dashboard/revenue-trend")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getRevenueTrend(@TenantId() tenantId: string) {
    return this.reportsService.getRevenueTrend(tenantId);
  }

  @Get("daily-sales")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getDailySales(
    @TenantId() tenantId: string,
    @Query() query: GetDailySalesDto,
  ) {
    return this.reportsService.getDailySales(tenantId, query);
  }

  @Get("tenant")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getTenantReport(
    @TenantId() tenantId: string,
    @Query("reportType") reportType: string,
    @Query("period") period?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("includeProducts") includeProducts?: string,
  ) {
    return this.reportsService.getTenantReport(tenantId, {
      reportType,
      period,
      startDate,
      endDate,
      includeProducts: includeProducts === "true",
    });
  }

  @Get("products/summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getProductSummary(
    @TenantId() tenantId: string,
    @Query() query: GetProductSummaryDto,
  ) {
    return this.reportsService.getProductSummary(tenantId, query);
  }

  @Get("customers/revenue")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getCustomerRevenue(
    @TenantId() tenantId: string,
    @Query() query: GetCustomerRevenueDto,
  ) {
    return this.reportsService.getCustomerRevenue(tenantId, query);
  }

  @Get("shifts/summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getShiftSummary(
    @TenantId() tenantId: string,
    @Query() query: GetShiftSummaryDto,
  ) {
    return this.reportsService.getShiftSummary(tenantId, query);
  }

  @Post("export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async exportReport(
    @TenantId() tenantId: string,
    @Query("type") reportType: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Res() res?: Response,
  ) {
    const reportTypes: any = {
      "daily-sales": () =>
        this.reportsService.getDailySales(tenantId, {
          startDate,
          endDate,
          page: 1,
          limit: 365, // Full year max
        }),
      "product-summary": () =>
        this.reportsService.getProductSummary(tenantId, {
          startDate,
          endDate,
          sortBy: "revenue",
          limit: 500,
        }),
      "customer-revenue": () =>
        this.reportsService.getCustomerRevenue(tenantId, {
          startDate,
          endDate,
          sortBy: "total",
          limit: 500,
        }),
      "shift-summary": () =>
        this.reportsService.getShiftSummary(tenantId, {
          startDate,
          endDate,
          page: 1,
          limit: 500,
        }),
    };

    if (!reportTypes[reportType]) {
      return res?.status(400).json({ message: "Invalid report type" });
    }

    const data = await reportTypes[reportType]();

    // Return as JSON for now (CSV export can be added later)
    res?.setHeader("Content-Type", "application/json");
    res?.setHeader(
      "Content-Disposition",
      `attachment; filename="report-${reportType}-${Date.now()}.json"`,
    );
    res?.json(data);
  }
}
