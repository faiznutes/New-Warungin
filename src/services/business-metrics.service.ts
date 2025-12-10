/**
 * Business Metrics Service
 * Updates Prometheus business metrics from database
 */

import prisma from '../config/database';
import logger from '../utils/logger';
import {
  totalRevenue,
  revenueByPaymentMethod,
  totalOrders,
  ordersByTenant,
  totalUsers,
  usersByTenant,
  totalProducts,
  productsByTenant,
  lowStockProducts,
  totalTenants,
  activeSubscriptions,
  activeAddons,
  averageOrderValue,
  totalCustomers,
} from '../utils/metrics';

export class BusinessMetricsService {
  /**
   * Update all business metrics
   * Call this periodically (e.g., every 5 minutes) to refresh metrics
   */
  async updateAllMetrics() {
    try {
      logger.info('Updating business metrics...');
      
      await Promise.all([
        this.updateRevenueMetrics(),
        this.updateOrderMetrics(),
        this.updateUserMetrics(),
        this.updateProductMetrics(),
        this.updateTenantMetrics(),
        this.updateSubscriptionMetrics(),
        this.updateAddonMetrics(),
        this.updateCustomerMetrics(),
      ]);
      
      logger.info('Business metrics updated successfully');
    } catch (error: any) {
      logger.error('Error updating business metrics:', error);
    }
  }

