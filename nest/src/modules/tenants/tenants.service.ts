import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantQueryDto,
} from "./dto/tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("Tenant slug already exists");
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        subscriptionPlan: dto.subscriptionPlan || "BASIC",
        tenantsLimit: dto.tenantsLimit || 1,
      },
    });

    return tenant;
  }

  async findAll(query: TenantQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            outlets: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.tenant.delete({
      where: { id },
    });

    return { success: true };
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return tenant;
  }

  async updateSubscription(
    id: string,
    plan: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        subscriptionPlan: plan,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    });
  }

  async getTenantUsers(id: string) {
    return this.prisma.user.findMany({ where: { tenantId: id } });
  }

  async getTenantProducts(id: string) {
    return this.prisma.product.findMany({ where: { tenantId: id } });
  }

  async getTenantOrders(id: string) {
    return this.prisma.order.findMany({ where: { tenantId: id } });
  }

  async updateTenantStatus(id: string, isActive: boolean) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
  }

  async activateTenant(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateTenant(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async verifyTenant(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async getTenantStatsOverview() {
    const [totalTenants, activeTenants, totalUsers] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count(),
    ]);

    return {
      totalTenants,
      activeTenants,
      inactiveTenants: totalTenants - activeTenants,
      totalUsers,
    };
  }

  async getTenantUsage(id: string) {
    const [orders, products, customers, users] = await Promise.all([
      this.prisma.order.count({ where: { tenantId: id } }),
      this.prisma.product.count({ where: { tenantId: id } }),
      this.prisma.customer.count({ where: { tenantId: id } }),
      this.prisma.user.count({ where: { tenantId: id } }),
    ]);

    return { orders, products, customers, users };
  }
}
