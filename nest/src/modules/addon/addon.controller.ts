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
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { AddonService } from "./addon.service";
import { CreateAddonDto } from "./dto/create-addon.dto";
import { UpdateAddonDto } from "./dto/update-addon.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("addons")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class AddonController {
  constructor(private readonly addonService: AddonService) { }

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getAddons(@TenantId() tenantId: string, @Query() query: any) {
    return this.addonService.getAddons(tenantId, query);
  }

  @Get("active")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getActiveAddons(@TenantId() tenantId: string) {
    return this.addonService.getActiveAddons(tenantId);
  }

  @Get("available")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getAvailableAddons() {
    return this.addonService.getAvailableAddons();
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getAddonById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.addonService.getAddonById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createAddon(
    @Body() createAddonDto: CreateAddonDto,
    @TenantId() tenantId: string,
  ) {
    return this.addonService.createAddon(createAddonDto, tenantId);
  }

  @Post("subscribe")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async subscribeAddon(
    @TenantId() tenantId: string,
    @Body()
    body: {
      addonId: string;
      addonName?: string;
      addonType?: string;
      limit?: number | null;
      duration?: number;
      tenantId?: string;
      purchasedBy?: string;
    },
    @Req() req: Request,
  ) {
    const user = req.user as { role?: string } | undefined;
    const targetTenantId =
      user?.role === "SUPER_ADMIN" && body.tenantId ? body.tenantId : tenantId;
    return this.addonService.subscribeAddon(targetTenantId, body, user?.role);
  }

  @Post("unsubscribe/:addonId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async unsubscribeAddon(
    @Param("addonId") addonId: string,
    @TenantId() tenantId: string,
    @Body() body: { tenantId?: string },
    @Req() req: Request,
  ) {
    const user = req.user as { role?: string } | undefined;
    const targetTenantId =
      user?.role === "SUPER_ADMIN" && body?.tenantId
        ? body.tenantId
        : tenantId;
    return this.addonService.unsubscribeAddon(targetTenantId, addonId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateAddon(
    @Param("id") id: string,
    @Body() updateAddonDto: UpdateAddonDto,
    @TenantId() tenantId: string,
  ) {
    return this.addonService.updateAddon(id, updateAddonDto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteAddon(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.addonService.deleteAddon(id, tenantId);
  }



  @Post(":id/extend")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async extendAddon(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() body: { duration: number },
  ) {
    return this.addonService.extendAddon(id, tenantId, body.duration);
  }
}