  /**
   * Update revenue metrics
   */
  private async updateRevenueMetrics() {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      const monthStart = new Date(now.setMonth(now.getMonth() - 1));

      // Total revenue - today
      const revenueToday = await prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      });

      // Total revenue - week
      const revenueWeek = await prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: weekStart },
        },
        _sum: { amount: true },
      });

      // Total revenue - month
      const revenueMonth = await prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      });

      // Total revenue - all time
      const revenueAllTime = await prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      });

      totalRevenue.set({ period: 'today' }, Number(revenueToday._sum.amount || 0));
      totalRevenue.set({ period: 'week' }, Number(revenueWeek._sum.amount || 0));
      totalRevenue.set({ period: 'month' }, Number(revenueMonth._sum.amount || 0));
      totalRevenue.set({ period: 'all_time' }, Number(revenueAllTime._sum.amount || 0));

      // Revenue by payment method - today
      const revenueByMethod = await prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: {
          status: 'COMPLETED',
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      });

      revenueByMethod.forEach((item) => {
        revenueByPaymentMethod.set(
          { payment_method: item.paymentMethod || 'UNKNOWN', period: 'today' },
          Number(item._sum.amount || 0)
        );
      });
    } catch (error: any) {
      logger.error('Error updating revenue metrics:', error);
    }
  }

  /**
   * Update order metrics
   */
  private async updateOrderMetrics() {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      const monthStart = new Date(now.setMonth(now.getMonth() - 1));

      // Orders by status - today
      const ordersToday = await prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: todayStart } },
        _count: { id: true },
      });

      ordersToday.forEach((item) => {
        totalOrders.set({ status: item.status, period: 'today' }, item._count.id);
      });

      // Orders by status - week
      const ordersWeek = await prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: weekStart } },
        _count: { id: true },
      });

      ordersWeek.forEach((item) => {
        totalOrders.set({ status: item.status, period: 'week' }, item._count.id);
      });

      // Orders by status - month
      const ordersMonth = await prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: monthStart } },
        _count: { id: true },
      });

      ordersMonth.forEach((item) => {
        totalOrders.set({ status: item.status, period: 'month' }, item._count.id);
      });

      // Orders by status - all time
      const ordersAllTime = await prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      ordersAllTime.forEach((item) => {
        totalOrders.set({ status: item.status, period: 'all_time' }, item._count.id);
      });

      // Orders by tenant
      const ordersByTenantData = await prisma.order.groupBy({
        by: ['tenantId', 'status'],
        _count: { id: true },
      });

      ordersByTenantData.forEach((item) => {
        ordersByTenant.set(
          { tenant_id: item.tenantId, status: item.status },
          item._count.id
        );
      });

      // Average order value - today
      const avgOrderValueToday = await prisma.order.aggregate({
        where: { createdAt: { gte: todayStart } },
        _avg: { total: true },
      });

      averageOrderValue.set(
        { period: 'today' },
        Number(avgOrderValueToday._avg.total || 0)
      );

      // Average order value - week
      const avgOrderValueWeek = await prisma.order.aggregate({
        where: { createdAt: { gte: weekStart } },
        _avg: { total: true },
      });

      averageOrderValue.set(
        { period: 'week' },
        Number(avgOrderValueWeek._avg.total || 0)
      );

      // Average order value - month
      const avgOrderValueMonth = await prisma.order.aggregate({
        where: { createdAt: { gte: monthStart } },
        _avg: { total: true },
      });

      averageOrderValue.set(
        { period: 'month' },
        Number(avgOrderValueMonth._avg.total || 0)
      );
    } catch (error: any) {
      logger.error('Error updating order metrics:', error);
    }
  }

  /**
   * Update user metrics
   */
  private async updateUserMetrics() {
    try {
      // Users by role and status
      const usersByRoleStatus = await prisma.user.groupBy({
        by: ['role', 'status'],
        _count: { id: true },
      });

      usersByRoleStatus.forEach((item) => {
        totalUsers.set(
          { role: item.role, status: item.status || 'active' },
          item._count.id
        );
      });

      // Users by tenant and role
      const usersByTenantData = await prisma.user.groupBy({
        by: ['tenantId', 'role'],
        where: { tenantId: { not: null } },
        _count: { id: true },
      });

      usersByTenantData.forEach((item) => {
        usersByTenant.set(
          { tenant_id: item.tenantId || 'unknown', role: item.role },
          item._count.id
        );
      });
    } catch (error: any) {
      logger.error('Error updating user metrics:', error);
    }
  }

  /**
   * Update product metrics
   */
  private async updateProductMetrics() {
    try {
      // Products by status
      const productsByStatus = await prisma.product.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      productsByStatus.forEach((item) => {
        totalProducts.set({ status: item.status || 'active' }, item._count.id);
      });

      // Products by tenant and status
      const productsByTenantData = await prisma.product.groupBy({
        by: ['tenantId', 'status'],
        _count: { id: true },
      });

      productsByTenantData.forEach((item) => {
        productsByTenant.set(
          { tenant_id: item.tenantId, status: item.status || 'active' },
          item._count.id
        );
      });

      // Low stock products (stock < 10)
      const lowStockData = await prisma.product.groupBy({
        by: ['tenantId'],
        where: {
          stock: { lt: 10 },
          status: 'active',
        },
        _count: { id: true },
      });

      lowStockData.forEach((item) => {
        lowStockProducts.set({ tenant_id: item.tenantId }, item._count.id);
      });
    } catch (error: any) {
      logger.error('Error updating product metrics:', error);
    }
  }

  /**
   * Update tenant metrics
   */
  private async updateTenantMetrics() {
    try {
      // Tenants by status
      const tenantsByStatus = await prisma.tenant.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      tenantsByStatus.forEach((item) => {
        totalTenants.set({ status: item.status || 'active' }, item._count.id);
      });
    } catch (error: any) {
      logger.error('Error updating tenant metrics:', error);
    }
  }

  /**
   * Update subscription metrics
   */
  private async updateSubscriptionMetrics() {
    try {
      // Active subscriptions by plan
      const subscriptionsByPlan = await prisma.subscription.groupBy({
        by: ['planType'],
        where: {
          status: 'ACTIVE',
          expiresAt: { gte: new Date() },
        },
        _count: { id: true },
      });

      subscriptionsByPlan.forEach((item) => {
        activeSubscriptions.set({ plan_type: item.planType }, item._count.id);
      });
    } catch (error: any) {
      logger.error('Error updating subscription metrics:', error);
    }
  }

  /**
   * Update addon metrics
   */
  private async updateAddonMetrics() {
    try {
      // Active addons by type
      const addonsByType = await prisma.tenantAddon.groupBy({
        by: ['addonType'],
        where: {
          status: 'ACTIVE',
          expiresAt: { gte: new Date() },
        },
        _count: { id: true },
      });

      addonsByType.forEach((item) => {
        activeAddons.set({ addon_type: item.addonType }, item._count.id);
      });
    } catch (error: any) {
      logger.error('Error updating addon metrics:', error);
    }
  }

  /**
   * Update customer metrics
   */
  private async updateCustomerMetrics() {
    try {
      // Customers by tenant
      const customersByTenant = await prisma.customer.groupBy({
        by: ['tenantId'],
        _count: { id: true },
      });

      customersByTenant.forEach((item) => {
        totalCustomers.set({ tenant_id: item.tenantId }, item._count.id);
      });
    } catch (error: any) {
      logger.error('Error updating customer metrics:', error);
    }
  }
}

export default new BusinessMetricsService();

