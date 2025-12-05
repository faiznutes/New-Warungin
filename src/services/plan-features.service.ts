import prisma from '../config/database';
import addonService from './addon.service';

/**
 * Plan base limits (without addons)
 * Basic: Simpel, fitur dasar
 * Pro: Sedikit lebih bagus, tidak terlalu merugikan
 * CUSTOM/MAX: Full fitur + semua addons
 */
const PLAN_FEATURES: Record<string, {
  tenantsLimit: number;
  products: number;
  users: number;
  outlets: number;
  addons: string[];
  access: string[];
  features: {
    products: boolean;
    inventory: boolean;
    orders: boolean;
    pos: boolean;
    delivery: boolean;
    customers: boolean;
    members: boolean;
    reports: boolean;
    advancedReporting: boolean;
    advancedAnalytics: boolean;
    financialManagement: boolean;
    profitLoss: boolean;
    marketing: boolean;
    emailMarketing: boolean;
    stores: boolean;
    rewards: boolean;
    discounts: boolean;
    receiptTemplates: boolean;
    userManagement: boolean;
    subscription: boolean;
    addons: boolean;
    settings: boolean;
    webhooks: boolean;
    sessions: boolean;
    passwordSettings: boolean;
    gdpr: boolean;
    twoFactor: boolean;
  };
}> = {
  BASIC: {
    tenantsLimit: 1,
    products: 25,
    users: 4, // 1 admin + 2 kasir + 1 kitchen
    outlets: 1,
    addons: [],
    access: ['kasir', 'laporan-dasar'],
    features: {
      products: true, // Kelola produk (basic)
      inventory: false,
      orders: true, // Kelola pesanan (basic)
      pos: true, // Point of Sale
      delivery: false,
      customers: true, // Kelola pelanggan (basic)
      members: true, // Member management (basic)
      reports: true, // Laporan penjualan (basic)
      advancedReporting: false,
      advancedAnalytics: false,
      financialManagement: false,
      profitLoss: false,
      marketing: false,
      emailMarketing: false,
      stores: false, // Multi-outlet
      rewards: false,
      discounts: false,
      receiptTemplates: true, // Basic receipt
      userManagement: false,
      subscription: false,
      addons: false,
      settings: true, // Store Settings, Password, GDPR
      webhooks: false,
      sessions: false,
      passwordSettings: true,
      gdpr: true,
      twoFactor: false,
    },
  },
  PRO: {
    tenantsLimit: 1,
    products: 100,
    users: 10, // 1 admin + 1 supervisor + 6 kasir + 2 kitchen
    outlets: 2,
    addons: [],
    access: ['kasir', 'laporan', 'manajemen-stok', 'multi-outlet'],
    features: {
      products: true, // Kelola produk + Product Adjustments
      inventory: true, // Suppliers, Purchase Orders, Stock Transfers, Stock Alerts
      orders: true, // Kelola pesanan (full)
      pos: true, // Point of Sale
      delivery: false, // Addon
      customers: true, // Kelola pelanggan (full)
      members: true, // Member management (full)
      reports: true, // Laporan penjualan (full)
      advancedReporting: false, // Addon
      advancedAnalytics: false, // Addon
      financialManagement: false, // Addon
      profitLoss: false, // Addon
      marketing: false, // Addon
      emailMarketing: false, // Addon
      stores: true, // Multi-outlet (2 outlets)
      rewards: true, // Rewards system
      discounts: true, // Discounts
      receiptTemplates: true, // Advanced receipt
      userManagement: true, // User Management
      subscription: true, // Subscription management
      addons: true, // Addon management
      settings: true, // All settings
      webhooks: true, // Webhooks
      sessions: true, // Sessions
      passwordSettings: true,
      gdpr: true,
      twoFactor: true, // 2FA Settings
    },
  },
  CUSTOM: {
    tenantsLimit: -1, // Unlimited
    products: -1, // Unlimited
    users: -1, // Unlimited
    outlets: -1, // Unlimited
    addons: [], // All addons available
    access: ['semua'],
    features: {
      products: true,
      inventory: true,
      orders: true,
      pos: true,
      delivery: true, // All addons enabled
      customers: true,
      members: true,
      reports: true,
      advancedReporting: true,
      advancedAnalytics: true,
      financialManagement: true,
      profitLoss: true,
      marketing: true,
      emailMarketing: true,
      stores: true, // Unlimited outlets
      rewards: true,
      discounts: true,
      receiptTemplates: true,
      userManagement: true,
      subscription: true,
      addons: true,
      settings: true,
      webhooks: true,
      sessions: true,
      passwordSettings: true,
      gdpr: true,
      twoFactor: true,
    },
  },
};

