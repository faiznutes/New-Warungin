import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { ExcludeInterceptor } from "../../common/decorators/exclude-interceptor.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RetentionService } from "./retention.service";

@Controller("retention")
@UseGuards(RolesGuard)
@Roles("SUPER_ADMIN")
@ExcludeInterceptor()
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get("stats")
  async getStats(@Query("policy") policy?: string) {
    const normalized = this.retentionService.parsePolicy(policy);
    return this.retentionService.getStats(normalized);
  }

  @Post("orders")
  async applyOrdersRetention(@Body("days") days?: number) {
    return this.retentionService.applyOrders(days || 730);
  }

  @Post("transactions")
  async applyTransactionsRetention(@Body("days") days?: number) {
    return this.retentionService.applyTransactions(days || 730);
  }

  @Post("reports")
  async applyReportsRetention(@Body("days") days?: number) {
    return this.retentionService.applyReports(days || 730);
  }

  @Post("audit-logs")
  async applyAuditLogsRetention(@Body("days") days?: number) {
    return this.retentionService.applyAuditLogs(days || 730);
  }

  @Post("contact-submissions")
  async applyContactSubmissionsRetention(@Body("days") days?: number) {
    return this.retentionService.applyContactSubmissions(days || 730);
  }

  @Post("demo-requests")
  async applyDemoRequestsRetention(@Body("days") days?: number) {
    return this.retentionService.applyDemoRequests(days || 730);
  }

  @Post("apply-all")
  async applyAllRetention(@Body("policy") policy: Record<string, number>) {
    const normalized = this.retentionService.parsePolicy(
      JSON.stringify(policy || {}),
    );
    return this.retentionService.applyAll(normalized);
  }
}
