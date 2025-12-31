import prisma from '../config/database';
import logger from '../utils/logger';

export class OutletImportExportService {
  async exportToCSV(tenantId: string, filters?: any) {
    try {
      const where: any = { tenantId };
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;

      const outlets = await prisma.outlet.findMany({ where });
      
      const headers = ['id', 'name', 'address', 'phone', 'isActive', 'createdAt', 'updatedAt'];
      let csv = headers.join(',') + '\n';

      outlets.forEach(outlet => {
        csv += [
          outlet.id,
          `"${outlet.name}"`,
          `"${outlet.address}"`,
          outlet.phone,
          outlet.isActive,
          outlet.createdAt,
          outlet.updatedAt,
        ].join(',') + '\n';
      });

      return { filename: `outlets-${Date.now()}.csv`, content: csv, count: outlets.length };
    } catch (error: any) {
      logger.error('Export error', { error: error.message });
      throw new Error('Export gagal');
    }
  }

  async importFromCSV(tenantId: string, csvContent: string) {
    try {
      const lines = csvContent.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',');
      const results = { success: 0, failed: 0, errors: [] as any[] };

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',');
          const data: any = {};
          
          headers.forEach((header, idx) => {
            data[header.trim()] = values[idx]?.trim().replace(/^"|"$/g, '');
          });

          await prisma.outlet.create({
            data: {
              tenantId,
              name: data.name,
              address: data.address,
              phone: data.phone,
              isActive: data.isActive === 'true',
            },
          });
          results.success++;
        } catch (rowError: any) {
          results.failed++;
          results.errors.push({ row: i + 1, error: rowError.message });
        }
      }

      return results;
    } catch (error: any) {
      logger.error('Import error', { error: error.message });
      throw new Error('Import gagal');
    }
  }

  async exportToJSON(tenantId: string, format: 'detailed' | 'summary' = 'detailed') {
    try {
      const outlets = await prisma.outlet.findMany({ where: { tenantId } });

      if (format === 'summary') {
        return {
          filename: `outlets-summary-${Date.now()}.json`,
          data: {
            total: outlets.length,
            active: outlets.filter(o => o.isActive).length,
            inactive: outlets.filter(o => !o.isActive).length,
            createdAt: new Date().toISOString(),
          },
        };
      }

      return {
        filename: `outlets-${Date.now()}.json`,
        data: outlets,
        metadata: { count: outlets.length, createdAt: new Date().toISOString() },
      };
    } catch (error: any) {
      logger.error('JSON export error', { error: error.message });
      throw new Error('Export gagal');
    }
  }
}

export default new OutletImportExportService();
