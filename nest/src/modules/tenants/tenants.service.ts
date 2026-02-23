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
import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "../users/dto/user.dto";
import { CreateOutletDto } from "../outlets/dto/outlet.dto";
import { getPlanPrice } from "../catalog/platform-catalog";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    // 1. Generate Slug if missing
    let slug = dto.slug;
    if (!slug) {
      slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      // Append random suffix if short or empty
      if (slug.length < 3) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    // Ensure slug uniqueness
    let existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
    let counter = 1;
    while (existingSlug) {
      slug = `${slug}-${counter}`;
      existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
      counter++;
    }

    // 2. Generate Email if missing
    const email = dto.email || `admin@${slug}.com`;

    // 3. Check for existing tenant with same email (global uniqueness check for email if needed, though schema enforces it)
    const existingEmail = await this.prisma.tenant.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException("Tenant email already exists");
    }

    // 4. Generate Default Password
    const defaultPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 5. Create Tenant and User in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug,
          email,
          phone: dto.phone,
          address: dto.address,
          subscriptionPlan: dto.subscriptionPlan || "BASIC",
          tenantsLimit: dto.tenantsLimit || 1,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: `Admin ${tenant.name}`,
          email: email,
          password: hashedPassword,
          role: "ADMIN_TENANT",
        },
      });

      return { tenant, user };
    });

    return {
      ...result.tenant,
      defaultPassword,
      users: [result.user],
    };
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

  async findDetail(id: string) {
    const tenant = await this.findOne(id);
    const [users, stores, addonsRaw, invoices, latestSubscription] =
      await Promise.all([
        this.prisma.user.findMany({
          where: { tenantId: id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.outlet.findMany({
          where: { tenantId: id },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.tenantAddon.findMany({
          where: { tenantId: id },
          orderBy: { subscribedAt: "desc" },
        }),
        this.prisma.subscriptionHistory.findMany({
          where: { tenantId: id },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
        this.prisma.subscription.findFirst({
          where: { tenantId: id },
          orderBy: { endDate: "desc" },
        }),
      ]);

    const addons = addonsRaw.map((addon) => ({
      ...addon,
      status: (addon.status || "ACTIVE").toUpperCase(),
    }));

    const subscription = latestSubscription
      ? {
          plan: latestSubscription.plan,
          status: latestSubscription.status,
          subscriptionStart: latestSubscription.startDate,
          subscriptionEnd: latestSubscription.endDate,
          amount: latestSubscription.amount,
        }
      : {
          plan: tenant.subscriptionPlan,
          status: tenant.isActive ? "ACTIVE" : "INACTIVE",
          subscriptionStart: tenant.subscriptionStart,
          subscriptionEnd: tenant.subscriptionEnd,
          amount: getPlanPrice(tenant.subscriptionPlan || "BASIC"),
        };

    return {
      tenant,
      users,
      stores,
      addons,
      subscription,
      invoices,
    };
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
    body: {
      plan?: string;
      status?: string;
      durationDays?: number;
      durationDeltaDays?: number;
      startDate?: Date;
      endDate?: Date;
      createBilling?: boolean;
      purchasedBy?: string;
      note?: string;
    },
  ) {
    const tenant = await this.findOne(id);
    const plan = (
      body.plan ||
      tenant.subscriptionPlan ||
      "BASIC"
    ).toUpperCase();
    const now = new Date();
    const currentStart = tenant.subscriptionStart || now;
    const startDate = body.startDate ? new Date(body.startDate) : currentStart;
    let endDate = body.endDate
      ? new Date(body.endDate)
      : tenant.subscriptionEnd;

    if (!endDate && body.durationDays && body.durationDays > 0) {
      endDate = new Date(
        now.getTime() + body.durationDays * 24 * 60 * 60 * 1000,
      );
    }

    if (typeof body.durationDeltaDays === "number" && tenant.subscriptionEnd) {
      const base = new Date(tenant.subscriptionEnd);
      const next = new Date(
        base.getTime() + body.durationDeltaDays * 24 * 60 * 60 * 1000,
      );
      endDate = next < now ? now : next;
    }

    if (!endDate) {
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const status = (body.status || "ACTIVE").toUpperCase();
    const normalizedStatus =
      status === "INACTIVE" || status === "FROZEN" ? "INACTIVE" : status;

    if (normalizedStatus === "CANCELLED") {
      endDate = now;
    }

    const amount = getPlanPrice(plan);
    const durationDays = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
      ),
    );

    const shouldCreateBilling = body.createBilling === true;
    const purchasedBy = (body.purchasedBy || "ADMIN").toUpperCase();

    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        subscriptionPlan: plan,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
        isActive: normalizedStatus === "ACTIVE" && endDate > now,
      },
    });

    if (!shouldCreateBilling) {
      return {
        ...updatedTenant,
        billingEventCreated: false,
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          tenantId: id,
          plan,
          startDate,
          endDate,
          status: normalizedStatus,
          amount,
          purchasedBy,
        },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          tenantId: id,
          planType: plan,
          startDate,
          endDate,
          price: amount,
          durationDays,
          isTemporary: false,
          reverted: false,
        },
      });

      return {
        ...updatedTenant,
        billingEventCreated: true,
      };
    });

    return result;
  }

  async createTenantUser(
    tenantId: string,
    dto: Omit<CreateUserDto, "password"> & { password?: string },
  ) {
    await this.findOne(tenantId);

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email },
    });
    if (existing)
      throw new ConflictException("Email already exists for this tenant");

    const generatedPassword =
      dto.password || Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        role: dto.role as any,
        isActive: true,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { ...user, defaultPassword: generatedPassword };
  }

  async createTenantOutlet(tenantId: string, dto: CreateOutletDto) {
    await this.findOne(tenantId);
    return this.prisma.outlet.create({
      data: {
        tenantId,
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        shiftConfig: (dto as any).shiftConfig,
        operatingHours: (dto as any).operatingHours,
        isActive: true,
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
