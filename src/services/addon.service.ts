import { PrismaClient } from '@prisma/client';
import prisma from '../config/database';
import logger from '../utils/logger';

export interface SubscribeAddonInput {
  addonId: string;
  addonName: string;
  addonType: string;
  limit?: number;
  duration?: number; // days
  addedBySuperAdmin?: boolean; // true if added by super admin
}

export const AVAILABLE_ADDONS = [
  // Group 1: Resource Addons (Limit-based)
  {
    id: 'add_outlets',
    name: 'Tambah Outlet',
    type: 'ADD_OUTLETS',
    category: 'RESOURCE',
    description: 'Tambahkan outlet/cabang tambahan untuk operasi multi-lokasi',
    defaultLimit: 1,
    price: 120000, // per month
  },
  {
    id: 'add_users',
    name: 'Tambah Pengguna',
    type: 'ADD_USERS',
    category: 'RESOURCE',
    description: 'Tambahkan user, kasir, atau supervisor tambahan dengan role preset (Admin, Kasir, Supervisor) dan log aktivitas',
    defaultLimit: 5,
    price: 50000, // per month (per 5 users)
  },
  {
    id: 'add_products',
    name: 'Tambah Produk',
    type: 'ADD_PRODUCTS',
    category: 'RESOURCE',
    description: 'Tambahkan limit produk dengan fitur bulk import CSV/Excel dan dukungan varian produk (warna, ukuran, rasa)',
    defaultLimit: 100,
    price: 30000, // per month (per 100 produk)
  },
  
  // Group 2: Delivery & Marketing
  {
    id: 'delivery_marketing',
    name: 'Delivery & Marketing',
    type: 'DELIVERY_MARKETING',
    category: 'MARKETING',
    description: 'Fitur delivery orders dan marketing campaigns lengkap dengan email templates, email analytics, email scheduler, dan customer engagement',
    defaultLimit: null,
    price: 180000, // per month
    comingSoon: true, // Requires external API
  },
  
  // Group 3: Business Analytics
  {
    id: 'business_analytics',
    name: 'Business Analytics & Insight',
    type: 'BUSINESS_ANALYTICS',
    category: 'ANALYTICS',
    description: 'Laporan Laba Rugi dengan Revenue, COGS, Gross Profit, Operating Expenses, dan Net Profit. Prediksi penjualan, analisis tren, dan custom report builder. Ringkasan harian transaksi dan produk terlaris.',
    defaultLimit: null,
    price: 250000, // per month
  },
  
  // Group 4: Advanced Reporting
  {
    id: 'advanced_reporting',
    name: 'Advanced Reporting',
    type: 'ADVANCED_REPORTING',
    category: 'REPORTING',
    description: 'Laporan lanjutan dengan export Excel, PDF, CSV. Custom report builder, scheduled reports, dan tanda tangan digital untuk keperluan legal.',
    defaultLimit: null,
    price: 75000, // per month
  },
  
  // Group 5: Financial Management
  {
    id: 'financial_management',
    name: 'Financial Management',
    type: 'FINANCIAL_MANAGEMENT',
    category: 'FINANCE',
    description: 'Manajemen keuangan lengkap: accounting, profit & loss report, cash flow, expenses, tax calculations, financial forecasts, dan bank reconciliations',
    defaultLimit: null,
    price: 150000, // per month
    comingSoon: true, // Requires external API (bank reconciliation)
  },
  
  // Group 6: Inventory Management
  {
    id: 'inventory_management',
    name: 'Inventory Management',
    type: 'INVENTORY_MANAGEMENT',
    category: 'INVENTORY',
    description: 'Manajemen inventory lengkap: suppliers, purchase orders, stock transfers, stock alerts, stock valuations, dan product adjustments',
    defaultLimit: null,
    price: 100000, // per month
    comingSoon: true, // Requires external API (supplier integration)
  },
  
  // Group 7: AI/ML Features
  {
    id: 'ai_ml_features',
    name: 'AI/ML Features',
    type: 'AI_ML_FEATURES',
    category: 'AI_ML',
    description: 'Fitur AI dan Machine Learning: prediksi penjualan, rekomendasi produk, analisis tren otomatis, dan insights berbasis AI',
    defaultLimit: null,
    price: 200000, // per month
    comingSoon: true, // Requires external AI/ML API
  },
  
  // Group 8: Receipt & Export
  {
    id: 'receipt_editor',
    name: 'Advanced Receipt Editor',
    type: 'RECEIPT_EDITOR',
    category: 'RECEIPT',
    description: 'Kustomisasi tampilan nota: nama toko, pesan promo, logo. Preview real-time sebelum cetak untuk memastikan hasil. Edit header, footer, dan layout struk sesuai brand.',
    defaultLimit: null,
    price: 60000, // per month
  },
  
  // Group 9: Multi-Outlet (Advanced)
  {
    id: 'multi_outlet_advanced',
    name: 'Multi-Outlet Advanced',
    type: 'MULTI_OUTLET_ADVANCED',
    category: 'OUTLET',
    description: 'Fitur multi-outlet lanjutan: manajemen stok antar outlet, transfer otomatis, laporan per outlet, dan sinkronisasi real-time',
    defaultLimit: null,
    price: 150000, // per month
  },
];

