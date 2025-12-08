/**
 * Data Retention Policy Service
 * Automatically deletes data based on retention policies
 */

import prisma from '../config/database';
import logger from '../utils/logger';

export interface RetentionPolicy {
  orders: number; // Days to keep orders
  transactions: number; // Days to keep transactions
  reports: number; // Days to keep reports
  auditLogs: number; // Days to keep audit logs
  contactSubmissions: number; // Days to keep contact submissions
  demoRequests: number; // Days to keep demo requests
}

export class RetentionService {
  private defaultPolicy: RetentionPolicy = {
    orders: 730, // 2 years (for SUPER_ADMIN)
    transactions: 730, // 2 years
    reports: 730, // 2 years
    auditLogs: 730, // 2 years
    contactSubmissions: 730, // 2 years
    demoRequests: 730, // 2 years
  };

  /**
   * Apply retention policy for orders
   */
  async applyOrdersRetention(tenantId: string, days: number = 730): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.order.deleteMany({
      where: {
        tenantId,
        createdAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
    });

    logger.info('Orders retention applied', {
      tenantId,
      days,
      deletedCount: deleted.count,
    });

    return deleted.count;
  }

  /**
   * Apply retention policy for transactions
   */
  async applyTransactionsRetention(tenantId: string, days: number = 730): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.transaction.deleteMany({
      where: {
        tenantId,
        createdAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'FAILED'] },
      },
    });

    logger.info('Transactions retention applied', {
      tenantId,
      days,
      deletedCount: deleted.count,
    });

    return deleted.count;
  }

  /**
   * Apply retention policy for reports
   */
  async applyReportsRetention(tenantId: string, days: number = 730): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.report.deleteMany({
      where: {
        tenantId,
        createdAt: { lt: cutoffDate },
      },
    });

    logger.info('Reports retention applied', {
      tenantId,
      days,
      deletedCount: deleted.count,
    });

    return deleted.count;
  }

  /**
   * Apply retention policy for audit logs
   */
  async applyAuditLogsRetention(tenantId: string, days: number = 730): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.auditLog.deleteMany({
      where: {
        tenantId,
        createdAt: { lt: cutoffDate },
      },
    });

    logger.info('Audit logs retention applied', {
      tenantId,
      days,
      deletedCount: deleted.count,
    });

    return deleted.count;
  }

  /**
   * Apply retention policy for contact submissions
   */
  async applyContactSubmissionsRetention(days: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.contactSubmission.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    logger.info('Contact submissions retention applied', {
      days,
      deletedCount: deleted.count,
    });

    return deleted.count;
  }

  /**
   * Apply retention policy for demo requests
   */
  async applyDemoRequestsRetention(days: number = 730): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.demoRequest.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    logger.info('Demo requests retention applied', {
      days,
      deletedCount: deleted.count,
    });

    return deleted.count;
  }

  /**
   * Apply all retention policies for tenant
   */
  async applyAllRetentionPolicies(tenantId: string, policy?: Partial<RetentionPolicy>): Promise<{
    orders: number;
    transactions: number;
    reports: number;
    auditLogs: number;
    contactSubmissions: number;
    demoRequests: number;
  }> {
    const finalPolicy = { ...this.defaultPolicy, ...policy };

    const [orders, transactions, reports, auditLogs, contactSubmissions, demoRequests] = await Promise.all([
      this.applyOrdersRetention(tenantId, finalPolicy.orders),
      this.applyTransactionsRetention(tenantId, finalPolicy.transactions),
      this.applyReportsRetention(tenantId, finalPolicy.reports),
      this.applyAuditLogsRetention(tenantId, finalPolicy.auditLogs),
      this.applyContactSubmissionsRetention(finalPolicy.contactSubmissions),
      this.applyDemoRequestsRetention(finalPolicy.demoRequests),
    ]);

    return {
      orders,
      transactions,
      reports,
      auditLogs,
      contactSubmissions,
      demoRequests,
    };
  }

  /**
   * Get retention policy statistics
   */
  async getRetentionStats(tenantId: string, policy?: Partial<RetentionPolicy>): Promise<{
    ordersToDelete: number;
    transactionsToDelete: number;
    reportsToDelete: number;
    auditLogsToDelete: number;
    contactSubmissionsToDelete: number;
    demoRequestsToDelete: number;
  }> {
    try {
    const finalPolicy = { ...this.defaultPolicy, ...policy };

    const cutoffOrders = new Date();
    cutoffOrders.setDate(cutoffOrders.getDate() - finalPolicy.orders);

    const cutoffTransactions = new Date();
    cutoffTransactions.setDate(cutoffTransactions.getDate() - finalPolicy.transactions);

    const cutoffReports = new Date();
    cutoffReports.setDate(cutoffReports.getDate() - finalPolicy.reports);

    const cutoffAuditLogs = new Date();
    cutoffAuditLogs.setDate(cutoffAuditLogs.getDate() - finalPolicy.auditLogs);

    const cutoffContactSubmissions = new Date();
    cutoffContactSubmissions.setDate(cutoffContactSubmissions.getDate() - finalPolicy.contactSubmissions);

    const cutoffDemoRequests = new Date();
    cutoffDemoRequests.setDate(cutoffDemoRequests.getDate() - finalPolicy.demoRequests);

    const [
      ordersToDelete,
      transactionsToDelete,
      reportsToDelete,
      auditLogsToDelete,
      contactSubmissionsToDelete,
      demoRequestsToDelete,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          tenantId,
          createdAt: { lt: cutoffOrders },
          status: { in: ['COMPLETED', 'CANCELLED'] },
        },
        }).catch((error) => {
          logger.error('Error counting orders for retention:', { tenantId, error });
          return 0;
      }),
      prisma.transaction.count({
        where: {
          tenantId,
          createdAt: { lt: cutoffTransactions },
          status: { in: ['COMPLETED', 'FAILED'] },
        },
        }).catch((error) => {
          logger.error('Error counting transactions for retention:', { tenantId, error });
          return 0;
      }),
      prisma.report.count({
        where: {
          tenantId,
          createdAt: { lt: cutoffReports },
        },
        }).catch((error) => {
          logger.error('Error counting reports for retention:', { tenantId, error });
          return 0;
      }),
      prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: { lt: cutoffAuditLogs },
        },
        }).catch((error) => {
          logger.error('Error counting audit logs for retention:', { tenantId, error });
          return 0;
      }),
      prisma.contactSubmission.count({
        where: {
          createdAt: { lt: cutoffContactSubmissions },
        },
        }).catch((error) => {
          logger.error('Error counting contact submissions for retention:', { error });
          return 0;
      }),
      prisma.demoRequest.count({
        where: {
          createdAt: { lt: cutoffDemoRequests },
        },
        }).catch((error) => {
          logger.error('Error counting demo requests for retention:', { error });
          return 0;
      }),
    ]);

    return {
      ordersToDelete,
      transactionsToDelete,
      reportsToDelete,
      auditLogsToDelete,
      contactSubmissionsToDelete,
      demoRequestsToDelete,
    };
    } catch (error: any) {
      logger.error('Error getting retention stats:', { tenantId, error: error.message, stack: error.stack });
      // Return default values on error
      return {
        ordersToDelete: 0,
        transactionsToDelete: 0,
        reportsToDelete: 0,
        auditLogsToDelete: 0,
        contactSubmissionsToDelete: 0,
        demoRequestsToDelete: 0,
      };
    }
  }
}

export default new RetentionService();

