/**
 * Daily Backup Service
 * Generates daily backup reports and sends them via email to tenant owners
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import { sendEmail } from '../config/email';
import reportService from './report.service';
import * as fs from 'fs';
import * as path from 'path';

export interface DailyBackupReport {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  date: Date;
  sales: {
    totalRevenue: number;
    totalOrders: number;
    totalItems: number;
  };
  cash: {
    cashIn: number;
    cashOut: number;
  };
  debts: {
    totalReceivables: number;
    totalPayables: number;
  };
  stock: {
    lowStock: number;
    outOfStock: number;
    lowStockProducts: Array<{ name: string; stock: number; minStock: number }>;
  };
}

export class DailyBackupService {
  private backupDir = path.join(process.cwd(), 'storage', 'backups');

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Generate daily backup report for a tenant
   */
  async generateDailyBackup(tenantId: string): Promise<{
    success: boolean;
    backupLogId?: string;
    filePath?: string;
    error?: string;
  }> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          users: {
            where: { role: 'ADMIN_TENANT' },
            take: 1,
          },
        },
      });

      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      // Check if email backup is enabled (from tenant settings or features)
      const tenantFeatures = tenant.features as any;
      const emailBackupEnabled = tenantFeatures?.email_backup_enabled !== false; // Default true
      
      if (!emailBackupEnabled) {
        logger.info(`⏭️  Email backup disabled for tenant ${tenantId}, skipping...`);
        return {
          success: true,
          backupLogId: undefined,
          filePath: undefined,
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get sales data
      const salesReport = await reportService.getSalesReport(tenantId, today, tomorrow);
      const totalRevenue = salesReport.totalRevenue || 0;
      const totalOrders = salesReport.totalOrders || 0;
      const totalItems = salesReport.totalItems || 0;

      // Get cash in/out (from CashFlow and completed transactions)
      const [cashFlows, completedTransactions] = await Promise.all([
        prisma.cashFlow.findMany({
          where: {
            tenantId,
            date: { gte: today, lt: tomorrow },
          },
        }),
        prisma.transaction.findMany({
          where: {
            tenantId,
            createdAt: { gte: today, lt: tomorrow },
            status: 'COMPLETED',
          },
        }),
      ]);

      // Cash in from completed transactions (sales)
      const cashInFromSales = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Cash in from cash flow (INCOME type)
      const cashInFromFlow = cashFlows
        .filter(cf => cf.type === 'INCOME')
        .reduce((sum, cf) => sum + Number(cf.amount), 0);
      
      const cashIn = cashInFromSales + cashInFromFlow;
      
      // Cash out from cash flow (EXPENSE type)
      const cashOut = cashFlows
        .filter(cf => cf.type === 'EXPENSE')
        .reduce((sum, cf) => sum + Number(cf.amount), 0);

      // Get receivables and payables
      const receivables = await prisma.order.aggregate({
        where: {
          tenantId,
          status: 'PENDING',
          paymentMethod: { in: ['CREDIT', 'INSTALLMENT'] },
        },
        _sum: { total: true },
      });

      const payables = await prisma.purchaseOrder.aggregate({
        where: {
          tenantId,
          status: 'PENDING',
        },
        _sum: { total: true },
      });

      // Get low stock products
      const products = await prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        select: {
          name: true,
          stock: true,
          minStock: true,
        },
      });

      const lowStockProducts = products
        .filter(p => p.stock <= p.minStock && p.stock > 0)
        .map(p => ({
          name: p.name,
          stock: Number(p.stock),
          minStock: Number(p.minStock),
        }));

      const outOfStock = products.filter(p => p.stock === 0).length;

      // Generate HTML report
      const reportHtml = this.generateReportHTML({
        tenantId,
        tenantName: tenant.name,
        tenantEmail: tenant.email,
        date: today,
        sales: {
          totalRevenue,
          totalOrders,
          totalItems,
        },
        cash: {
          cashIn,
          cashOut,
        },
        debts: {
          totalReceivables: Number(receivables._sum.total || 0),
          totalPayables: Number(payables._sum.total || 0),
        },
        stock: {
          lowStock: lowStockProducts.length,
          outOfStock,
          lowStockProducts: lowStockProducts.slice(0, 10), // Limit to 10
        },
      });

      // Save to file
      const fileName = `backup-${tenantId}-${today.toISOString().split('T')[0]}.html`;
      const filePath = path.join(this.backupDir, tenantId, fileName);
      
      // Ensure tenant directory exists
      const tenantDir = path.join(this.backupDir, tenantId);
      if (!fs.existsSync(tenantDir)) {
        fs.mkdirSync(tenantDir, { recursive: true });
      }

      fs.writeFileSync(filePath, reportHtml, 'utf8');
      const fileSize = fs.statSync(filePath).size;

      // Send email
      let emailSentAt: Date | null = null;
      let emailError: string | null = null;

      try {
        const adminEmail = tenant.users[0]?.email || tenant.email;
        await sendEmail(
          adminEmail,
          `Laporan Harian ${tenant.name} - ${today.toLocaleDateString('id-ID')}`,
          reportHtml
        );
        emailSentAt = new Date();
        logger.info(`✅ Daily backup email sent to ${adminEmail} for tenant ${tenantId}`);
      } catch (emailErr: any) {
        emailError = emailErr.message || 'Failed to send email';
        logger.error(`❌ Failed to send backup email to tenant ${tenantId}:`, emailErr);
      }

      // Create backup log
      const backupLog = await prisma.backupLog.create({
        data: {
          tenantId,
          status: emailError ? 'email_failed' : 'success',
          generatedAt: new Date(),
          emailSentAt,
          size: fileSize,
          filePath,
          errorMessage: emailError,
        },
      });

      return {
        success: true,
        backupLogId: backupLog.id,
        filePath,
      };
    } catch (error: any) {
      logger.error(`❌ Failed to generate daily backup for tenant ${tenantId}:`, error);
      
      // Create failed backup log
      try {
        await prisma.backupLog.create({
          data: {
            tenantId,
            status: 'failed',
            generatedAt: new Date(),
            size: 0,
            filePath: '',
            errorMessage: error.message || 'Unknown error',
          },
        });
      } catch (logError) {
        logger.error('Failed to create backup log:', logError);
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Generate HTML report
   */
  private generateReportHTML(report: DailyBackupReport): string {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(value);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    };

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Harian - ${report.tenantName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #2563eb;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background: #f3f4f6;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 15px 0;
    }
    .danger {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 15px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Laporan Harian ${report.tenantName}</h1>
    <p><strong>Tanggal:</strong> ${formatDate(report.date)}</p>

    <div class="summary">
      <div class="summary-card">
        <h3>Total Pendapatan</h3>
        <div class="value">${formatCurrency(report.sales.totalRevenue)}</div>
      </div>
      <div class="summary-card">
        <h3>Total Transaksi</h3>
        <div class="value">${report.sales.totalOrders}</div>
      </div>
      <div class="summary-card">
        <h3>Total Item Terjual</h3>
        <div class="value">${report.sales.totalItems}</div>
      </div>
    </div>

    <h2>💰 Kas Masuk & Keluar</h2>
    <div class="section">
      <table>
        <tr>
          <th>Kas Masuk</th>
          <th>Kas Keluar</th>
          <th>Saldo</th>
        </tr>
        <tr>
          <td>${formatCurrency(report.cash.cashIn)}</td>
          <td>${formatCurrency(report.cash.cashOut)}</td>
          <td><strong>${formatCurrency(report.cash.cashIn - report.cash.cashOut)}</strong></td>
        </tr>
      </table>
    </div>

    <h2>💳 Hutang & Piutang</h2>
    <div class="section">
      <table>
        <tr>
          <th>Total Piutang</th>
          <th>Total Hutang</th>
        </tr>
        <tr>
          <td>${formatCurrency(report.debts.totalReceivables)}</td>
          <td>${formatCurrency(report.debts.totalPayables)}</td>
        </tr>
      </table>
    </div>

    <h2>📦 Status Stok</h2>
    <div class="section">
      ${report.stock.outOfStock > 0 ? `
        <div class="danger">
          <strong>⚠️ Peringatan:</strong> Ada ${report.stock.outOfStock} produk yang stoknya habis!
        </div>
      ` : ''}
      ${report.stock.lowStock > 0 ? `
        <div class="warning">
          <strong>⚠️ Perhatian:</strong> Ada ${report.stock.lowStock} produk yang stoknya menipis!
        </div>
      ` : ''}
      
      ${report.stock.lowStockProducts.length > 0 ? `
        <table>
          <tr>
            <th>Nama Produk</th>
            <th>Stok Saat Ini</th>
            <th>Stok Minimal</th>
          </tr>
          ${report.stock.lowStockProducts.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.stock}</td>
              <td>${p.minStock}</td>
            </tr>
          `).join('')}
        </table>
      ` : '<p>✅ Semua produk memiliki stok yang cukup.</p>'}
    </div>

    <div class="footer">
      <p>Laporan ini dikirim otomatis setiap hari pukul 23:59 WIB</p>
      <p>© ${new Date().getFullYear()} Warungin - Sistem Kasir Modern untuk UMKM</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate daily backup for all active tenants
   */
  async generateAllDailyBackups(): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    try {
      const tenants = await prisma.tenant.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      let success = 0;
      let failed = 0;

      for (const tenant of tenants) {
        const result = await this.generateDailyBackup(tenant.id);
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      }

      logger.info(`✅ Daily backup completed: ${success} success, ${failed} failed out of ${tenants.length} tenants`);

      return {
        total: tenants.length,
        success,
        failed,
      };
    } catch (error: any) {
      logger.error('❌ Failed to generate all daily backups:', error);
      throw error;
    }
  }

  /**
   * Regenerate backup for a tenant
   */
  async regenerateBackup(tenantId: string): Promise<{
    success: boolean;
    backupLogId?: string;
    filePath?: string;
    error?: string;
  }> {
    return this.generateDailyBackup(tenantId);
  }

  /**
   * Resend backup email
   */
  async resendBackupEmail(backupLogId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const backupLog = await prisma.backupLog.findUnique({
        where: { id: backupLogId },
        include: {
          tenant: {
            include: {
              users: {
                where: { role: 'ADMIN_TENANT' },
                take: 1,
              },
            },
          },
        },
      });

      if (!backupLog) {
        throw new Error('Backup log not found');
      }

      if (!fs.existsSync(backupLog.filePath)) {
        throw new Error('Backup file not found');
      }

      const reportHtml = fs.readFileSync(backupLog.filePath, 'utf8');
      const adminEmail = backupLog.tenant.users[0]?.email || backupLog.tenant.email;
      const reportDate = new Date(backupLog.generatedAt);

      await sendEmail(
        adminEmail,
        `Laporan Harian ${backupLog.tenant.name} - ${reportDate.toLocaleDateString('id-ID')}`,
        reportHtml
      );

      // Update backup log
      await prisma.backupLog.update({
        where: { id: backupLogId },
        data: {
          emailSentAt: new Date(),
          status: 'success',
          errorMessage: null,
        },
      });

      logger.info(`✅ Backup email resent for tenant ${backupLog.tenantId}`);

      return { success: true };
    } catch (error: any) {
      logger.error(`❌ Failed to resend backup email:`, error);
      
      // Update backup log with error
      try {
        await prisma.backupLog.update({
          where: { id: backupLogId },
          data: {
            status: 'email_failed',
            errorMessage: error.message || 'Unknown error',
          },
        });
      } catch (logError) {
        logger.error('Failed to update backup log:', logError);
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}

export default new DailyBackupService();
