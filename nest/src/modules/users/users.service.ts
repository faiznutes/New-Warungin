import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from "./dto/user.dto";
import * as bcrypt from "bcryptjs";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeRole(role?: string) {
    if (!role) return role;
    return role === "STAFF" ? "CASHIER" : role;
  }

  private async assertSupervisorRoleAddon(tenantId: string, role?: string) {
    const normalizedRole = this.normalizeRole(role);
    if (normalizedRole !== "SUPERVISOR") return;

    const addon = await this.prisma.tenantAddon.findFirst({
      where: {
        tenantId,
        addonType: "SUPERVISOR_ROLE",
        status: { in: ["active", "ACTIVE"] },
      },
      select: { id: true },
    });

    if (!addon) {
      throw new BadRequestException(
        "Supervisor Role addon belum aktif untuk tenant ini",
      );
    }
  }

  private async sanitizePermissions(
    tenantId: string,
    role: string,
    permissions?: Record<string, any>,
  ) {
    if (!permissions || typeof permissions !== "object") {
      return permissions;
    }

    const next = { ...permissions } as Record<string, any>;
    const roleNormalized = this.normalizeRole(role) || role;

    if (!["SUPERVISOR", "CASHIER", "KITCHEN"].includes(roleNormalized)) {
      delete next.allowedStoreIds;
      delete next.assignedStoreId;
      return next;
    }

    const tenantOutlets = await this.prisma.outlet.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const outletIds = new Set(tenantOutlets.map((o) => o.id));

    if (roleNormalized === "SUPERVISOR") {
      const allowedIds = Array.isArray(next.allowedStoreIds)
        ? Array.from(
            new Set(
              next.allowedStoreIds.filter((id: any) => typeof id === "string"),
            ),
          )
        : [];

      if (allowedIds.length === 0) {
        throw new BadRequestException(
          "At least one allowed store is required for supervisor",
        );
      }

      const invalid = allowedIds.find((id) => !outletIds.has(id));
      if (invalid) {
        throw new BadRequestException("Invalid allowed store assignment");
      }

      next.allowedStoreIds = allowedIds;
      delete next.assignedStoreId;
      return next;
    }

    const assignedStoreId =
      typeof next.assignedStoreId === "string" ? next.assignedStoreId : "";
    if (!assignedStoreId) {
      throw new BadRequestException(
        "Assigned store is required for cashier/kitchen",
      );
    }
    if (!outletIds.has(assignedStoreId)) {
      throw new BadRequestException("Invalid assigned store");
    }

    next.assignedStoreId = assignedStoreId;
    delete next.allowedStoreIds;
    return next;
  }

  private clearStoreScopePermissions(
    permissions?: Record<string, any> | null,
  ): Record<string, any> {
    const next =
      permissions && typeof permissions === "object" ? { ...permissions } : {};
    delete next.allowedStoreIds;
    delete next.assignedStoreId;
    return next;
  }

  private assertMutableUser(user: { role: string }, action: string) {
    if (user.role === "SUPER_ADMIN") {
      throw new ForbiddenException(
        `SUPER_ADMIN user cannot be ${action} from tenant management`,
      );
    }
  }

  async getUsers(tenantId: string, page: number = 1, limit: number = 10) {
    const { skip } = parsePagination(page, limit);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
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
      this.prisma.user.count({ where: { tenantId } }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this user");
    }

    return user;
  }

  async createUser(data: CreateUserDto, tenantId: string) {
    await this.assertSupervisorRoleAddon(tenantId, data.role);

    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: data.email,
      },
    });

    if (existing) {
      throw new ConflictException("Email already exists for this tenant");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: this.normalizeRole(data.role) as any,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto, tenantId: string) {
    const user = await this.getUserById(id, tenantId);
    const effectiveRole =
      this.normalizeRole(data.role || user.role) || user.role;

    await this.assertSupervisorRoleAddon(tenantId, effectiveRole);

    if (
      user.role === "SUPER_ADMIN" &&
      (data.isActive === false ||
        (typeof data.role === "string" && data.role !== "SUPER_ADMIN"))
    ) {
      this.assertMutableUser(user, "downgraded or deactivated");
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          tenantId,
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException("Email already exists for this tenant");
      }
    }

    const updateData: any = { ...data };
    if (data.role) {
      updateData.role = this.normalizeRole(data.role);
    }

    const storeScopedRoles = ["SUPERVISOR", "CASHIER", "KITCHEN"];
    const roleChanged =
      typeof data.role === "string" && data.role !== user.role;

    if (data.permissions || roleChanged) {
      const basePermissions = data.permissions || (user as any).permissions;

      if (storeScopedRoles.includes(effectiveRole) && !basePermissions) {
        throw new BadRequestException(
          "Permissions are required for supervisor/cashier/kitchen role",
        );
      }

      updateData.permissions = await this.sanitizePermissions(
        tenantId,
        effectiveRole,
        basePermissions,
      );
    } else if (!["SUPERVISOR", "CASHIER", "KITCHEN"].includes(effectiveRole)) {
      updateData.permissions = this.clearStoreScopePermissions(
        (user as any).permissions,
      );
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
      updateData.mustChangePassword = true;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async resetUserPasswordTemp(id: string, tenantId: string) {
    const user = await this.getUserById(id, tenantId);
    this.assertMutableUser(user, "reset from tenant management");

    const temporaryPassword = Math.random().toString(36).slice(-10) + "A1!";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
      },
    });

    return {
      message: "Temporary password generated",
      data: {
        userId: id,
        temporaryPassword,
      },
    };
  }

  async changePassword(id: string, data: ChangePasswordDto, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true, tenantId: true },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized");
    }

    const isValid = await bcrypt.compare(data.oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }

  async deleteUser(id: string, tenantId: string) {
    const user = await this.getUserById(id, tenantId);
    this.assertMutableUser(user, "deleted");

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: "User deleted successfully" };
  }

  async getUserRole(id: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    return user?.role || null;
  }

  async exportUsers(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return users;
  }

  async getUserStats(tenantId: string) {
    const total = await this.prisma.user.count({ where: { tenantId } });
    const active = await this.prisma.user.count({
      where: { tenantId, isActive: true },
    });
    return { total, active, inactive: total - active };
  }

  async resetPassword(email: string, tenantId: string) {
    return { message: "Password reset email sent" };
  }

  async activateUser(id: string, tenantId: string) {
    const user = await this.getUserById(id, tenantId);
    return this.prisma.user.update({ where: { id }, data: { isActive: true } });
  }

  async deactivateUser(id: string, tenantId: string) {
    const user = await this.getUserById(id, tenantId);
    this.assertMutableUser(user, "deactivated");
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
