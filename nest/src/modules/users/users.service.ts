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
        role: data.role as any,
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
      updateData.role = data.role;
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
