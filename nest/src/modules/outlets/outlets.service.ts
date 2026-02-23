import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateOutletDto,
  UpdateOutletDto,
  GetOutletsDto,
} from "./dto/outlet.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class OutletsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOutlets(tenantId: string, query: GetOutletsDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { address: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    if (query.isActive !== undefined) {
      where = {
        ...where,
        isActive: query.isActive === "true",
      };
    }

    const [outlets, total] = await Promise.all([
      this.prisma.outlet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.outlet.count({ where }),
    ]);

    return {
      data: outlets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOutletById(id: string, tenantId: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id },
    });

    if (!outlet) {
      throw new NotFoundException("Outlet not found");
    }

    if (outlet.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this outlet");
    }

    return outlet;
  }

  async createOutlet(data: CreateOutletDto, tenantId: string) {
    const outlet = await this.prisma.outlet.create({
      data: {
        tenantId,
        name: data.name,
        address: data.address,
        phone: data.phone,
        shiftConfig: data.shiftConfig,
        operatingHours: data.operatingHours,
        isActive: true,
      },
    });

    return outlet;
  }

  async updateOutlet(id: string, data: UpdateOutletDto, tenantId: string) {
    await this.getOutletById(id, tenantId);

    const updateData: any = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.shiftConfig !== undefined && { shiftConfig: data.shiftConfig }),
      ...(data.operatingHours !== undefined && {
        operatingHours: data.operatingHours,
      }),
    };

    const updated = await this.prisma.outlet.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteOutlet(id: string, tenantId: string) {
    await this.getOutletById(id, tenantId);

    await this.prisma.outlet.delete({
      where: { id },
    });

    return { message: "Outlet deleted successfully" };
  }

  async getOutletStats(id: string, tenantId: string) {
    await this.getOutletById(id, tenantId);
    return { id, message: "Outlet stats" };
  }

  async toggleOutletStatus(id: string, tenantId: string) {
    const outlet = await this.getOutletById(id, tenantId);
    return this.prisma.outlet.update({
      where: { id },
      data: { isActive: !outlet.isActive },
    });
  }

  async getOutletOrders(id: string, tenantId: string) {
    return this.prisma.order.findMany({
      where: { outletId: id, tenantId },
      take: 50,
    });
  }

  async getActiveOutlets(tenantId: string) {
    return this.prisma.outlet.findMany({ where: { tenantId, isActive: true } });
  }
}