// Alias untuk backward compatibility (support ENTERPRISE as CUSTOM)
const PLAN_BASE_LIMITS: Record<string, {
  products: number;
  users: number;
  outlets: number;
  features: string[];
}> = {
  BASIC: {
    products: PLAN_FEATURES.BASIC.products,
    users: PLAN_FEATURES.BASIC.users,
    outlets: PLAN_FEATURES.BASIC.outlets,
    features: PLAN_FEATURES.BASIC.access,
  },
  PRO: {
    products: PLAN_FEATURES.PRO.products,
    users: PLAN_FEATURES.PRO.users,
    outlets: PLAN_FEATURES.PRO.outlets,
    features: PLAN_FEATURES.PRO.access,
  },
  CUSTOM: {
    products: PLAN_FEATURES.CUSTOM.products,
    users: PLAN_FEATURES.CUSTOM.users,
    outlets: PLAN_FEATURES.CUSTOM.outlets,
    features: PLAN_FEATURES.CUSTOM.access,
  },
  // Backward compatibility
  ENTERPRISE: {
    products: PLAN_FEATURES.CUSTOM.products,
    users: PLAN_FEATURES.CUSTOM.users,
    outlets: PLAN_FEATURES.CUSTOM.outlets,
    features: PLAN_FEATURES.CUSTOM.access,
  },
};

/**
 * Apply plan features to tenant
 * Update features, tenantsLimit, dan semua limit terkait
 */
export async function applyPlanFeatures(tenantId: string, planName: string) {
  // Invalidate plan features cache when plan changes
  try {
    const CacheService = (await import('../utils/cache')).default;
    await CacheService.delete(`plan-features:${tenantId}`);
  } catch (error: any) {
    // Log but don't fail
    const logger = (await import('../utils/logger')).default;
    logger.warn('Failed to invalidate plan features cache', { error: error.message, tenantId });
  }
  
  let plan = (planName || 'BASIC').toUpperCase();
  // Backward compatibility: ENTERPRISE -> CUSTOM
  if (plan === 'ENTERPRISE') plan = 'CUSTOM';
  const planKey = plan as 'BASIC' | 'PRO' | 'CUSTOM';
  const planConfig = PLAN_FEATURES[planKey] || PLAN_FEATURES.BASIC;

  // Get current tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: {
        where: { isActive: true },
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Update tenant with new plan features
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      tenantsLimit: planConfig.tenantsLimit,
      features: planConfig as any, // Store full plan config as JSON
    },
  });

  // Auto-disable users that exceed the limit
  // Priority: ADMIN_TENANT always stays active, then CASHIER, then KITCHEN, then SUPERVISOR
  if (planConfig.users !== -1) {
    const activeUsers = tenant.users;
    if (activeUsers.length > planConfig.users) {
      // Separate users by role for priority-based disabling
      const adminUsers = activeUsers.filter(u => u.role === 'ADMIN_TENANT');
      const cashierUsers = activeUsers.filter(u => u.role === 'CASHIER');
      const kitchenUsers = activeUsers.filter(u => u.role === 'KITCHEN');
      const supervisorUsers = activeUsers.filter(u => u.role === 'SUPERVISOR');
      
      // Sort each group by creation date (oldest first)
      adminUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      cashierUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      kitchenUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      supervisorUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // Calculate how many users we can keep
      let remainingSlots = planConfig.users;
      const usersToKeep: typeof activeUsers = [];
      const usersToDisable: typeof activeUsers = [];
      
      // Keep all ADMIN_TENANT (always)
      usersToKeep.push(...adminUsers);
      remainingSlots -= adminUsers.length;
      
      // Keep CASHIER users (priority after admin)
      if (remainingSlots > 0) {
        const cashierToKeep = cashierUsers.slice(0, Math.min(remainingSlots, cashierUsers.length));
        usersToKeep.push(...cashierToKeep);
        remainingSlots -= cashierToKeep.length;
        usersToDisable.push(...cashierUsers.slice(cashierToKeep.length));
      } else {
        usersToDisable.push(...cashierUsers);
      }
      
      // Keep KITCHEN users
      if (remainingSlots > 0) {
        const kitchenToKeep = kitchenUsers.slice(0, Math.min(remainingSlots, kitchenUsers.length));
        usersToKeep.push(...kitchenToKeep);
        remainingSlots -= kitchenToKeep.length;
        usersToDisable.push(...kitchenUsers.slice(kitchenToKeep.length));
      } else {
        usersToDisable.push(...kitchenUsers);
      }
      
      // Keep SUPERVISOR users (lowest priority)
      if (remainingSlots > 0) {
        const supervisorToKeep = supervisorUsers.slice(0, Math.min(remainingSlots, supervisorUsers.length));
        usersToKeep.push(...supervisorToKeep);
        usersToDisable.push(...supervisorUsers.slice(supervisorToKeep.length));
      } else {
        usersToDisable.push(...supervisorUsers);
      }
      
      // Disable users that exceed limit
      for (const user of usersToDisable) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false },
        });
      }
    }
  }

  // Auto-disable outlets that exceed the limit
  if (planConfig.outlets !== -1) {
    const activeOutlets = await prisma.outlet.findMany({
      where: { tenantId, isActive: true },
    });

    if (activeOutlets.length > planConfig.outlets) {
      const sortedOutlets = activeOutlets.sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );
      
      const outletsToDisable = sortedOutlets.slice(planConfig.outlets);
      for (const outlet of outletsToDisable) {
        await prisma.outlet.update({
          where: { id: outlet.id },
          data: { isActive: false },
        });
      }
    }
  }

  // Auto-disable products that exceed the limit
  if (planConfig.products !== -1) {
    const activeProducts = await prisma.product.findMany({
      where: { tenantId, isActive: true },
    });

    if (activeProducts.length > planConfig.products) {
      // Sort by creation date, keep oldest products active
      const sortedProducts = activeProducts.sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );
      
      // Disable products that exceed limit
      const productsToDisable = sortedProducts.slice(planConfig.products);
      for (const product of productsToDisable) {
        await prisma.product.update({
          where: { id: product.id },
          data: { isActive: false },
        });
      }
    }
  }

  // Update tenantsActive count
  const activeUsersCount = await prisma.user.count({
    where: { tenantId, isActive: true },
  });

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      tenantsActive: activeUsersCount,
    },
  });

  return {
    plan: planKey,
    features: planConfig,
    tenantsLimit: planConfig.tenantsLimit,
    tenantsActive: activeUsersCount,
  };
}

