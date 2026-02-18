import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { SubscriptionReceiptService } from "./subscription-receipt.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("subscription-receipts")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SubscriptionReceiptController {
  constructor(
    private readonly subscriptionReceiptService: SubscriptionReceiptService,
  ) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getSubscriptionHistory(@TenantId() tenantId: string) {
    return this.subscriptionReceiptService.getSubscriptionHistory(tenantId);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getSubscriptionById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.subscriptionReceiptService.getSubscriptionById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN")
  async createSubscription(@Body() data: any, @TenantId() tenantId: string) {
    return this.subscriptionReceiptService.createSubscription(data, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN")
  async updateSubscription(
    @Param("id") id: string,
    @Body() data: any,
    @TenantId() tenantId: string,
  ) {
    return this.subscriptionReceiptService.updateSubscription(
      id,
      data,
      tenantId,
    );
  }

  @Post(":id/renew")
  @Roles("SUPER_ADMIN")
  async renewSubscription(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.subscriptionReceiptService.renewSubscription(id, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN")
  async deleteSubscription(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.subscriptionReceiptService.deleteSubscription(id, tenantId);
  }

  @Get("latest")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getLatestSubscription(@TenantId() tenantId: string) {
    return this.subscriptionReceiptService.getLatestSubscription(tenantId);
  }
}
