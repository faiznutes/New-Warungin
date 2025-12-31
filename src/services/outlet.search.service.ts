import prisma from '../config/database';
import logger from '../utils/logger';

export class OutletSearchService {
  async search(tenantId: string, filters: any = {}, options: any = {}) {
    try {
      const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      const where: any = { tenantId };

      if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
      if (filters.phone) where.phone = { contains: filters.phone, mode: 'insensitive' };
      if (filters.address) where.address = { contains: filters.address, mode: 'insensitive' };
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.createdAfter) where.createdAt = { ...where.createdAt, gte: new Date(filters.createdAfter) };
      if (filters.createdBefore) where.createdAt = { ...where.createdAt, lte: new Date(filters.createdBefore) };

      const orderBy: any = {};
      if (sortBy === 'name') orderBy.name = sortOrder;
      else if (sortBy === 'updatedAt') orderBy.updatedAt = sortOrder;
      else orderBy.createdAt = sortOrder;

      const [outlets, total] = await Promise.all([
        prisma.outlet.findMany({ where, orderBy, skip, take: limit }),
        prisma.outlet.count({ where }),
      ]);

      return {
        data: outlets,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        filters, sorting: { sortBy, sortOrder },
      };
    } catch (error: any) {
      logger.error('Search error', { error: error.message, tenantId });
      throw new Error('Search failed');
    }
  }

  async getStatistics(tenantId: string) {
    try {
      const total = await prisma.outlet.count({ where: { tenantId } });
      const active = await prisma.outlet.count({ where: { tenantId, isActive: true } });
      const inactive = total - active;

      return { total, active, inactive, inactivePercentage: total > 0 ? Math.round((inactive / total) * 100) : 0 };
    } catch (error: any) {
      logger.error('Statistics error', { error: error.message, tenantId });
      throw new Error('Statistics failed');
    }
  }

  async fullTextSearch(tenantId: string, searchTerm: string, limit: number = 20) {
    try {
      const outlets = await prisma.outlet.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });

      return { results: outlets, count: outlets.length, searchTerm };
    } catch (error: any) {
      logger.error('Full-text search error', { error: error.message });
      throw new Error('Search failed');
    }
  }

  async getAutocomplete(tenantId: string, prefix: string, field: string = 'name') {
    try {
      const outlets = await prisma.outlet.findMany({
        where: { tenantId, [field]: { startsWith: prefix, mode: 'insensitive' } },
        select: { [field]: true },
        distinct: [field as any],
        take: 10,
      });

      return outlets.map(o => o[field]);
    } catch (error: any) {
      logger.error('Autocomplete error', { error: error.message });
      throw new Error('Autocomplete failed');
    }
  }
}

export default new OutletSearchService();
