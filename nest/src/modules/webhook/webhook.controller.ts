import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { UpdateWebhookDto } from "./dto/update-webhook.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("webhooks")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getWebhooks(@TenantId() tenantId: string, @Query() query: any) {
    return this.webhookService.getWebhooks(tenantId, query);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getWebhookById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.webhookService.getWebhookById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createWebhook(
    @Body() createWebhookDto: CreateWebhookDto,
    @TenantId() tenantId: string,
  ) {
    return this.webhookService.createWebhook(createWebhookDto, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateWebhook(
    @Param("id") id: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
    @TenantId() tenantId: string,
  ) {
    return this.webhookService.updateWebhook(id, updateWebhookDto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteWebhook(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.webhookService.deleteWebhook(id, tenantId);
  }

  @Post(":id/test")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async testWebhook(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.webhookService.testWebhook(id, tenantId);
  }

  @Post(":id/toggle")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async toggleWebhook(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.webhookService.toggleWebhook(id, tenantId);
  }

  @Get("events")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getWebhookEvents(@TenantId() tenantId: string) {
    return this.webhookService.getWebhookEvents(tenantId);
  }
}
