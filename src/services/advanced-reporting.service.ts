/**
 * Advanced Reporting Service
 * Handles custom report builder, scheduled reports, export templates, dashboard customization
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import { sendEmail } from '../config/email';
import reportService from './report.service';
import PDFDocument from 'pdfkit';

interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'SALES' | 'INVENTORY' | 'FINANCIAL' | 'CUSTOMER' | 'CUSTOM';
  config: {
    columns: Array<{ field: string; label: string; type: string }>;
    filters: Array<{ field: string; operator: string; value: any }>;
    grouping?: Array<{ field: string }>;
    sorting?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  scheduleConfig?: {
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time?: string; // HH:mm format
    cronExpression?: string; // For custom schedule
  };
  recipients: string[]; // Email addresses
  format: 'PDF' | 'EXCEL' | 'CSV' | 'HTML';
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

class AdvancedReportingService {
  /**
   * Create custom report template
   */
  async createReportTemplate(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      type: string;
      config: any;
    }
  ): Promise<ReportTemplate> {
    try {
      // Save report template to database
      const savedTemplate = await prisma.reportTemplate.create({
        data: {
          tenantId,
          name: data.name,
          description: data.description,
          type: data.type,
          config: data.config,
        },
      });

      logger.info('Report template created:', { id: savedTemplate.id, name: savedTemplate.name });

      return {
        id: savedTemplate.id,
        name: savedTemplate.name,
        description: savedTemplate.description ?? undefined,
        type: savedTemplate.type as any,
        config: savedTemplate.config as any,
        createdAt: savedTemplate.createdAt,
        updatedAt: savedTemplate.updatedAt,
      };
    } catch (error: any) {
      logger.error('Error creating report template:', error);
      throw error;
    }
  }

  /**
   * Get all report templates
   */
  async getReportTemplates(tenantId: string, query: { type?: string; page?: number; limit?: number }) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = { tenantId, isActive: true };
      if (query.type) where.type = query.type;

      const [templates, total] = await Promise.all([
        prisma.reportTemplate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.reportTemplate.count({ where }),
      ]);

      return {
        data: templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error getting report templates:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(
    tenantId: string,
    templateId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<any> {
    try {
      // Get template
      const template = await prisma.reportTemplate.findFirst({
        where: { id: templateId, tenantId, isActive: true },
      });

      if (!template) {
        throw new Error('Report template not found');
      }

      // Generate report data based on template config
      // This would query the database based on template.config
      const config = template.config as any;
      let data: any[] = [];
      let summary: any = {};

      // Based on report type, query different data sources
      if (template.type === 'SALES') {
        const where: any = { tenantId };
        if (dateRange) {
          where.createdAt = {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          };
        }
        const orders = await prisma.order.findMany({ where });
        data = orders;
        summary = {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
        };
      } else if (template.type === 'INVENTORY') {
        const products = await prisma.product.findMany({ where: { tenantId } });
        data = products;
        summary = {
          totalProducts: products.length,
          totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        };
      } else if (template.type === 'FINANCIAL') {
        const where: any = { tenantId };
        if (dateRange) {
          where.createdAt = {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          };
        }
        const transactions = await prisma.transaction.findMany({ where });
        data = transactions;
        summary = {
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
        };
      }

      const reportData = {
        templateId,
        templateName: template.name,
        generatedAt: new Date(),
        dateRange,
        data,
        summary,
      };

      logger.info('Custom report generated:', reportData);

      return reportData;
    } catch (error: any) {
      logger.error('Error generating custom report:', error);
      throw error;
    }
  }

  /**
   * Create scheduled report
   */
  async createScheduledReport(
    tenantId: string,
    data: {
      templateId: string;
      schedule: string;
      scheduleConfig?: any;
      recipients: string[];
      format: string;
    }
  ): Promise<ScheduledReport> {
    try {
      const scheduledReport: ScheduledReport = {
        id: `scheduled-${Date.now()}`,
        templateId: data.templateId,
        schedule: data.schedule as any,
        scheduleConfig: data.scheduleConfig,
        recipients: data.recipients,
        format: data.format as any,
        isActive: true,
        nextRunAt: this.calculateNextRun(data.schedule, data.scheduleConfig),
      };

      logger.info('Scheduled report created:', scheduledReport);

      const saved = await prisma.scheduledReport.create({
        data: {
          tenantId,
          templateId: data.templateId,
          name: `Scheduled Report - ${new Date().toISOString()}`,
          schedule: data.schedule,
          scheduleConfig: data.scheduleConfig || {},
          format: data.format,
          recipients: data.recipients,
          isActive: true,
          nextRunAt: this.calculateNextRun(data.schedule, data.scheduleConfig),
        },
      });

      // Convert null to undefined for TypeScript strict mode
      const lastRunAt: Date | undefined = saved.lastRunAt !== null && saved.lastRunAt !== undefined
        ? saved.lastRunAt
        : undefined;
      const nextRunAt: Date | undefined = saved.nextRunAt !== null && saved.nextRunAt !== undefined
        ? saved.nextRunAt
        : undefined;

      return {
        id: saved.id,
        templateId: saved.templateId,
        schedule: saved.schedule as any,
        scheduleConfig: saved.scheduleConfig as any,
        recipients: saved.recipients,
        format: saved.format as any,
        isActive: saved.isActive,
        nextRunAt,
        lastRunAt,
      };
    } catch (error: any) {
      logger.error('Error creating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Calculate next run time for scheduled report
   */
  private calculateNextRun(schedule: string, scheduleConfig?: any): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (schedule) {
      case 'DAILY':
        nextRun.setDate(now.getDate() + 1);
        if (scheduleConfig?.time) {
          const [hours, minutes] = scheduleConfig.time.split(':');
          nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          nextRun.setHours(9, 0, 0, 0); // Default 9 AM
        }
        break;

      case 'WEEKLY': {
        const dayOfWeek = scheduleConfig?.dayOfWeek ?? 1; // Monday
        const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7 || 7;
        nextRun.setDate(now.getDate() + daysUntilNext);
        if (scheduleConfig?.time) {
          const [hours, minutes] = scheduleConfig.time.split(':');
          nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          nextRun.setHours(9, 0, 0, 0);
        }
        break;
      }

      case 'MONTHLY': {
        const dayOfMonth = scheduleConfig?.dayOfMonth ?? 1;
        nextRun.setMonth(now.getMonth() + 1);
        nextRun.setDate(dayOfMonth);
        if (scheduleConfig?.time) {
          const [hours, minutes] = scheduleConfig.time.split(':');
          nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          nextRun.setHours(9, 0, 0, 0);
        }
        break;
      }

      case 'CUSTOM':
        // For custom cron expressions, would need a cron parser
        // For now, default to next day
        nextRun.setDate(now.getDate() + 1);
        break;
    }

    return nextRun;
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(tenantId: string, query: { status?: string; page?: number; limit?: number }) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = { tenantId };
      if (query.status) {
        // Map status to isActive
        where.isActive = query.status === 'ACTIVE';
      }

      const [reports, total] = await Promise.all([
        prisma.scheduledReport.findMany({
          where,
          skip,
          take: limit,
          include: {
            template: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.scheduledReport.count({ where }),
      ]);

      return {
        data: reports.map(r => ({
          id: r.id,
          templateId: r.templateId,
          templateName: r.template.name,
          schedule: r.schedule,
          scheduleConfig: r.scheduleConfig,
          format: r.format,
          recipients: r.recipients,
          status: r.isActive ? 'ACTIVE' : 'INACTIVE',
          nextRunAt: r.nextRunAt,
          lastRunAt: r.lastRunAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error getting scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Execute scheduled reports
   */
  async executeScheduledReports(tenantId?: string): Promise<{ executed: number; failed: number }> {
    try {
      // Get all active scheduled reports
      const where: any = { isActive: true };
      if (tenantId) where.tenantId = tenantId;
      where.nextRunAt = { lte: new Date() };

      const scheduledReports = await prisma.scheduledReport.findMany({
        where,
        include: { template: true },
      });
      let executed = 0;
      let failed = 0;

      for (const scheduledReport of scheduledReports) {
        try {
          // Generate report
          const reportData = await this.generateCustomReport(
            tenantId || '',
            scheduledReport.templateId
          );

          // Export report in requested format
          const format = scheduledReport.format as 'PDF' | 'EXCEL' | 'CSV' | 'HTML';
          const exportedReport = await this.exportReport(reportData, format);

          // Send via email
          for (const recipient of scheduledReport.recipients) {
            try {
              // Convert exportedReport to string if it's a Buffer
              const emailContent = typeof exportedReport === 'string'
                ? exportedReport
                : `<p>Please find your scheduled report attached.</p>`;

              await sendEmail(
                recipient,
                'Scheduled Report',
                emailContent
              );
            } catch (emailError) {
              logger.error(`Failed to send report to ${recipient}:`, emailError);
            }
          }

          // Update last run and next run
          await prisma.scheduledReport.update({
            where: { id: scheduledReport.id },
            data: {
              lastRunAt: new Date(),
              nextRunAt: this.calculateNextRun(scheduledReport.schedule, scheduledReport.scheduleConfig as any),
            },
          });

          executed++;
        } catch (error: any) {
          failed++;
          logger.error(`Failed to execute scheduled report ${scheduledReport.id}:`, error);
        }
      }

      return { executed, failed };
    } catch (error: any) {
      logger.error('Error executing scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Export report in various formats
   */
  async exportReport(reportData: any, format: 'PDF' | 'EXCEL' | 'CSV' | 'HTML'): Promise<Buffer | string> {
    try {
      switch (format) {
        case 'PDF':
          return await this.exportToPDF(reportData);
        case 'EXCEL':
          return await this.exportToExcel(reportData);
        case 'CSV':
          return await this.exportToCSV(reportData);
        case 'HTML':
          return await this.exportToHTML(reportData);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error: any) {
      logger.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Export to PDF
   */
  private async exportToPDF(reportData: any): Promise<Buffer> {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));

      // Add title
      doc.fontSize(16).font('Helvetica-Bold').text('Report', { align: 'center' });
      doc.moveDown();

      // Add report metadata
      if (reportData.title) {
        doc.fontSize(12).font('Helvetica').text(`Title: ${reportData.title}`);
      }
      if (reportData.generatedAt) {
        doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`);
      }

      doc.moveDown();

      // Add table headers if data exists
      if (reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
        doc.fontSize(10).font('Helvetica-Bold');
        const firstRow = reportData.data[0];
        const columns = Object.keys(firstRow);

        // Add table headers
        columns.forEach((col) => {
          doc.text(col, { continued: true });
          doc.text(' | ');
        });
        doc.moveDown();

        // Add table data
        doc.font('Helvetica').fontSize(9);
        reportData.data.forEach((row: any) => {
          columns.forEach((col) => {
            doc.text(String(row[col] || ''), { continued: true });
            doc.text(' | ');
          });
          doc.moveDown(0.5);
        });
      }

      doc.end();

      return Buffer.concat(chunks);
    } catch (error: any) {
      logger.error('Error exporting to PDF:', error);
      // Fallback: return basic PDF on error
      return Buffer.from('PDF Export Error');
    }
  }

  /**
   * Export to Excel (CSV format for now - exceljs not installed)
   */
  private async exportToExcel(reportData: any): Promise<Buffer> {
    try {
      let csvContent = '';

      // Add headers
      if (reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
        const columns = Object.keys(reportData.data[0]);
        csvContent += columns.map(col => `"${col}"`).join(',') + '\n';

        // Add data rows
        reportData.data.forEach((row: any) => {
          const values = columns.map(col => {
            const value = row[col] || '';
            // Escape quotes in values
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          csvContent += values.join(',') + '\n';
        });
      }

      logger.info('Exporting report to Excel format (CSV)');
      return Buffer.from(csvContent, 'utf-8');
    } catch (error: any) {
      logger.error('Error exporting to Excel:', error);
      return Buffer.from('Excel Export Error');
    }
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(reportData: any): Promise<string> {
    try {
      let csvContent = '';

      // Add headers
      if (reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
        const columns = Object.keys(reportData.data[0]);
        csvContent += columns.map(col => `"${col}"`).join(',') + '\n';

        // Add data rows
        reportData.data.forEach((row: any) => {
          const values = columns.map(col => {
            const value = row[col] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          csvContent += values.join(',') + '\n';
        });
      }

      logger.info('Exporting report to CSV');
      return csvContent;
    } catch (error: any) {
      logger.error('Error exporting to CSV:', error);
      return 'CSV Export Error';
    }
  }

  /**
   * Export to HTML
   */
  private async exportToHTML(reportData: any): Promise<string> {
    try {
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${reportData.title || 'Report'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #4CAF50; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>${reportData.title || 'Report'}</h1>
      `;

      if (reportData.generatedAt) {
        htmlContent += `<p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>`;
      }

      // Add table if data exists
      if (reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
        const columns = Object.keys(reportData.data[0]);
        htmlContent += '<table><thead><tr>';

        // Add headers
        columns.forEach((col) => {
          htmlContent += `<th>${col}</th>`;
        });

        htmlContent += '</tr></thead><tbody>';

        // Add rows
        reportData.data.forEach((row: any) => {
          htmlContent += '<tr>';
          columns.forEach((col) => {
            htmlContent += `<td>${row[col] || ''}</td>`;
          });
          htmlContent += '</tr>';
        });

        htmlContent += '</tbody></table>';
      }

      htmlContent += '</body></html>';

      logger.info('Exporting report to HTML');
      return htmlContent;
    } catch (error: any) {
      logger.error('Error exporting to HTML:', error);
      return '<html><body>HTML Export Error</body></html>';
    }
  }

  /**
   * Get dashboard customization settings
   */
  async getDashboardSettings(tenantId: string, userId?: string): Promise<any> {
    try {
      const settings = userId
        ? await prisma.dashboardSettings.findUnique({
          where: {
            tenantId_userId: {
              tenantId,
              userId: userId,
            },
          },
        })
        : await prisma.dashboardSettings.findFirst({
          where: {
            tenantId,
            userId: null,
          },
        });

      if (settings) {
        return {
          widgets: settings.widgets as any,
          layout: settings.layout as any,
        };
      }

      // Return default settings if not found
      return {
        widgets: [
          { id: 'sales-overview', position: { x: 0, y: 0 }, size: { w: 4, h: 2 } },
          { id: 'top-products', position: { x: 4, y: 0 }, size: { w: 4, h: 2 } },
          { id: 'recent-orders', position: { x: 0, y: 2 }, size: { w: 8, h: 3 } },
        ],
        layout: 'grid',
      };
    } catch (error: any) {
      logger.error('Error getting dashboard settings:', error);
      throw error;
    }
  }

  /**
   * Save dashboard customization settings
   */
  async saveDashboardSettings(tenantId: string, userId: string | undefined, settings: any): Promise<void> {
    try {
      await prisma.dashboardSettings.upsert({
        where: userId
          ? {
            tenantId_userId: {
              tenantId,
              userId: userId,
            },
          }
          : {
            tenantId_userId: {
              tenantId,
              userId: null as any,
            },
          },
        create: {
          tenantId,
          userId: userId || null,
          layout: settings.layout || {},
          widgets: settings.widgets || [],
        },
        update: {
          layout: settings.layout || {},
          widgets: settings.widgets || [],
        },
      });

      logger.info('Dashboard settings saved:', settings);
    } catch (error: any) {
      logger.error('Error saving dashboard settings:', error);
      throw error;
    }
  }
}

export default new AdvancedReportingService();

