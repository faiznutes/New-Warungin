import prisma from '../config/database';

interface FinancialSummary {
  revenue: number;
  revenueGrowth: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

interface ProfitLoss {
  revenue: number;
  discount: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  grossProfitMargin: number;
  netProfitMargin: number;
}

interface BalanceSheet {
  cash: number;
  receivables: number;
  inventory: number;
  totalAssets: number;
  liabilities: number;
  equity: number;
  totalLiabilities: number;
}

interface CashFlow {
  operating: { inflow: number; outflow: number; net: number };
  investing: { inflow: number; outflow: number; net: number };
  financing: { inflow: number; outflow: number; net: number };
  total: number;
}

class FinanceService {
  async getFinancialSummary(tenantId: string, startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const dateFilter = this.getDateFilter(startDate, endDate);
    const lastMonthFilter = this.getLastMonthFilter();

    // Current period revenue
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        ...dateFilter,
      },
      select: {
        total: true,
        discount: true,
      },
    });

    const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    const discount = orders.reduce((sum, order) => sum + parseFloat((order.discount || 0).toString()), 0);

    // Last month revenue for growth calculation
    const lastMonthOrders = await prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        ...lastMonthFilter,
      },
      select: {
        total: true,
      },
    });

    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Expenses (simplified - in production, you'd have an expenses table)
    const expenses = revenue * 0.3; // Mock: 30% of revenue as expenses
    const profit = revenue - discount - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      expenses,
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  }

  async getProfitLoss(tenantId: string, startDate?: string, endDate?: string): Promise<ProfitLoss> {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        ...dateFilter,
      },
      select: {
        total: true,
        discount: true,
        items: {
          include: {
            product: {
              select: {
                cost: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Calculate Revenue (total sales before discount)
    const revenue = orders.reduce((sum, order) => {
      // Revenue is the sum of all item prices * quantities before discount
      const orderRevenue = order.items.reduce((itemSum, item) => {
        return itemSum + (parseFloat(item.product.price.toString()) * item.quantity);
      }, 0);
      return sum + orderRevenue;
    }, 0);

    // Calculate Discount (total discounts applied)
    const discount = orders.reduce((sum, order) => sum + parseFloat((order.discount || 0).toString()), 0);

    // Calculate COGS (Cost of Goods Sold) - from product cost
    // Set 0 jika product tidak punya HPP/cost
    const cogs = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        // Get cost from database, default to 0 if not available or null
        const costValue = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
        const productCost = costValue > 0 ? costValue : 0;
        return itemSum + (productCost * item.quantity);
      }, 0);
    }, 0);

    // Calculate Gross Profit
    const grossProfit = revenue - discount - cogs;

    // Operating Expenses (mock - in production, this would come from expenses table)
    // Estimate as 15% of revenue for small business
    const operatingExpenses = revenue * 0.15;

    // Net Profit
    const netProfit = grossProfit - operatingExpenses;

    // Calculate margins
    const netRevenue = revenue - discount;
    const grossProfitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
    const netProfitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    return {
      revenue: Math.round(revenue * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      operatingExpenses: Math.round(operatingExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
      netProfitMargin: Math.round(netProfitMargin * 100) / 100,
    };
  }

  async getBalanceSheet(tenantId: string, startDate?: string, endDate?: string): Promise<BalanceSheet> {
    // Assets
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
      },
      select: {
        total: true,
        status: true,
      },
    });

    // Cash (completed orders)
    const cash = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    // Receivables (pending/processing orders)
    const receivables = orders
      .filter(o => o.status !== 'COMPLETED')
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    // Inventory value
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: {
        stock: true,
        price: true,
      },
    });

    const inventory = products.reduce((sum, product) => {
      return sum + (parseFloat(product.price.toString()) * product.stock);
    }, 0);

    const totalAssets = cash + receivables + inventory;

    // Liabilities (mock - in production, you'd have a liabilities table)
    const liabilities = 0;
    const equity = totalAssets - liabilities;
    const totalLiabilities = liabilities + equity;

    return {
      cash,
      receivables,
      inventory,
      totalAssets,
      liabilities,
      equity,
      totalLiabilities,
    };
  }

  async getCashFlow(tenantId: string, startDate?: string, endDate?: string): Promise<CashFlow> {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        ...dateFilter,
      },
      select: {
        total: true,
        status: true,
        items: {
          include: {
            product: {
              select: {
                cost: true,
              },
            },
          },
        },
      },
    });

    // Operating activities
    const operatingInflow = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    // Operating outflow - simplified estimate
    const operatingOutflow = operatingInflow * 0.6; // Estimate 60% as cost

    const operatingNet = operatingInflow - operatingOutflow;

    // Investing activities (mock)
    const investingOutflow = 0;
    const investingNet = -investingOutflow;

    // Financing activities (mock)
    const financingInflow = 0;
    const financingNet = financingInflow;

    const total = operatingNet + investingNet + financingNet;

    return {
      operating: {
        inflow: operatingInflow,
        outflow: operatingOutflow,
        net: operatingNet,
      },
      investing: {
        inflow: 0,
        outflow: investingOutflow,
        net: investingNet,
      },
      financing: {
        inflow: financingInflow,
        outflow: 0,
        net: financingNet,
      },
      total,
    };
  }

  private getDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      };
    }

    const filter: any = {};
    if (startDate) {
      filter.gte = new Date(startDate);
    }
    if (endDate) {
      filter.lte = new Date(endDate);
    }
    return filter.gte || filter.lte ? { createdAt: filter } : {};
  }

  private getLastMonthFilter() {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      createdAt: {
        gte: firstDayLastMonth,
        lte: lastDayLastMonth,
      },
    };
  }

  // Platform Profit Loss (for Super Admin - subscriptions & addons revenue)
  async getPlatformProfitLoss(startDate?: string, endDate?: string): Promise<ProfitLoss> {
    // Build date filter for subscriptions (createdAt) and addons (subscribedAt)
    let subscriptionFilter: any = {};
    let addonFilter: any = {};

    if (startDate || endDate) {
      const filter: any = {};
      if (startDate) {
        filter.gte = new Date(startDate);
        filter.gte.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        filter.lte = new Date(endDate);
        filter.lte.setHours(23, 59, 59, 999);
      }
      subscriptionFilter.createdAt = filter;
      addonFilter.subscribedAt = filter;
    } else {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      subscriptionFilter.createdAt = { gte: firstDay, lte: lastDay };
      addonFilter.subscribedAt = { gte: firstDay, lte: lastDay };
    }

    // Get subscriptions revenue
    const subscriptions = await prisma.subscription.findMany({
      where: subscriptionFilter,
      select: {
        amount: true,
      },
    });

    // Get addons revenue
    const addons = await prisma.tenantAddon.findMany({
      where: addonFilter,
      select: {
        addonId: true,
        config: true,
      },
    });

    const { AVAILABLE_ADDONS } = await import('./addon.service');
    const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

    // Calculate revenue
    let revenue = 0;
    subscriptions.forEach((sub) => {
      revenue += parseFloat(sub.amount.toString());
    });

    addons.forEach((addon) => {
      const price = addonPriceMap.get(addon.addonId) || 0;
      const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
        ? (addon.config as any).originalDuration || 30
        : 30;
      revenue += (price * duration) / 30;
    });

    // Platform doesn't have discounts
    const discount = 0;

    // COGS (Cost of Goods Sold) - Set 0 untuk subscription dan addons (tidak punya HPP)
    // Subscription dan addons adalah layanan digital, tidak ada cost of goods sold
    const cogs = 0;

    // Gross Profit
    const grossProfit = revenue - discount - cogs;

    // Operating Expenses - estimated as 30% of revenue (infrastructure, support, etc.)
    const operatingExpenses = revenue * 0.3;

    // Net Profit
    const netProfit = grossProfit - operatingExpenses;

    // Margins
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue: Math.round(revenue * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      operatingExpenses: Math.round(operatingExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
      netProfitMargin: Math.round(netProfitMargin * 100) / 100,
    };
  }

  // Platform Financial Summary (for Super Admin - subscriptions & addons revenue)
  async getPlatformFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const dateFilter = this.getDateFilter(startDate, endDate);
    const lastMonthFilter = this.getLastMonthFilter();

    // Get subscriptions revenue
    const subscriptions = await prisma.subscription.findMany({
      where: dateFilter,
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Get addons revenue
    const addons = await prisma.tenantAddon.findMany({
      where: dateFilter.createdAt ? { subscribedAt: dateFilter.createdAt } : {},
      select: {
        addonId: true,
        subscribedAt: true,
        config: true,
      },
    });

    const { AVAILABLE_ADDONS } = await import('./addon.service');
    const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

    // Calculate current period revenue
    let revenue = 0;
    subscriptions.forEach((sub) => {
      revenue += parseFloat(sub.amount.toString());
    });

    addons.forEach((addon) => {
      const price = addonPriceMap.get(addon.addonId) || 0;
      const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
        ? (addon.config as any).originalDuration || 30
        : 30;
      revenue += (price * duration) / 30;
    });

    // Get last month revenue for growth calculation
    const lastMonthSubscriptions = await prisma.subscription.findMany({
      where: lastMonthFilter,
      select: {
        amount: true,
      },
    });

    const lastMonthAddons = await prisma.tenantAddon.findMany({
      where: {
        subscribedAt: {
          gte: lastMonthFilter.createdAt.gte,
          lte: lastMonthFilter.createdAt.lte,
        },
      },
      select: {
        addonId: true,
        config: true,
      },
    });

    let lastMonthRevenue = 0;
    lastMonthSubscriptions.forEach((sub) => {
      lastMonthRevenue += parseFloat(sub.amount.toString());
    });

    lastMonthAddons.forEach((addon) => {
      const price = addonPriceMap.get(addon.addonId) || 0;
      const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
        ? (addon.config as any).originalDuration || 30
        : 30;
      lastMonthRevenue += (price * duration) / 30;
    });

    const revenueGrowth = lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Expenses - estimated as 30% of revenue (infrastructure, support, etc.)
    const expenses = revenue * 0.3;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue: Math.round(revenue * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  }

  // Platform Balance Sheet (for Super Admin)
  async getPlatformBalanceSheet(startDate?: string, endDate?: string): Promise<BalanceSheet> {
    // Platform doesn't have traditional balance sheet items
    // Return simplified version based on subscriptions & addons
    const dateFilter = this.getDateFilter(startDate, endDate);

    const subscriptions = await prisma.subscription.findMany({
      where: dateFilter,
      select: {
        amount: true,
      },
    });

    const addons = await prisma.tenantAddon.findMany({
      where: dateFilter.createdAt ? { subscribedAt: dateFilter.createdAt } : {},
      select: {
        addonId: true,
        config: true,
      },
    });

    const { AVAILABLE_ADDONS } = await import('./addon.service');
    const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

    let totalRevenue = 0;
    subscriptions.forEach((sub) => {
      totalRevenue += parseFloat(sub.amount.toString());
    });

    addons.forEach((addon) => {
      const price = addonPriceMap.get(addon.addonId) || 0;
      const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
        ? (addon.config as any).originalDuration || 30
        : 30;
      totalRevenue += (price * duration) / 30;
    });

    // Simplified balance sheet for platform
    return {
      cash: totalRevenue * 0.7, // 70% as cash
      receivables: totalRevenue * 0.2, // 20% as receivables
      inventory: 0, // Platform doesn't have inventory
      totalAssets: totalRevenue * 0.9,
      liabilities: totalRevenue * 0.1, // 10% as liabilities
      equity: totalRevenue * 0.8, // 80% as equity
      totalLiabilities: totalRevenue * 0.1,
    };
  }

  // Platform Cash Flow (for Super Admin)
  async getPlatformCashFlow(startDate?: string, endDate?: string): Promise<CashFlow> {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const subscriptions = await prisma.subscription.findMany({
      where: dateFilter,
      select: {
        amount: true,
      },
    });

    const addons = await prisma.tenantAddon.findMany({
      where: dateFilter.createdAt ? { subscribedAt: dateFilter.createdAt } : {},
      select: {
        addonId: true,
        config: true,
      },
    });

    const { AVAILABLE_ADDONS } = await import('./addon.service');
    const addonPriceMap = new Map(AVAILABLE_ADDONS.map(a => [a.id, a.price]));

    let totalRevenue = 0;
    subscriptions.forEach((sub) => {
      totalRevenue += parseFloat(sub.amount.toString());
    });

    addons.forEach((addon) => {
      const price = addonPriceMap.get(addon.addonId) || 0;
      const duration = addon.config && typeof addon.config === 'object' && 'originalDuration' in addon.config
        ? (addon.config as any).originalDuration || 30
        : 30;
      totalRevenue += (price * duration) / 30;
    });

    // Simplified cash flow for platform
    const operatingInflow = totalRevenue;
    const operatingOutflow = totalRevenue * 0.3; // 30% as expenses
    const operatingNet = operatingInflow - operatingOutflow;

    return {
      operating: {
        inflow: Math.round(operatingInflow * 100) / 100,
        outflow: Math.round(operatingOutflow * 100) / 100,
        net: Math.round(operatingNet * 100) / 100,
      },
      investing: {
        inflow: 0,
        outflow: 0,
        net: 0,
      },
      financing: {
        inflow: 0,
        outflow: 0,
        net: 0,
      },
      total: Math.round(operatingNet * 100) / 100,
    };
  }
}

export default new FinanceService();