/**
 * Get tenant plan features and limits
 * Combines base plan limits with active addons
 * Uses caching to improve performance (TTL: 120 seconds)
 */
export async function getTenantPlanFeatures(tenantId: string, useCache: boolean = true): Promise<any> {
  const CacheService = (await import('../utils/cache')).default;
  const cacheKey = `plan-features:${tenantId}`;
  
  // Try to get from cache first
  if (useCache) {
    const cached = await CacheService.get<any>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      subscriptionPlan: true,
      tenantsLimit: true,
      tenantsActive: true,
      features: true,
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  let plan = (tenant.subscriptionPlan || 'BASIC').toUpperCase();
  // Backward compatibility: ENTERPRISE -> CUSTOM
  if (plan === 'ENTERPRISE') plan = 'CUSTOM';
  const planKey = plan as 'BASIC' | 'PRO' | 'CUSTOM';
  const baseLimits = PLAN_BASE_LIMITS[planKey] || PLAN_BASE_LIMITS.BASIC;

  // Get active addons
  const activeAddons: any[] = await addonService.getTenantAddons(tenantId);

  // Calculate total limits (base + addons)
  let totalProducts = baseLimits.products === -1 ? -1 : baseLimits.products;
  let totalUsers = baseLimits.users === -1 ? -1 : baseLimits.users;
  let totalOutlets = baseLimits.outlets === -1 ? -1 : baseLimits.outlets;
  let totalTenants = tenant.tenantsLimit || PLAN_FEATURES[plan]?.tenantsLimit || 1;
  if (totalTenants === -1) totalTenants = -1; // Keep unlimited
  const features = [...baseLimits.features];

  // Add addon limits
  for (const addon of activeAddons) {
    switch (addon.addonType) {
      case 'ADD_PRODUCTS':
        if (totalProducts !== -1 && addon.limit) {
          totalProducts += addon.limit;
        }
        break;
      case 'ADD_USERS':
        if (totalUsers !== -1 && addon.limit) {
          totalUsers += addon.limit;
        }
        break;
      case 'ADD_OUTLETS':
        if (totalOutlets !== -1 && addon.limit) {
          totalOutlets += addon.limit;
        }
        break;
      case 'BUSINESS_ANALYTICS':
        if (!features.includes('Business Analytics & Insight')) {
          features.push('Business Analytics & Insight');
          features.push('Laporan Laba Rugi');
          features.push('Advanced Analytics');
          features.push('Quick Insight');
        }
        break;
      case 'ADVANCED_REPORTING':
        if (!features.includes('Advanced Reporting')) {
          features.push('Advanced Reporting');
          features.push('Export Laporan');
        }
        break;
      case 'FINANCIAL_MANAGEMENT':
        if (!features.includes('Financial Management')) {
          features.push('Financial Management');
          features.push('Profit & Loss Report');
          features.push('Accounting Finance');
        }
        break;
      case 'INVENTORY_MANAGEMENT':
        if (!features.includes('Inventory Management')) {
          features.push('Inventory Management');
          features.push('Suppliers');
          features.push('Purchase Orders');
          features.push('Stock Transfers');
          features.push('Stock Alerts');
        }
        break;
      case 'AI_ML_FEATURES':
        if (!features.includes('AI/ML Features')) {
          features.push('AI/ML Features');
        }
        break;
      case 'DELIVERY_MARKETING':
        if (!features.includes('Delivery & Marketing')) {
          features.push('Delivery & Marketing');
          features.push('Delivery Orders');
          features.push('Marketing Campaigns');
          features.push('Email Templates');
          features.push('Email Analytics');
          features.push('Email Scheduler');
          features.push('Customer Engagement');
        }
        break;
      case 'RECEIPT_EDITOR':
        if (!features.includes('Advanced Receipt Editor')) {
          features.push('Advanced Receipt Editor');
        }
        break;
      case 'MULTI_OUTLET_ADVANCED':
        if (!features.includes('Multi-Outlet Advanced')) {
          features.push('Multi-Outlet Advanced');
        }
        break;
    }
  }

  const result = {
    plan: planKey,
    limits: {
      products: totalProducts,
      users: totalUsers,
      outlets: totalOutlets,
    },
    features,
    baseLimits,
    planFeatures: PLAN_FEATURES[planKey] || PLAN_FEATURES.BASIC,
    tenantsLimit: tenant.tenantsLimit || PLAN_FEATURES[planKey]?.tenantsLimit || 1,
    tenantsActive: tenant.tenantsActive || 0,
    activeAddons: activeAddons.map((a: any) => ({
      id: a.addonId,
      type: a.addonType,
      name: a.addonName,
      limit: a.limit,
    })),
  };
  
  // Cache the result (120 seconds TTL - longer than subscription cache because plan changes less frequently)
  if (useCache) {
    await CacheService.set(cacheKey, result, 120);
  }
  
  return result;
}

/**
 * Check if tenant can perform an action based on plan limits
 */
export async function checkPlanLimit(
  tenantId: string,
  limitType: 'products' | 'users' | 'outlets'
): Promise<{ allowed: boolean; currentUsage: number; limit: number; message?: string }> {
  
  const planFeatures = await getTenantPlanFeatures(tenantId);
  const limit = planFeatures.limits[limitType];

  // Unlimited
  if (limit === -1) {
    return { allowed: true, currentUsage: 0, limit: -1 };
  }

  // Get current usage
  let currentUsage = 0;
  switch (limitType) {
    case 'products':
      currentUsage = await prisma.product.count({
        where: { tenantId, isActive: true },
      });
      break;
    case 'users':
      currentUsage = await prisma.user.count({
        where: { tenantId, isActive: true },
      });
      break;
    case 'outlets':
      currentUsage = await prisma.outlet.count({
        where: { tenantId, isActive: true },
      });
      break;
  }

  const allowed = currentUsage < limit;
  const message = !allowed
    ? `Limit ${limitType} tercapai (${currentUsage}/${limit}). Upgrade paket atau beli addon untuk menambah limit.`
    : undefined;

  return {
    allowed,
    currentUsage,
    limit,
    message,
  };
}

/**
 * Check if tenant has access to a feature
 */
export async function checkPlanFeature(
  tenantId: string,
  feature: string
): Promise<boolean> {
  
  const planFeatures = await getTenantPlanFeatures(tenantId);
  return planFeatures.features.includes(feature);
}

// Export PLAN_FEATURES for use in other services
export { PLAN_FEATURES, PLAN_BASE_LIMITS };

export default {
  getTenantPlanFeatures,
  checkPlanLimit,
  checkPlanFeature,
  applyPlanFeatures,
  PLAN_FEATURES,
};
