import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpgradeSubscriptionDto } from "./dto/subscription.dto";
import { ADDON_CATALOG, PLAN_CATALOG } from "../catalog/platform-catalog";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSubscription(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
      currentPlan: tenant.subscriptionPlan,
      subscriptionStart: tenant.subscriptionStart,
      subscriptionEnd: tenant.subscriptionEnd,
      isActive:
        tenant.isActive && tenant.subscriptionEnd
          ? new Date(tenant.subscriptionEnd) > new Date()
          : tenant.isActive,
    };
  }

  async upgradeSubscription(tenantId: string, data: UpgradeSubscriptionDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionPlan: data.plan || data.newPlanId,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: "Subscription upgraded successfully",
      data: updated,
    };
  }

  async extendSubscription(
    tenantId: string,
    data: { plan?: string; duration: number },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const currentEnd = tenant.subscriptionEnd || new Date();
    const newEnd = new Date(
      currentEnd.getTime() + data.duration * 24 * 60 * 60 * 1000,
    );

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.plan && { subscriptionPlan: data.plan }),
        subscriptionEnd: newEnd,
      },
    });

    return {
      message: "Subscription extended successfully",
      data: updated,
    };
  }

  async reduceSubscription(tenantId: string, duration: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.subscriptionEnd) {
      throw new NotFoundException("Tenant or subscription not found");
    }

    const currentEnd = new Date(tenant.subscriptionEnd);
    const newEnd = new Date(
      currentEnd.getTime() - duration * 24 * 60 * 60 * 1000,
    );

    if (newEnd < new Date()) {
      throw new BadRequestException(
        "Cannot reduce subscription end date to the past",
      );
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionEnd: newEnd,
      },
    });

    return {
      message: "Subscription reduced successfully",
      data: updated,
    };
  }

  async revertTemporaryUpgrades() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        temporaryUpgrade: true,
        subscriptionEnd: { lt: new Date() },
      },
    });

    let reverted = 0;
    let failed = 0;

    for (const tenant of tenants) {
      try {
        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            subscriptionPlan: tenant.previousPlan || "BASIC",
            temporaryUpgrade: false,
            previousPlan: null,
          },
        });
        reverted++;
      } catch (error) {
        failed++;
      }
    }

    return { reverted, failed };
  }

  async updateSubscription(
    subscriptionId: string,
    data: {
      plan?: string;
      amount?: number;
      status?: string;
      purchasedBy?: string;
    },
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(data.plan && { plan: data.plan }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.purchasedBy && { purchasedBy: data.purchasedBy }),
      },
    });

    return updated;
  }

  async deleteSubscription(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: {
          select: {
            id: true,
            subscriptionPlan: true,
            subscriptionEnd: true,
            subscriptionStart: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    const tenantId = subscription.tenantId;

    await this.prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    const otherActiveSubscriptions = await this.prisma.subscription.findFirst({
      where: {
        tenantId: tenantId,
        id: { not: subscriptionId },
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
    });

    if (!otherActiveSubscriptions) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: "BASIC",
          temporaryUpgrade: false,
          previousPlan: null,
        },
      });
    }

    return { message: "Subscription deleted successfully" };
  }

  async bulkDeleteSubscriptions(ids: string[]) {
    const subscriptionsToDelete = await this.prisma.subscription.findMany({
      where: { id: { in: ids } },
      select: { id: true, tenantId: true },
    });

    const tenantIds = [
      ...new Set(subscriptionsToDelete.map((s) => s.tenantId)),
    ];

    const result = await this.prisma.subscription.deleteMany({
      where: { id: { in: ids } },
    });

    const now = new Date();

    for (const tenantId of tenantIds) {
      const otherActiveSubscriptions = await this.prisma.subscription.findFirst(
        {
          where: {
            tenantId: tenantId,
            id: { notIn: ids },
            status: "ACTIVE",
            endDate: { gte: now },
          },
        },
      );

      if (!otherActiveSubscriptions) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionPlan: "BASIC",
            temporaryUpgrade: false,
            previousPlan: null,
          },
        });
      }
    }

    return {
      message: `${result.count} subscription(s) deleted successfully`,
      deletedCount: result.count,
    };
  }

  async getAvailablePlans() {
    return PLAN_CATALOG;
  }

  async getAvailableAddons() {
    return ADDON_CATALOG;
  }

  async addAddon(tenantId: string, data: any) {
    return { message: "Addon added" };
  }

  async removeAddon(tenantId: string, addonId: string) {
    return { message: "Addon removed" };
  }

  async getSubscriptionHistory(tenantId: string, query?: any) {
    const subscriptions = await this.prisma.subscriptionHistory.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: subscriptions,
    };
  }
}
