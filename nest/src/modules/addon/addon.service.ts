import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAddonDto } from "./dto/create-addon.dto";
import { UpdateAddonDto } from "./dto/update-addon.dto";
import { parsePagination } from "../../common/utils/pagination.util";
import { ADDON_CATALOG } from "../catalog/platform-catalog";

@Injectable()
export class AddonService {
  constructor(private readonly prisma: PrismaService) {}

  async getAddons(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        OR: [
          { addonName: { contains: query.search, mode: "insensitive" } },
          { addonType: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const [addons, total] = await Promise.all([
      this.prisma.tenantAddon.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || "subscribedAt"]: query.sortOrder || "desc",
        },
      }),
      this.prisma.tenantAddon.count({ where }),
    ]);

    return {
      data: addons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAddonById(id: string, tenantId: string) {
    const addon = await this.prisma.tenantAddon.findUnique({
      where: { id },
    });

    if (!addon) {
      throw new NotFoundException("Addon not found");
    }

    if (addon.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this addon");
    }

    return addon;
  }

  async createAddon(data: CreateAddonDto, tenantId: string) {
    const existing = await this.prisma.tenantAddon.findFirst({
      where: {
        tenantId,
        addonId: data.addonId,
      },
    });

    if (existing) {
      const nextLimit =
        (existing.limit || 0) +
        (typeof data.limit === "number" && data.limit > 0 ? data.limit : 0);
      const expiresAt = data.expiresAt
        ? new Date(data.expiresAt)
        : existing.expiresAt;
      return this.prisma.tenantAddon.update({
        where: { id: existing.id },
        data: {
          status: (data.status || "ACTIVE").toUpperCase(),
          limit: nextLimit > 0 ? nextLimit : existing.limit,
          expiresAt,
          addonName: data.addonName || existing.addonName,
          addonType: data.addonType || existing.addonType,
          purchasedBy: data.purchasedBy || existing.purchasedBy,
        },
      });
    }

    const addon = await this.prisma.tenantAddon.create({
      data: {
        ...data,
        tenantId,
        status: (data.status || "ACTIVE").toUpperCase(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });

    return addon;
  }

  async updateAddon(id: string, data: UpdateAddonDto, tenantId: string) {
    await this.getAddonById(id, tenantId);

    const updateData: any = {
      ...(data.status && { status: data.status.toUpperCase() }),
      ...(typeof data.limit === "number" && { limit: data.limit }),
      ...(typeof data.currentUsage === "number" && {
        currentUsage: data.currentUsage,
      }),
      ...(data.config && { config: data.config }),
      ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
    };

    if (typeof data.durationDays === "number" && data.durationDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + data.durationDays);
      updateData.expiresAt = expiry;
    }

    const updated = await this.prisma.tenantAddon.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteAddon(id: string, tenantId: string) {
    await this.getAddonById(id, tenantId);

    await this.prisma.tenantAddon.delete({
      where: { id },
    });

    return { message: "Addon deleted successfully" };
  }

  async getActiveAddons(tenantId: string) {
    return this.prisma.tenantAddon.findMany({
      where: { tenantId, status: "ACTIVE" },
    });
  }

  async toggleAddon(id: string, tenantId: string) {
    const addon = await this.getAddonById(id, tenantId);
    const newStatus = addon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    return this.prisma.tenantAddon.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async getAvailableAddons() {
    return ADDON_CATALOG;
  }

  async extendAddon(id: string, tenantId: string, duration: number) {
    if (!duration || duration < 1) {
      throw new BadRequestException("Duration must be at least 1 day");
    }
    const addon = await this.getAddonById(id, tenantId);
    const base = addon.expiresAt ? new Date(addon.expiresAt) : new Date();
    const next = new Date(base.getTime() + duration * 24 * 60 * 60 * 1000);
    const updated = await this.prisma.tenantAddon.update({
      where: { id },
      data: { expiresAt: next, status: "ACTIVE" },
    });
    return { message: "Addon extended", data: updated };
  }

  async subscribeAddon(
    tenantId: string,
    body: {
      addonId: string;
      addonName?: string;
      addonType?: string;
      limit?: number | null;
      duration?: number;
      purchasedBy?: string;
    },
    actorRole?: string,
  ) {
    const catalog = ADDON_CATALOG.find((a) => a.id === body.addonId);
    if (!catalog) throw new NotFoundException("Addon not found in catalog");

    const duration = body.duration && body.duration > 0 ? body.duration : 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + duration);

    return this.createAddon(
      {
        addonId: catalog.id,
        addonName: catalog.name,
        addonType: catalog.type,
        status: "ACTIVE",
        limit:
          typeof body.limit === "number"
            ? body.limit
            : (catalog.defaultLimit ?? undefined),
        expiresAt: expiry.toISOString(),
        purchasedBy:
          body.purchasedBy || (actorRole === "SUPER_ADMIN" ? "ADMIN" : "SELF"),
      },
      tenantId,
    );
  }

  async unsubscribeAddon(tenantId: string, addonId: string) {
    const addon = await this.prisma.tenantAddon.findFirst({
      where: { tenantId, addonId },
    });
    if (!addon) throw new NotFoundException("Addon subscription not found");
    const updated = await this.prisma.tenantAddon.update({
      where: { id: addon.id },
      data: { status: "INACTIVE" },
    });
    return { message: "Addon unsubscribed", data: updated };
  }
}
