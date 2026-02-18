import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return {
      tenantId: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      isActive: tenant.isActive,
      subscriptionPlan: tenant.subscriptionPlan,
      features: tenant.features,
    };
  }

  async updateFeatureToggle(
    tenantId: string,
    featureName: string,
    enabled: boolean,
  ) {
    return { message: "Feature toggle updated" };
  }

  async updateSettings(tenantId: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name || tenant.name,
        email: data.email || tenant.email,
        phone: data.phone || tenant.phone,
        address: data.address || tenant.address,
      },
    });

    return updated;
  }

  async getTheme(tenantId: string) {
    return { theme: "light" };
  }

  async updateTheme(tenantId: string, data: any) {
    return { message: "Theme updated" };
  }

  async getNotificationSettings(tenantId: string) {
    return { email: true, push: true, sms: false };
  }

  async updateNotificationSettings(tenantId: string, data: any) {
    return { message: "Notification settings updated" };
  }
}