export class AddonService {
  async getAvailableAddons() {
    return AVAILABLE_ADDONS;
  }

  async getTenantAddons(tenantId: string): Promise<any[]> {
    const now = new Date();
    const addons = await prisma.tenantAddon.findMany({
      where: {
        tenantId,
        status: 'active',
        // Only include addons that are not expired
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: { subscribedAt: 'desc' },
    });

    // Get total limits from plan features (base plan + all addons)
    const planFeaturesService = (await import('./plan-features.service')).default;
    const planFeatures: any = await planFeaturesService.getTenantPlanFeatures(tenantId);

    // Get current usage for each addon
    const addonsWithUsage: any[] = await Promise.all(
      addons.map(async (addon) => {
        let currentUsage = 0;
        let totalLimit: number | null = null;
        
        switch (addon.addonType) {
          case 'ADD_USERS':
            currentUsage = await prisma.user.count({
              where: { tenantId, isActive: true },
            });
            totalLimit = planFeatures.limits.users === -1 ? null : planFeatures.limits.users;
            break;
          case 'ADD_PRODUCTS':
            currentUsage = await prisma.product.count({
              where: { tenantId, isActive: true },
            });
            totalLimit = planFeatures.limits.products === -1 ? null : planFeatures.limits.products;
            break;
          case 'ADD_OUTLETS':
            currentUsage = await prisma.outlet.count({
              where: { tenantId, isActive: true },
            });
            totalLimit = planFeatures.limits.outlets === -1 ? null : planFeatures.limits.outlets;
            break;
          case 'BUSINESS_ANALYTICS':
          case 'ADVANCED_REPORTING':
          case 'FINANCIAL_MANAGEMENT':
          case 'INVENTORY_MANAGEMENT':
          case 'AI_ML_FEATURES':
          case 'DELIVERY_MARKETING':
          case 'RECEIPT_EDITOR':
          case 'MULTI_OUTLET_ADVANCED':
          case 'EXPORT_REPORTS':
            // These addons don't have usage limits
            currentUsage = 0;
            totalLimit = null;
            break;
        }

        // Use total limit (base plan + all addons) instead of individual addon limit
        const displayLimit: number | null = totalLimit !== null ? totalLimit : addon.limit;
        
        return {
          ...addon,
          currentUsage,
          limit: displayLimit, // Use total limit for display
          totalLimit: displayLimit, // Total limit (base plan + all addons)
          addonLimit: addon.limit, // Individual addon limit (for reference)
          isLimitReached: displayLimit !== null ? currentUsage >= displayLimit : false,
        };
      })
    );

    return addonsWithUsage;
  }

  async subscribeAddon(tenantId: string, data: SubscribeAddonInput) {
    // Get tenant subscription info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionEnd: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Check if addon already exists
    const existing = await prisma.tenantAddon.findUnique({
      where: {
        tenantId_addonId: {
          tenantId,
          addonId: data.addonId,
        },
      },
    });

    // Check if addon has limit (can be purchased multiple times)
    const addonInfo = AVAILABLE_ADDONS.find(a => a.id === data.addonId);
    
    // Check if addon is coming soon
    if (addonInfo?.comingSoon) {
      throw new Error('Addon ini belum tersedia. Fitur ini sedang dalam pengembangan.');
    }
    
    const hasLimit = addonInfo?.defaultLimit !== null && addonInfo?.defaultLimit !== undefined;

    // For addons without limit (BUSINESS_ANALYTICS, EXPORT_REPORTS, RECEIPT_EDITOR)
    // Only throw error if already active and not expired
    if (!hasLimit && existing && existing.status === 'active') {
      const now = new Date();
      if (existing.expiresAt) {
        const expiresAt = new Date(existing.expiresAt);
        if (expiresAt > now) {
          throw new Error('Addon already subscribed');
        }
      } else {
        throw new Error('Addon already subscribed');
      }
    }
    
    // For addons with limit (ADD_OUTLETS, ADD_USERS, ADD_PRODUCTS), allow multiple purchases
    // Each purchase creates a NEW record (don't update existing) so limits can be summed correctly
    // Only update if the existing addon is expired or inactive

    const now = new Date();
    // Calculate addon expiry: flat duration from now (can exceed subscription end)
    let expiresAt: Date | null = null;
    
    if (data.duration) {
      // Add flat duration from now, regardless of subscription end date
      expiresAt = new Date(now.getTime() + data.duration * 24 * 60 * 60 * 1000);
    } else if (tenant.subscriptionEnd) {
      // If no duration specified, use subscription end date
      expiresAt = tenant.subscriptionEnd;
    }

    // Store original duration in config for future reference
    const addonConfig = {
      originalDuration: data.duration || null, // Store original duration in days
    };

    // Determine limit: use provided limit, or defaultLimit from addon info
    let addonLimit = data.limit;
    if (addonLimit === null || addonLimit === undefined) {
      if (addonInfo?.defaultLimit !== null && addonInfo?.defaultLimit !== undefined) {
        addonLimit = addonInfo.defaultLimit;
      } else if (data.addonType === 'ADD_OUTLETS') {
        addonLimit = 1; // Default 1 outlet per addon
      } else if (data.addonType === 'ADD_USERS') {
        addonLimit = 5; // Default 5 users per addon
      } else if (data.addonType === 'ADD_PRODUCTS') {
        addonLimit = 100; // Default 100 products per addon
      }
    }

    // For limit-based addons (ADD_OUTLETS, ADD_USERS, ADD_PRODUCTS), update existing and add limit
    // For non-limit addons, only update if expired or inactive
    if (existing) {
      if (hasLimit) {
        // For limit-based addons, update existing and ADD to existing limit
        const updateData: any = {
          status: 'active',
          expiresAt,
          config: addonConfig,
          // Add to existing limit (allow multiple purchases to accumulate)
          limit: (existing.limit || 0) + (addonLimit || 0),
        };
        
        // Only update subscribedAt if it's not already set
        if (!existing.subscribedAt) {
          updateData.subscribedAt = now;
        }
        
        // Set addedBySuperAdmin if provided
        if (data.addedBySuperAdmin !== undefined) {
          updateData.addedBySuperAdmin = data.addedBySuperAdmin;
        }
        
        const updatedAddon = await prisma.tenantAddon.update({
          where: { id: existing.id },
          data: updateData,
        });
        
        // Award points from addon purchase (10rb = 5 point) if extending/renewing
        if (addonInfo && addonInfo.price && data.duration) {
          const amount = Math.floor((addonInfo.price * data.duration) / 30);
          if (amount > 0) {
            try {
              const rewardPointService = (await import('./reward-point.service')).default;
              await rewardPointService.awardPointsFromAddon(
                tenantId,
                amount,
                data.addonName,
                data.addonType
              );
            } catch (error: any) {
              logger.error('Error awarding points from addon', { error: error.message, addonId: data.addonId, tenantId });
            }
          }
        }
        
        return updatedAddon;
      } else {
        // For non-limit addons, update existing if expired
        const isExpired = existing.expiresAt && new Date(existing.expiresAt) <= now;
        
        if (isExpired || existing.status !== 'active') {
          const updateData: any = {
            status: 'active',
            expiresAt,
            config: addonConfig,
          };
          
          if (!existing.subscribedAt) {
            updateData.subscribedAt = now;
          }
          
          if (data.addedBySuperAdmin !== undefined) {
            updateData.addedBySuperAdmin = data.addedBySuperAdmin;
          }
          
          const updatedAddon = await prisma.tenantAddon.update({
            where: { id: existing.id },
            data: updateData,
          });
          
          // Award points
          if (addonInfo && addonInfo.price && data.duration) {
            const amount = Math.floor((addonInfo.price * data.duration) / 30);
            if (amount > 0) {
              try {
                const rewardPointService = (await import('./reward-point.service')).default;
                await rewardPointService.awardPointsFromAddon(
                  tenantId,
                  amount,
                  data.addonName,
                  data.addonType
                );
              } catch (error: any) {
                logger.error('Error awarding points from addon', { error, tenantId, addonId: data.addonId });
              }
            }
          }
          
          return updatedAddon;
        }
      }
    }

    // Create new addon subscription (only if no existing or existing is non-limit and active)
    const addon = await prisma.tenantAddon.create({
      data: {
        tenantId,
        addonId: data.addonId,
        addonName: data.addonName,
        addonType: data.addonType,
        limit: addonLimit, // Use calculated limit (with default if not provided)
        status: 'active',
        subscribedAt: now,
        expiresAt,
        config: addonConfig,
        addedBySuperAdmin: data.addedBySuperAdmin || false,
      },
    });
    
    // Log addon creation for debugging
    logger.info('Addon subscribed for tenant', {
      tenantId,
      addonId: addon.id,
      addonName: data.addonName,
      subscribedAt: now.toISOString(),
      expiresAt: expiresAt?.toISOString(),
    });
    
    // Award points from addon purchase (10rb = 5 point)
    // Calculate amount based on addon price and duration
    if (addonInfo && addonInfo.price) {
      const durationDays = data.duration || (tenant.subscriptionEnd ? Math.ceil((tenant.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 30);
      const amount = Math.floor((addonInfo.price * durationDays) / 30); // Calculate based on duration
      
      if (amount > 0) {
        try {
          const rewardPointService = (await import('./reward-point.service')).default;
          await rewardPointService.awardPointsFromAddon(
            tenantId,
            amount,
            data.addonName,
            data.addonType
          );
        } catch (error: any) {
          // Log error but don't fail the addon subscription
          logger.error('Error awarding points from addon', { error, tenantId, addonId: addon.id });
        }
      }
    }
    
    return addon;
  }

  /**
   * Extend addon subscription
   * Logic: Addon expiry cannot exceed subscription expiry
   * If subscription is extended, addon can be extended up to the original addon duration
   */
  async extendAddon(tenantId: string, addonId: string, duration: number) {
    // Get tenant and addon
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionEnd: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const addon = await prisma.tenantAddon.findUnique({
      where: {
        tenantId_addonId: {
          tenantId,
          addonId,
        },
      },
    });

    if (!addon) {
      throw new Error('Addon not found');
    }

    const now = new Date();
    const currentExpiry = addon.expiresAt ? new Date(addon.expiresAt) : now;
    // Add flat duration from current expiry (can exceed subscription end)
    const newExpiry = new Date(currentExpiry.getTime() + duration * 24 * 60 * 60 * 1000);

    // Update config with new original duration (duration from current expiry to new expiry)
    const currentConfig = (addon.config as any) || {};
    const updatedConfig = {
      ...currentConfig,
      originalDuration: duration, // Update to the new duration being added
    };

    return prisma.tenantAddon.update({
      where: { id: addon.id },
      data: {
        expiresAt: newExpiry,
        config: updatedConfig,
      },
    });
  }

  /**
   * Reduce addon subscription duration
   * Logic: Reduce addon expiry by specified duration
   */
  async reduceAddon(tenantId: string, addonId: string, duration: number) {
    // Get tenant and addon
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionEnd: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const addon = await prisma.tenantAddon.findUnique({
      where: {
        tenantId_addonId: {
          tenantId,
          addonId,
        },
      },
    });

    if (!addon) {
      throw new Error('Addon not found');
    }

    if (!addon.expiresAt) {
      throw new Error('Addon has no expiry date to reduce');
    }

    const now = new Date();
    const currentExpiry = new Date(addon.expiresAt);
    
    // Calculate new expiry (reduce by duration)
    const newExpiry = new Date(currentExpiry.getTime() - duration * 24 * 60 * 60 * 1000);
    
    // Ensure new expiry is not before now
    if (newExpiry < now) {
      throw new Error('Cannot reduce addon to a date in the past');
    }

    // Addon expiry can exceed subscription expiry (flat duration)
    return prisma.tenantAddon.update({
      where: { id: addon.id },
      data: {
        expiresAt: newExpiry,
      },
    });
  }

  async unsubscribeAddon(tenantId: string, addonId: string) {
    const addon = await prisma.tenantAddon.findUnique({
      where: {
        tenantId_addonId: {
          tenantId,
          addonId,
        },
      },
    });

    if (!addon) {
      throw new Error('Addon not found');
    }

    return prisma.tenantAddon.update({
      where: { id: addon.id },
      data: { status: 'inactive' },
    });
  }

  async checkLimit(tenantId: string, addonType: string): Promise<{ allowed: boolean; currentUsage: number; limit?: number }> {
    // Map addon type to plan limit type
    let limitType: 'products' | 'users' | 'outlets' | null = null;
    switch (addonType) {
      case 'ADD_USERS':
        limitType = 'users';
        break;
      case 'ADD_PRODUCTS':
        limitType = 'products';
        break;
      case 'ADD_OUTLETS':
        limitType = 'outlets';
        break;
      case 'BUSINESS_ANALYTICS':
      case 'ADVANCED_REPORTING':
      case 'FINANCIAL_MANAGEMENT':
      case 'INVENTORY_MANAGEMENT':
      case 'AI_ML_FEATURES':
      case 'DELIVERY_MARKETING':
      case 'RECEIPT_EDITOR':
      case 'MULTI_OUTLET_ADVANCED':
      case 'EXPORT_REPORTS':
        // These addons don't have usage limits
        return { allowed: true, currentUsage: 0 };
    }

    if (!limitType) {
      return { allowed: true, currentUsage: 0 };
    }

    // Use plan-features service to check total limit (base plan + addons)
    const planFeaturesService = (await import('./plan-features.service')).default;
    const limitCheck = await planFeaturesService.checkPlanLimit(tenantId, limitType);

    return {
      allowed: limitCheck.allowed,
      currentUsage: limitCheck.currentUsage,
      limit: limitCheck.limit === -1 ? undefined : limitCheck.limit,
    };
  }
}

export default new AddonService();

