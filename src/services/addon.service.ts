import { PrismaClient } from '@prisma/client';
import prisma from '../config/database';
import logger from '../utils/logger';

export interface SubscribeAddonInput {
  addonId: string;
  addonName: string;
  addonType: string;
  limit?: number;
  duration?: number; // days
  purchasedBy?: string; // "ADMIN" = dibeli oleh Super Admin, "SELF" = dibeli sendiri oleh tenant
}

export const AVAILABLE_ADDONS = [
  // ========== ADDON DENGAN LIMIT ==========
  {
    id: 'add_outlets',
    name: 'Tambah Outlet',
    type: 'ADD_OUTLETS',
    description: 'Tambahkan outlet/cabang tambahan untuk operasi multi-lokasi',
    defaultLimit: 1,
    price: 120000,
    category: 'limit',
    details: [
      'Tambahkan 1 outlet/cabang baru',
      'Kelola multi-lokasi dari satu dashboard',
      'Sinkronisasi stok antar outlet',
      'Laporan per outlet dan konsolidasi',
      'Transfer stok antar outlet',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'add_users',
    name: 'Tambah Pengguna',
    type: 'ADD_USERS',
    description: 'Tambahkan user, kasir, atau supervisor tambahan dengan role preset (Admin, Kasir, Supervisor) dan log aktivitas',
    defaultLimit: 5,
    price: 50000,
    category: 'limit',
    details: [
      'Tambahkan 5 pengguna baru',
      'Role: Admin, Supervisor, Kasir, Kitchen',
      'Log aktivitas dan audit trail',
      'Permission management per user',
      'Multi-user support untuk operasi 24/7',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'add_products',
    name: 'Tambah Produk',
    type: 'ADD_PRODUCTS',
    description: 'Tambahkan limit produk dengan fitur bulk import CSV/Excel dan dukungan varian produk (warna, ukuran, rasa)',
    defaultLimit: 100,
    price: 30000,
    category: 'limit',
    details: [
      'Tambahkan 100 produk baru',
      'Bulk import CSV/Excel',
      'Dukungan varian produk (warna, ukuran, rasa)',
      'Kategori dan tag produk',
      'Import gambar produk massal',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  // ========== ADDON FEATURE (Non-API) ==========
  {
    id: 'business_analytics',
    name: 'Business Analytics & Insight',
    type: 'BUSINESS_ANALYTICS',
    description: 'Laporan Laba Rugi dengan Revenue, COGS, Gross Profit, Operating Expenses, dan Net Profit. Prediksi penjualan, analisis tren, dan custom report builder. Ringkasan harian transaksi dan produk terlaris.',
    defaultLimit: null,
    price: 250000,
    category: 'feature',
    details: [
      'Laporan Laba Rugi lengkap (Revenue, COGS, Gross Profit, Operating Expenses, Net Profit)',
      'Prediksi penjualan berdasarkan data historis',
      'Analisis tren penjualan harian, mingguan, bulanan',
      'Custom report builder dengan filter advanced',
      'Ringkasan harian transaksi dan produk terlaris',
      'Quick Insight dashboard dengan rekomendasi bisnis',
      'Advanced Analytics dengan grafik interaktif',
      'Financial Management dengan tracking keuangan',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'export_reports',
    name: 'Export Laporan',
    type: 'EXPORT_REPORTS',
    description: 'Ekspor laporan transaksi, stok, dan keuangan dalam format Excel, PDF, atau CSV. Rentang waktu custom sesuai kebutuhan. Tanda tangan digital untuk keperluan legal.',
    defaultLimit: null,
    price: 75000,
    category: 'feature',
    details: [
      'Export laporan ke Excel (.xlsx)',
      'Export laporan ke PDF dengan template profesional',
      'Export laporan ke CSV untuk analisis',
      'Rentang waktu custom (tanggal mulai-akhir)',
      'Tanda tangan digital untuk keperluan legal',
      'Multiple format export sekaligus',
      'Scheduled export otomatis via email',
      'Template laporan yang dapat dikustomisasi',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'receipt_editor',
    name: 'Simple Nota Editor',
    type: 'RECEIPT_EDITOR',
    description: 'Kustomisasi tampilan nota: nama toko, pesan promo, logo. Preview real-time sebelum cetak untuk memastikan hasil. Edit header, footer, dan layout struk sesuai brand.',
    defaultLimit: null,
    price: 50000,
    category: 'feature',
    details: [
      'Kustomisasi header nota (nama toko, alamat, telepon)',
      'Upload logo toko di nota',
      'Pesan promo/ucapan di footer nota',
      'Preview real-time sebelum cetak',
      'Edit layout struk sesuai brand',
      'Multiple template nota',
      'Print ke thermal printer atau PDF',
      'Template designer dengan drag & drop',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'delivery_marketing',
    name: 'Delivery & Marketing',
    type: 'DELIVERY_MARKETING',
    description: 'Manajemen pesanan delivery, kampanye marketing email, SMS marketing, customer engagement tools, dan email automation untuk meningkatkan penjualan dan retensi pelanggan.',
    defaultLimit: null,
    price: 150000,
    category: 'feature',
    details: [
      'Manajemen pesanan delivery dengan tracking',
      'Kampanye marketing email dengan template',
      'SMS marketing untuk promosi',
      'Email automation (welcome, birthday, reminder)',
      'Customer engagement tools',
      'Email analytics (open rate, click rate)',
      'Email scheduler untuk kampanye terjadwal',
      'Segmentasi pelanggan untuk targeted campaign',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'restock_suggestion',
    name: 'Restock Suggestion',
    type: 'RESTOCK_SUGGESTION',
    description: 'Saran restock otomatis berdasarkan pola penjualan. Rekomendasi jumlah pembelian berdasarkan kecepatan jual dan stok minimal. Cocok untuk tenant yang tidak langganan PRO.',
    defaultLimit: null,
    price: 50000,
    category: 'feature',
    details: [
      'Saran restock otomatis berdasarkan pola penjualan',
      'Rekomendasi jumlah pembelian berdasarkan kecepatan jual',
      'Perkiraan kapan stok habis',
      'Produk paling laku mingguan',
      'Notifikasi stok mendekati minimal',
      'Algoritma prediksi berbasis data historis',
      'Export daftar restock ke Excel/PDF',
      'Integrasi dengan laporan penjualan',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'stock_transfer',
    name: 'Transfer Stok Antar Store',
    type: 'STOCK_TRANSFER',
    description: 'Transfer stok antar store/cabang dengan validasi otomatis. Riwayat transfer lengkap dan tracking perpindahan stok. Cocok untuk tenant dengan lebih dari 1 store manual.',
    defaultLimit: null,
    price: 80000,
    category: 'feature',
    details: [
      'Transfer stok antar store/cabang',
      'Validasi stok cukup sebelum transfer',
      'Riwayat transfer lengkap dengan tracking',
      'Notifikasi transfer masuk/keluar',
      'Laporan transfer per periode',
      'Multi-store support',
      'Auto-update stok setelah transfer',
      'Approval workflow untuk transfer besar',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'supervisor_role',
    name: 'Supervisor Role',
    type: 'SUPERVISOR_ROLE',
    description: 'Role khusus supervisor cabang dengan akses terbatas. Bisa melihat stok & penjualan cabangnya saja, tidak bisa edit cabang lain. Cocok untuk manajemen multi-store.',
    defaultLimit: null,
    price: 60000,
    category: 'feature',
    details: [
      'Role khusus supervisor cabang',
      'Akses terbatas ke cabang yang ditugaskan',
      'Bisa melihat stok & penjualan cabangnya saja',
      'Tidak bisa edit cabang lain',
      'Permission management per supervisor',
      'Audit trail aktivitas supervisor',
      'Multi-supervisor support',
      'Dashboard khusus supervisor',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'price_recommendation_plus',
    name: 'Price Recommendation Plus',
    type: 'PRICE_RECOMMENDATION_PLUS',
    description: 'Rekomendasi harga dengan margin custom (bukan hanya 20-30%). Analisis harga pasar lebih detail dan rekomendasi margin optimal berdasarkan kategori produk.',
    defaultLimit: null,
    price: 40000,
    category: 'feature',
    details: [
      'Rekomendasi harga dengan margin custom',
      'Analisis harga pasar lebih detail',
      'Rekomendasi margin optimal per kategori',
      'Perbandingan harga dengan kompetitor',
      'Saran harga berdasarkan profit target',
      'Multiple margin presets (10%, 15%, 20%, 25%, 30%, 35%, 40%)',
      'Analisis break-even point',
      'Export rekomendasi harga ke Excel',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  {
    id: 'bulk_import',
    name: 'Import Massal',
    type: 'BULK_IMPORT',
    description: 'Import massal produk, stok, dan pelanggan dari file Excel/CSV. Validasi data otomatis, preview sebelum import, dan error handling yang jelas.',
    defaultLimit: null,
    price: 100000,
    category: 'feature',
    details: [
      'Import massal produk dari Excel/CSV',
      'Import stok dari Excel/CSV',
      'Import pelanggan dari Excel/CSV',
      'Validasi data otomatis sebelum import',
      'Preview data sebelum import',
      'Error handling yang jelas',
      'Template Excel untuk download',
      'Support untuk update data existing',
    ],
    requiresApi: false,
    comingSoon: false,
  },
  // ========== ADDON API (Coming Soon - Di Akhir) ==========
  {
    id: 'ecommerce_integration',
    name: 'Integrasi E-commerce',
    type: 'E_COMMERCE',
    description: 'Integrasi dengan platform e-commerce (Shopee, Tokopedia, Bukalapak) untuk sinkronisasi produk, stok, dan pesanan secara otomatis.',
    defaultLimit: null,
    price: 200000,
    category: 'integration',
    details: [
      'Sinkronisasi produk ke Shopee, Tokopedia, Bukalapak',
      'Auto-update stok real-time',
      'Import pesanan dari e-commerce',
      'Multi-platform support (Shopee, Tokopedia, Bukalapak)',
      'Bulk sync produk dengan sekali klik',
      'Auto-update harga dan stok',
      'Notifikasi pesanan baru dari e-commerce',
      'Laporan penjualan per platform',
    ],
    requiresApi: true,
    comingSoon: true,
  },
  {
    id: 'payment_accounting_integration',
    name: 'Integrasi Payment & Accounting',
    type: 'PAYMENT_ACCOUNTING',
    description: 'Integrasi payment gateway (OVO, DANA, LinkAja) dan software akuntansi (Jurnal.id, Accurate, MYOB) untuk otomasi pembayaran dan pembukuan.',
    defaultLimit: null,
    price: 250000,
    category: 'integration',
    details: [
      'Payment Gateway: OVO, DANA, LinkAja integration',
      'Accounting Software: Jurnal.id, Accurate Online, MYOB',
      'Auto-sync transaksi ke software akuntansi',
      'Sinkronisasi chart of accounts',
      'Auto-generate invoice dan payment record',
      'Reconciliation otomatis',
      'Multi-payment method support',
      'Financial report export ke accounting software',
    ],
    requiresApi: true,
    comingSoon: true,
  },
];

export class AddonService {
  async getAvailableAddons() {
    return AVAILABLE_ADDONS;
  }

  async getTenantAddons(tenantId: string, page: number = 1, limit: number = 50) {
    const now = new Date();
    const skip = (page - 1) * limit;
    
    const [addons, total] = await Promise.all([
      prisma.tenantAddon.findMany({
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
        skip,
        take: limit,
      }),
      prisma.tenantAddon.count({
        where: {
          tenantId,
          status: 'active',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
      }),
    ]);

    // Get current usage for each addon
    const addonsWithUsage = await Promise.all(
      addons.map(async (addon) => {
        let currentUsage = 0;
        
        switch (addon.addonType) {
          case 'ADD_USERS':
            currentUsage = await prisma.user.count({
              where: { tenantId, isActive: true },
            });
            break;
          case 'ADD_PRODUCTS':
            currentUsage = await prisma.product.count({
              where: { tenantId, isActive: true },
            });
            break;
          case 'ADD_OUTLETS':
            currentUsage = await prisma.outlet.count({
              where: { tenantId, isActive: true },
            });
            break;
          case 'BUSINESS_ANALYTICS':
          case 'EXPORT_REPORTS':
          case 'RECEIPT_EDITOR':
          case 'DELIVERY_MARKETING':
          case 'RESTOCK_SUGGESTION':
          case 'STOCK_TRANSFER':
          case 'SUPERVISOR_ROLE':
          case 'PRICE_RECOMMENDATION_PLUS':
          case 'BULK_IMPORT':
          case 'E_COMMERCE':
          case 'PAYMENT_ACCOUNTING':
            // These addons don't have usage limits
            currentUsage = 0;
            break;
        }

        return {
          ...addon,
          currentUsage,
          isLimitReached: addon.limit ? currentUsage >= addon.limit : false,
        };
      })
    );

    return {
      data: addonsWithUsage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async subscribeAddon(tenantId: string, data: SubscribeAddonInput) {
    // Check if addon is coming soon
    const addonInfo = AVAILABLE_ADDONS.find(a => a.id === data.addonId);
    if (addonInfo?.comingSoon) {
      throw new Error('Addon ini belum tersedia. Coming soon!');
    }
    
    if (!addonInfo) {
      throw new Error('Addon not found');
    }
    
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
    const hasLimit = addonInfo.defaultLimit !== null && addonInfo.defaultLimit !== undefined;

    // For addons without limit (BUSINESS_ANALYTICS, EXPORT_REPORTS, RECEIPT_EDITOR, etc.)
    // Allow multiple purchases to extend duration - update existing if active
    // For addons with limit (ADD_OUTLETS, ADD_USERS, ADD_PRODUCTS), allow multiple purchases
    // If existing, add to the limit instead of replacing it

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

    if (existing) {
      if (hasLimit) {
        // For addons with limit, add to existing limit (allow multiple purchases)
        const newLimit = (existing.limit || 0) + (data.limit || addonInfo.defaultLimit || 0);
        
        // Update existing addon with increased limit
        const updateData: any = {
          status: 'active',
          expiresAt,
          limit: newLimit,
          config: addonConfig,
        };
        
        // Only update subscribedAt if it's not already set
        if (!existing.subscribedAt) {
          updateData.subscribedAt = now;
        }
        
        const updatedAddon = await prisma.tenantAddon.update({
          where: { id: existing.id, tenantId }, // Ensure tenantId is in where clause for multi-tenant isolation
          data: updateData,
        });
        
        // Award points from addon purchase (10rb = 5 point) if extending/renewing
        // Calculate amount based on addon price and duration
        if (addonInfo && addonInfo.price && data.duration) {
          const amount = Math.floor((addonInfo.price * data.duration) / 30); // Calculate based on duration
          
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
              logger.error('Error awarding points from addon:', { error: error.message, stack: error.stack });
            }
          }
        }
        
        return updatedAddon;
      } else {
        // For addons without limit, extend duration (allow multiple purchases to extend)
        const updateData: any = {
          status: 'active',
          expiresAt,
          config: addonConfig,
        };
        
        // Only update subscribedAt if it's not already set
        if (!existing.subscribedAt) {
          updateData.subscribedAt = now;
        }
        
        const updatedAddon = await prisma.tenantAddon.update({
          where: { id: existing.id, tenantId },
          data: updateData,
        });
        
        // Award points from addon purchase
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
              logger.error('Error awarding points from addon:', { error: error.message, stack: error.stack });
            }
          }
        }
        
        return updatedAddon;
      }
    }

    // Create new addon subscription
    // Set subscribedAt to now for global report tracking
    const addon = await prisma.tenantAddon.create({
      data: {
        tenantId,
        addonId: data.addonId,
        addonName: data.addonName,
        addonType: data.addonType,
        limit: data.limit,
        status: 'active',
        subscribedAt: now, // Set subscribedAt untuk laporan global
        expiresAt,
        config: addonConfig,
        purchasedBy: data.purchasedBy || 'SELF', // "ADMIN" jika dibeli oleh Super Admin, "SELF" jika dibeli sendiri
      },
    });
    
    // Log addon creation for debugging
    logger.info(`✅ Addon subscribed for tenant ${tenantId}:`, {
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
          logger.error('Error awarding points from addon:', { error: error.message, stack: error.stack });
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
      where: { id: addon.id, tenantId }, // Ensure tenantId is in where clause for multi-tenant isolation
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
      where: { id: addon.id, tenantId }, // Ensure tenantId is in where clause for multi-tenant isolation
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
      where: { id: addon.id, tenantId }, // Ensure tenantId is in where clause for multi-tenant isolation
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
      case 'EXPORT_REPORTS':
      case 'RECEIPT_EDITOR':
      case 'DELIVERY_MARKETING':
      case 'E_COMMERCE':
      case 'PAYMENT_ACCOUNTING':
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

