import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type RetentionPolicy = {
  orders: number;
  transactions: number;
  reports: number;
  auditLogs: number;
  contactSubmissions: number;
  demoRequests: number;
};

@Injectable()
export class RetentionService {
  constructor(private readonly prisma: PrismaService) {}

  private defaultPolicy(): RetentionPolicy {
    return {
      orders: 730,
      transactions: 730,
      reports: 730,
      auditLogs: 730,
      contactSubmissions: 730,
      demoRequests: 730,
    };
  }

  private normalizeDays(days?: number, fallback = 730): number {
    if (!days || Number.isNaN(days)) return fallback;
    return Math.max(30, Math.min(3650, Number(days)));
  }

  private cutoffDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - this.normalizeDays(days));
    return d;
  }

  parsePolicy(rawPolicy?: string): RetentionPolicy {
    const defaults = this.defaultPolicy();
    if (!rawPolicy) return defaults;

    try {
      const parsed = JSON.parse(rawPolicy);
      return {
        orders: this.normalizeDays(parsed?.orders, defaults.orders),
        transactions: this.normalizeDays(
          parsed?.transactions,
          defaults.transactions,
        ),
        reports: this.normalizeDays(parsed?.reports, defaults.reports),
        auditLogs: this.normalizeDays(parsed?.auditLogs, defaults.auditLogs),
        contactSubmissions: this.normalizeDays(
          parsed?.contactSubmissions,
          defaults.contactSubmissions,
        ),
        demoRequests: this.normalizeDays(
          parsed?.demoRequests,
          defaults.demoRequests,
        ),
      };
    } catch {
      return defaults;
    }
  }

  async getStats(policy: RetentionPolicy) {
    const [
      ordersToDelete,
      transactionsToDelete,
      reportsToDelete,
      auditLogsToDelete,
      contactSubmissionsToDelete,
      demoRequestsToDelete,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { lt: this.cutoffDate(policy.orders) } },
      }),
      this.prisma.transaction.count({
        where: { createdAt: { lt: this.cutoffDate(policy.transactions) } },
      }),
      this.prisma.report.count({
        where: { createdAt: { lt: this.cutoffDate(policy.reports) } },
      }),
      this.prisma.auditLog.count({
        where: { createdAt: { lt: this.cutoffDate(policy.auditLogs) } },
      }),
      this.prisma.contactSubmission.count({
        where: {
          createdAt: { lt: this.cutoffDate(policy.contactSubmissions) },
          type: { not: "demo" },
        },
      }),
      this.prisma.contactSubmission.count({
        where: {
          createdAt: { lt: this.cutoffDate(policy.demoRequests) },
          type: "demo",
        },
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
  }

  async applyOrders(days: number) {
    const result = await this.prisma.order.deleteMany({
      where: { createdAt: { lt: this.cutoffDate(days) } },
    });
    return { deletedCount: result.count };
  }

  async applyTransactions(days: number) {
    const result = await this.prisma.transaction.deleteMany({
      where: { createdAt: { lt: this.cutoffDate(days) } },
    });
    return { deletedCount: result.count };
  }

  async applyReports(days: number) {
    const result = await this.prisma.report.deleteMany({
      where: { createdAt: { lt: this.cutoffDate(days) } },
    });
    return { deletedCount: result.count };
  }

  async applyAuditLogs(days: number) {
    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: this.cutoffDate(days) } },
    });
    return { deletedCount: result.count };
  }

  async applyContactSubmissions(days: number) {
    const result = await this.prisma.contactSubmission.deleteMany({
      where: {
        createdAt: { lt: this.cutoffDate(days) },
        type: { not: "demo" },
      },
    });
    return { deletedCount: result.count };
  }

  async applyDemoRequests(days: number) {
    const result = await this.prisma.contactSubmission.deleteMany({
      where: {
        createdAt: { lt: this.cutoffDate(days) },
        type: "demo",
      },
    });
    return { deletedCount: result.count };
  }

  async applyAll(policy: RetentionPolicy) {
    const [
      orders,
      transactions,
      reports,
      auditLogs,
      contactSubmissions,
      demoRequests,
    ] = await Promise.all([
      this.applyOrders(policy.orders),
      this.applyTransactions(policy.transactions),
      this.applyReports(policy.reports),
      this.applyAuditLogs(policy.auditLogs),
      this.applyContactSubmissions(policy.contactSubmissions),
      this.applyDemoRequests(policy.demoRequests),
    ]);

    return {
      results: {
        orders: orders.deletedCount,
        transactions: transactions.deletedCount,
        reports: reports.deletedCount,
        auditLogs: auditLogs.deletedCount,
        contactSubmissions: contactSubmissions.deletedCount,
        demoRequests: demoRequests.deletedCount,
      },
    };
  }
}
