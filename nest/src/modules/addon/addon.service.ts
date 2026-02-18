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
      throw new BadRequestException("Addon already exists for this tenant");
    }

    const addon = await this.prisma.tenantAddon.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return addon;
  }

  async updateAddon(id: string, data: UpdateAddonDto, tenantId: string) {
    await this.getAddonById(id, tenantId);

    const updated = await this.prisma.tenantAddon.update({
      where: { id },
      data,
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
    return [];
  }

  async extendAddon(id: string, tenantId: string, duration: number) {
    return { message: "Addon extended" };
  }
}
