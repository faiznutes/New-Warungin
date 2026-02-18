import { Controller, Get, Post, Body, UseGuards, Header } from "@nestjs/common";
import { InternalService } from "./internal.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("internal")
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @Get("health")
  async healthCheck() {
    return this.internalService.healthCheck();
  }

  @Get("info")
  async getSystemInfo() {
    return this.internalService.getSystemInfo();
  }

  @Public()
  @Post("payment/webhook")
  async handlePaymentWebhook(@Body() body: any) {
    return this.internalService.handlePaymentWebhook(body);
  }

  @Public()
  @Post("backup")
  async triggerBackup(@Body() body: { tenantId?: string; type?: string }) {
    return this.internalService.triggerBackup(body.tenantId, body.type);
  }

  @Public()
  @Post("subscription/revert")
  async revertSubscriptions() {
    return this.internalService.revertSubscriptions();
  }

  @Public()
  @Get("tenants/active")
  async getActiveTenants() {
    return { data: await this.internalService.getActiveTenants() };
  }

  @Public()
  @Post("api-key/rotate")
  async rotateApiKey(@Body() body: { newKey: string }) {
    return this.internalService.rotateApiKey(body.newKey);
  }

  @Public()
  @Get("api-key/history")
  async getApiKeyHistory() {
    return this.internalService.getApiKeyHistory();
  }
}
