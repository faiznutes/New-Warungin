import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import { getRedisClient } from '../config/redis';

export interface CreateTenantInput {
  name: string;
  phone?: string;
  address?: string;
  subscriptionPlan?: string; // DEMO, BASIC, PRO, ENTERPRISE
  demoDuration?: number; // Custom duration in days for DEMO plan
}

// Generate email from tenant name
// Example: "Nasi Padang Barokah" -> "PadangBarokah@warungin.com"
function generateEmailFromName(name: string): string {
  if (!name || name.trim().length === 0) {
    throw new AppError('Nama tenant tidak boleh kosong', 400);
  }

  // Remove common words like "Nasi", "Warung", "Restoran", etc.
  const words = name
    .trim()
    .split(/\s+/)
    .filter(word => {
      const lower = word.toLowerCase().trim();
      return lower.length > 0 && !['nasi', 'warung', 'restoran', 'rumah', 'makan', 'kedai', 'toko', 'cafe', 'café'].includes(lower);
    })
    .map(word => {
      const trimmed = word.trim();
      if (trimmed.length === 0) return '';
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    })
    .filter(word => word.length > 0);

  // If no words left, use the first word
  if (words.length === 0) {
    const firstWord = name.trim().split(/\s+/)[0];
    if (firstWord && firstWord.length > 0) {
      words.push(firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase());
    } else {
      // Fallback: use first 10 characters of name
      const fallback = name.trim().substring(0, 10).replace(/[^a-zA-Z0-9]/g, '');
      if (fallback.length === 0) {
        throw new AppError('Nama tenant tidak valid', 400);
      }
      words.push(fallback.charAt(0).toUpperCase() + fallback.slice(1).toLowerCase());
    }
  }

  // Join words and remove spaces and special characters
  let emailPrefix = words.join('').replace(/[^a-zA-Z0-9]/g, '');

  // Ensure email prefix is not empty
  if (emailPrefix.length === 0) {
    emailPrefix = 'Tenant' + Date.now().toString().slice(-6);
  }

  // Limit email prefix length to 50 characters
  if (emailPrefix.length > 50) {
    emailPrefix = emailPrefix.substring(0, 50);
  }

  return `${emailPrefix}@warungin.com`;
}

export const createTenant = async (input: CreateTenantInput) => {
  try {
    const { name, phone, address, subscriptionPlan = 'BASIC', demoDuration } = input;

    // Validate input
    if (!name || name.trim().length < 3) {
      throw new AppError('Nama tenant minimal 3 karakter', 400);
    }

    // Generate email from name
    let email = generateEmailFromName(name);

    // Check if tenant email exists
    let existingTenant = await prisma.tenant.findUnique({
      where: { email },
    });

    if (existingTenant) {
      // If email exists, add a number
      let counter = 1;
      let newEmail = email.replace('@warungin.com', `${counter}@warungin.com`);
      while (await prisma.tenant.findUnique({ where: { email: newEmail } })) {
        counter++;
        newEmail = email.replace('@warungin.com', `${counter}@warungin.com`);
        // Prevent infinite loop
        if (counter > 1000) {
          throw new AppError('Terlalu banyak tenant dengan nama serupa. Silakan gunakan nama yang lebih unik.', 400);
        }
      }
      email = newEmail;
    }

    // Generate slug from email
    const slug = email.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Set subscription dates
    // For DEMO plan: use custom demoDuration, default 30 days
    // For other plans: 30 days default
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    const durationDays = subscriptionPlan === 'DEMO' && demoDuration ? demoDuration : 30;
    subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

    // Generate default password (random + uppercase + numbers)
    const randomPart = Math.random().toString(36).slice(-8);
    const upperPart = Math.random().toString(36).slice(-4).toUpperCase();
    const defaultPassword = `${randomPart}${upperPart}123`;

    // Create tenant and users in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          email,
          phone,
          address,
          slug,
          subscriptionPlan,
          subscriptionStart,
          subscriptionEnd,
        },
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Generate users based on plan
      // BASIC: 1 ADMIN_TENANT, 2 CASHIER, 1 KITCHEN (total 4 users)
      // PRO: 1 ADMIN_TENANT, 1 SUPERVISOR, 6 CASHIER, 2 KITCHEN (total 10 users)
      // ENTERPRISE: 1 ADMIN_TENANT, 1 SUPERVISOR, 10 CASHIER, 3 KITCHEN (total 15 users, unlimited can add more)
      const usersToCreate: Array<{
        tenantId: string;
        email: string;
        password: string;
        name: string;
        role: 'ADMIN_TENANT' | 'CASHIER' | 'KITCHEN' | 'SUPERVISOR';
      }> = [];

      // Generate email prefix from tenant name
      const emailPrefix = email.split('@')[0]; // e.g., "PadangBarokah"

      // Always create admin
      usersToCreate.push({
        tenantId: tenant.id,
        email: `${emailPrefix}@warungin.com`, // Admin uses tenant email
        password: hashedPassword,
        name: `${name} Admin`,
        role: 'ADMIN_TENANT' as const,
      });

      // DEMO plan gets ENTERPRISE-level users (all features unlocked)
      if (subscriptionPlan === 'DEMO' || subscriptionPlan === 'ENTERPRISE') {
        // DEMO/ENTERPRISE: 1 admin, 1 supervisor, 10 kasir, 3 dapur = 15 users
        usersToCreate.push(
          {
            tenantId: tenant.id,
            email: `${emailPrefix}S1@warungin.com`,
            password: hashedPassword,
            name: `${name} Supervisor`,
            role: 'SUPERVISOR' as const,
          },
          // Create 10 cashiers for DEMO/ENTERPRISE plan
          ...Array.from({ length: 10 }, (_, i) => ({
            tenantId: tenant.id,
            email: `${emailPrefix}K${i + 1}@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir ${i + 1}`,
            role: 'CASHIER' as const,
          })),
          // Create 3 kitchen users for DEMO/ENTERPRISE plan
          ...Array.from({ length: 3 }, (_, i) => ({
            tenantId: tenant.id,
            email: `${emailPrefix}D${i + 1}@warungin.com`,
            password: hashedPassword,
            name: `${name} Dapur ${i + 1}`,
            role: 'KITCHEN' as const,
          }))
        );
      } else if (subscriptionPlan === 'BASIC') {
        // BASIC: 1 admin, 2 kasir, 1 dapur = 4 users
        usersToCreate.push(
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K1@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 1`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K2@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 2`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}D1@warungin.com`,
            password: hashedPassword,
            name: `${name} Dapur`,
            role: 'KITCHEN' as const,
          }
        );
      } else if (subscriptionPlan === 'PRO') {
        // PRO: 1 admin, 1 supervisor, 6 kasir, 2 dapur = 10 users
        usersToCreate.push(
          {
            tenantId: tenant.id,
            email: `${emailPrefix}S1@warungin.com`,
            password: hashedPassword,
            name: `${name} Supervisor`,
            role: 'SUPERVISOR' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K1@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 1`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K2@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 2`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K3@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 3`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K4@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 4`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K5@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 5`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}K6@warungin.com`,
            password: hashedPassword,
            name: `${name} Kasir 6`,
            role: 'CASHIER' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}D1@warungin.com`,
            password: hashedPassword,
            name: `${name} Dapur 1`,
            role: 'KITCHEN' as const,
          },
          {
            tenantId: tenant.id,
            email: `${emailPrefix}D2@warungin.com`,
            password: hashedPassword,
            name: `${name} Dapur 2`,
            role: 'KITCHEN' as const,
          }
        );
      }

      // Encrypt defaultPassword before storing
      const { encrypt } = await import('../utils/encryption');
      const encryptedDefaultPassword = encrypt(defaultPassword);

      const users = await Promise.all(
        usersToCreate.map((userData) =>
          tx.user.create({
            data: {
              ...userData,
              defaultPassword: encryptedDefaultPassword, // Store encrypted default password
            },
          })
        )
      );

      // Create default receipt template
      await tx.receiptTemplate.create({
        data: {
          tenantId: tenant.id,
          name: 'Default Receipt',
          templateType: 'DEFAULT',
          isDefault: true,
          paperSize: 'A4',
        },
      });

      // Get plan price
      const planPrices: Record<string, number> = {
        DEMO: 0, // Demo: Free trial
        BASIC: 149000, // Starter: Rp 149.000
        PRO: 299000, // Boost: Rp 299.000
        ENTERPRISE: 499000, // Pro: Rp 499.000
      };
      const planPrice = planPrices[subscriptionPlan] || 0;

      // Create subscription record with plan price
      // Convert amount to string for Prisma Decimal compatibility
      // This subscription will be recorded as a purchase in global reports
      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: subscriptionPlan,
          startDate: subscriptionStart,
          endDate: subscriptionEnd,
          status: 'ACTIVE',
          amount: planPrice.toString(), // Set amount sesuai harga paket untuk laporan global
          purchasedBy: 'SELF', // Initial subscription saat registrasi tenant adalah self-purchase
        },
      });

      // Auto activate users when subscription is active
      await tx.user.updateMany({
        where: {
          tenantId: tenant.id,
          role: {
            in: ['CASHIER', 'KITCHEN', 'SUPERVISOR'],
          },
        },
        data: {
          isActive: true,
        },
      });

      // Log subscription creation for debugging
      logger.info(`✅ Subscription created for tenant ${tenant.name}:`, {
        subscriptionId: subscription.id,
        plan: subscriptionPlan,
        amount: planPrice,
        startDate: subscriptionStart.toISOString(),
        endDate: subscriptionEnd.toISOString(),
      });

      // Update tenant with plan features (inside transaction)
      const planConfig = subscriptionPlan === 'BASIC' ? {
        tenantsLimit: 1,
        products: 25,
        users: 4,
        outlets: 1,
        addons: ['receipt-basic'],
        access: ['kasir', 'laporan'],
      } : subscriptionPlan === 'PRO' ? {
        tenantsLimit: 1,
        products: 100,
        users: 10,
        outlets: 2,
        addons: ['receipt-advanced', 'multi-outlet'],
        access: ['kasir', 'laporan', 'manajemen-stok', 'addon-management'],
      } : {
        tenantsLimit: -1,
        products: -1,
        users: -1,
        outlets: -1,
        addons: ['receipt-advanced', 'multi-outlet'],
        access: ['semua'],
      };

      await tx.tenant.update({
        where: { id: tenant.id },
        data: {
          tenantsLimit: planConfig.tenantsLimit,
          features: planConfig as any,
        },
      });

      return { tenant, users, defaultPassword };
    });

    // Invalidate cache for tenants list and individual tenant
    try {
      const redis = getRedisClient();
      if (redis) {
        // Delete individual tenant cache
        await redis.del(`tenant:${result.tenant.id}`);

        // Delete all tenants list cache (tenants:*)
        const keys = await redis.keys('tenants:*');
        if (keys.length > 0) {
          await redis.del(...keys);
          logger.info('Invalidated tenants list cache after creating tenant', {
            tenantId: result.tenant.id,
            cacheKeysDeleted: keys.length
          });
        }
      }
    } catch (cacheError: any) {
      // Log but don't fail tenant creation if cache invalidation fails
      logger.warn('Failed to invalidate cache after creating tenant', {
        error: cacheError.message,
        tenantId: result.tenant.id
      });
    }

    // Apply plan features after transaction completes (to avoid transaction conflicts)
    // This is done asynchronously to not block the response
    // Use process.nextTick to ensure it runs after the response is sent
    process.nextTick(async () => {
      try {
        const { applyPlanFeatures } = await import('./plan-features.service');
        await applyPlanFeatures(result.tenant.id, subscriptionPlan);
        logger.info(`✅ Plan features applied successfully for tenant ${result.tenant.id}`);
      } catch (error: any) {
        // Log error but don't fail tenant creation
        // This error happens after the response is sent, so it won't affect the client
        logger.error(`⚠️ Error applying plan features (non-blocking) for tenant ${result.tenant.id}:`, error.message || error);
        if (error.stack) {
          logger.error('Error stack:', error.stack);
        }
      }
    });

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        email: result.tenant.email,
        slug: result.tenant.slug,
        subscriptionEnd: result.tenant.subscriptionEnd,
        subscriptionPlan: result.tenant.subscriptionPlan,
        phone: result.tenant.phone,
        address: result.tenant.address,
      },
      users: result.users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        password: result.defaultPassword ? (async () => {
          // Decrypt defaultPassword before returning
          const { decrypt } = await import('../utils/encryption');
          return decrypt(result.defaultPassword);
        })() : undefined, // Return decrypted password for super admin to share
      })),
      defaultPassword: result.defaultPassword ? (async () => {
        // Decrypt defaultPassword before returning
        const { decrypt } = await import('../utils/encryption');
        return decrypt(result.defaultPassword);
      })() : undefined,
    };
  } catch (error: any) {
    // Re-throw AppError as is
    if (error instanceof AppError) {
      throw error;
    }
    // Wrap other errors
    logger.error('Error creating tenant:', { error: error.message, stack: error.stack });
    throw new AppError(error.message || 'Gagal membuat tenant', 500);
  }
};

export const getTenants = async (page: number = 1, limit: number = 10, includeCounts: boolean = false, useCache: boolean = true): Promise<{
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const skip = (page - 1) * limit;

  // Create cache key
  const cacheKey = `tenants:${page}:${limit}:${includeCounts}`;

  // Try to get from cache first
  if (useCache && !includeCounts) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        // If cache read fails, continue with database query
        logger.warn('Failed to read tenants from cache:', error);
      }
    }
  }

  try {
    // Optimize query: only include _count if explicitly requested
    // This significantly improves performance when there are many tenants
    const tenantQuery: any = {
      where: {
        name: {
          not: 'System', // Sembunyikan tenant System
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    };

    // Only include counts if requested (for detailed views)
    // This makes the default list query much faster
    if (includeCounts) {
      tenantQuery.include = {
        _count: {
          select: {
            users: true,
            products: true,
            orders: true,
          },
        },
      };
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany(tenantQuery),
      prisma.tenant.count({
        where: {
          name: {
            not: 'System', // Sembunyikan tenant System
          },
        },
      }),
    ]);

    const result = {
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result (10 minutes TTL for tenants list, only if not including counts)
    if (useCache && !includeCounts) {
      const redis = getRedisClient();
      if (redis) {
        try {
          await redis.setex(cacheKey, 600, JSON.stringify(result));
        } catch (error) {
          // If cache write fails, continue without caching
          logger.warn('Failed to cache tenants:', error);
        }
      }
    }

    return result;
  } catch (error: any) {
    logger.error('Error in getTenants:', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined,
      page,
      limit,
      includeCounts,
    });
    // If query fails, try without counts as fallback
    if (includeCounts) {
      logger.info('Retrying getTenants without counts...', { page, limit });
      return getTenants(page, limit, false);
    }
    throw error;
  }
};

export const getTenantById = async (id: string, useCache: boolean = true) => {
  const cacheKey = `tenant:${id}`;

  // Try to get from cache first
  if (useCache) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        // If cache read fails, continue with database query
        logger.warn('Failed to read tenant from cache:', error);
      }
    }
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          orders: true,
        },
      },
    },
  });

  // Cache the result (15 minutes TTL for individual tenant)
  if (tenant && useCache) {
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.setex(cacheKey, 900, JSON.stringify(tenant));
      } catch (error) {
        // If cache write fails, continue without caching
        logger.warn('Failed to cache tenant:', error);
      }
    }
  }

  return tenant;
};

export interface UpdateTenantInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  subscriptionPlan?: string;
  isActive?: boolean;
  password?: string; // For updating admin password
}

export const updateTenant = async (id: string, input: UpdateTenantInput) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Check if email is being updated and if it's already taken
  if (input.email && input.email !== tenant.email) {
    const existingTenant = await prisma.tenant.findUnique({
      where: { email: input.email },
    });

    if (existingTenant) {
      throw new AppError('Tenant with this email already exists', 400);
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (input.name) updateData.name = input.name;
  if (input.email) {
    updateData.email = input.email;
    // Update slug if email changes
    updateData.slug = input.email.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.subscriptionPlan) updateData.subscriptionPlan = input.subscriptionPlan;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  // Update tenant and password in a transaction to ensure atomicity
  const updatedTenant = await prisma.$transaction(async (tx) => {
    // Update tenant
    const tenant = await tx.tenant.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            orders: true,
          },
        },
      },
    });

    // If password is provided, update the admin user's password
    if (input.password) {
      // Find admin user with case-insensitive email search if email was updated
      let adminUser = await tx.user.findFirst({
        where: {
          tenantId: id,
          role: 'ADMIN_TENANT',
        },
      });

      // If email was updated, also search by email (case-insensitive)
      if (!adminUser && input.email) {
        adminUser = await tx.user.findFirst({
          where: {
            tenantId: id,
            role: 'ADMIN_TENANT',
            email: {
              equals: input.email,
              mode: 'insensitive',
            },
          },
        });
      }

      if (adminUser) {
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Encrypt defaultPassword before storing
        const { encrypt: encryptPassword } = await import('../utils/encryption');
        const encryptedDefaultPassword = encryptPassword(input.password);

        // Prepare user update data
        const userUpdateData: any = {
          password: hashedPassword,
          defaultPassword: encryptedDefaultPassword, // Store encrypted default password
        };

        // If email was updated, also normalize the user's email to lowercase
        if (input.email) {
          userUpdateData.email = input.email.toLowerCase();
        }

        await tx.user.update({
          where: { id: adminUser.id },
          data: userUpdateData,
        });

        logger.info(`✅ Updated admin password for tenant ${id}, user ${adminUser.id}`);
      } else {
        logger.warn(`⚠️  Admin user not found for tenant ${id} when updating password`);
      }
    }

    return tenant;
  });

  // Invalidate cache
  const redis = getRedisClient();
  if (redis) {
    try {
      // Invalidate tenant cache
      await redis.del(`tenant:${id}`);
      // Invalidate tenants list cache (all pages)
      const keys = await redis.keys('tenants:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.warn('Failed to invalidate tenant cache:', error);
    }
  }

  return updatedTenant;
};

export const deleteTenant = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          orders: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Delete tenant and all related data in transaction
  // IMPORTANT: Order matters due to foreign key constraints
  // Delete in reverse dependency order: child tables first, then parent tables
  await prisma.$transaction(async (tx) => {
    // 1. Delete OrderItems first (depends on Order)
    const orders = await tx.order.findMany({
      where: { tenantId: id },
      select: { id: true },
    });

    for (const order of orders) {
      await tx.orderItem.deleteMany({
        where: { orderId: order.id },
      });
    }

    // 2. Delete Transactions (depends on Order)
    await tx.transaction.deleteMany({
      where: { tenantId: id },
    });

    // 3. Delete Orders (depends on User, Tenant, Customer, Member, Outlet)
    await tx.order.deleteMany({
      where: { tenantId: id },
    });

    // 4. Delete ProductAdjustments (depends on User, Product, Tenant)
    await tx.productAdjustment.deleteMany({
      where: { tenantId: id },
    });

    // 5. Delete CashShifts (depends on User, Tenant)
    await tx.cashShift.deleteMany({
      where: { tenantId: id },
    });

    // 6. Delete PaymentMappings (depends on Order)
    await tx.paymentMapping.deleteMany({
      where: { tenantId: id },
    });

    // 7. Delete Products (depends on Tenant)
    await tx.product.deleteMany({
      where: { tenantId: id },
    });

    // 8. Delete Customers (depends on Tenant)
    await tx.customer.deleteMany({
      where: { tenantId: id },
    });

    // 9. Delete Members (depends on Tenant)
    await tx.member.deleteMany({
      where: { tenantId: id },
    });

    // 10. Delete Outlets (depends on Tenant)
    await tx.outlet.deleteMany({
      where: { tenantId: id },
    });

    // 11. Delete Reports (depends on Tenant)
    await tx.report.deleteMany({
      where: { tenantId: id },
    });

    // 12. Delete Discounts (depends on Tenant)
    await tx.discount.deleteMany({
      where: { tenantId: id },
    });

    // 13. Delete Employees (depends on Tenant)
    await tx.employee.deleteMany({
      where: { tenantId: id },
    });

    // 14. Delete Users (depends on Tenant) - NOW SAFE because Orders are deleted
    await tx.user.deleteMany({
      where: { tenantId: id },
    });

    // 15. Delete Subscriptions (depends on Tenant)
    await tx.subscription.deleteMany({
      where: { tenantId: id },
    });

    // 16. Delete Subscription History (depends on Tenant)
    await tx.subscriptionHistory.deleteMany({
      where: { tenantId: id },
    });

    // 17. Delete Tenant Addons (depends on Tenant)
    await tx.tenantAddon.deleteMany({
      where: { tenantId: id },
    });

    // 18. Delete Receipt Templates (depends on Tenant)
    await tx.receiptTemplate.deleteMany({
      where: { tenantId: id },
    });

    // 19. Delete BackupLogs (depends on Tenant)
    await tx.backupLog.deleteMany({
      where: { tenantId: id },
    });

    // 20. Delete RewardPoints (depends on Tenant, User)
    await tx.rewardPoint.deleteMany({
      where: { tenantId: id },
    });

    // 21. Delete AuditLogs (depends on Tenant, User)
    await tx.auditLog.deleteMany({
      where: { tenantId: id },
    });

    // 22. Delete Webhooks (depends on Tenant)
    await tx.webhook.deleteMany({
      where: { tenantId: id },
    });

    // 23. Delete EmailTemplates (depends on Tenant)
    await tx.emailTemplate.deleteMany({
      where: { tenantId: id },
    });

    // 24. Delete ScheduledEmails (depends on Tenant)
    await tx.scheduledEmail.deleteMany({
      where: { tenantId: id },
    });

    // 25. Delete Suppliers (depends on Tenant)
    await tx.supplier.deleteMany({
      where: { tenantId: id },
    });

    // 26. Delete PurchaseOrders and PurchaseOrderItems
    const purchaseOrders = await tx.purchaseOrder.findMany({
      where: { tenantId: id },
      select: { id: true },
    });

    for (const po of purchaseOrders) {
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: po.id },
      });
    }

    await tx.purchaseOrder.deleteMany({
      where: { tenantId: id },
    });

    // 27. Delete StockTransfers and StockTransferItems
    const stockTransfers = await tx.stockTransfer.findMany({
      where: { tenantId: id },
      select: { id: true },
    });

    for (const st of stockTransfers) {
      await tx.stockTransferItem.deleteMany({
        where: { stockTransferId: st.id },
      });
    }

    await tx.stockTransfer.deleteMany({
      where: { tenantId: id },
    });

    // 28. Delete StockValuations (depends on Tenant, Product)
    await tx.stockValuation.deleteMany({
      where: { tenantId: id },
    });

    // 29. Delete ReportTemplates (depends on Tenant)
    await tx.reportTemplate.deleteMany({
      where: { tenantId: id },
    });

    // 30. Delete ScheduledReports (depends on Tenant)
    await tx.scheduledReport.deleteMany({
      where: { tenantId: id },
    });

    // 31. Delete DashboardSettings (depends on Tenant, User)
    await tx.dashboardSettings.deleteMany({
      where: { tenantId: id },
    });

    // 32. Delete CashFlows (depends on Tenant)
    await tx.cashFlow.deleteMany({
      where: { tenantId: id },
    });

    // 33. Delete Expenses (depends on Tenant)
    await tx.expense.deleteMany({
      where: { tenantId: id },
    });

    // 34. Delete TaxCalculations (depends on Tenant)
    await tx.taxCalculation.deleteMany({
      where: { tenantId: id },
    });

    // 35. Delete FinancialForecasts (depends on Tenant)
    await tx.financialForecast.deleteMany({
      where: { tenantId: id },
    });

    // 36. Delete BankReconciliations (depends on Tenant)
    await tx.bankReconciliation.deleteMany({
      where: { tenantId: id },
    });

    // 37. Delete CustomerFeedbacks (depends on Tenant, Customer)
    await tx.customerFeedback.deleteMany({
      where: { tenantId: id },
    });

    // 38. Delete CustomerReviews (depends on Tenant, Customer, Product)
    await tx.customerReview.deleteMany({
      where: { tenantId: id },
    });

    // 39. Delete EmailEvents (depends on Tenant)
    await tx.emailEvent.deleteMany({
      where: { tenantId: id },
    });

    // 40. Finally, delete the tenant
    await tx.tenant.delete({
      where: { id },
    });
  });

  // Invalidate cache
  const redis = getRedisClient();
  if (redis) {
    try {
      // Invalidate tenant cache
      await redis.del(`tenant:${id}`);
      // Invalidate tenants list cache (all pages)
      const keys = await redis.keys('tenants:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.warn('Failed to invalidate tenant cache:', error);
    }
  }

  return { message: 'Tenant deleted successfully' };
};

export const updateTenantSubscription = async (
  tenantId: string,
  data: { plan: string; status: string; durationDays?: number }
) => {
  const result = await prisma.$transaction(async (tx) => {
    // Calculate new end date based on duration
    let newEndDate: Date | undefined;
    if (data.durationDays !== undefined && data.durationDays !== null) {
      newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + data.durationDays);
    }

    // Update Tenant
    const updateData: any = {
      subscriptionPlan: data.plan,
    };
    if (newEndDate) {
      updateData.subscriptionEnd = newEndDate;
    }

    await tx.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    // Update Active Subscription or Create One
    const activeSub = await tx.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Determine end date for subscription record
    // If activeSub exists and no new duration provided, keep existing end date?
    // User requirement: "Super Admin HANYA menginput: Jumlah Hari".
    // If we are editing, we probably want to set it.

    if (activeSub) {
      await tx.subscription.update({
        where: { id: activeSub.id },
        data: {
          plan: data.plan,
          status: data.status,
          // If calculated, use it. Else keep existing.
          endDate: newEndDate || activeSub.endDate,
        },
      });
    } else if (data.status === 'ACTIVE') {
      // Create new if none exists but status is active
      await tx.subscription.create({
        data: {
          tenantId,
          plan: data.plan,
          status: data.status,
          startDate: new Date(),
          endDate: newEndDate || new Date(), // Default to now if no duration? Or maybe 30 days default? Let's use validation in route to force duration if needed.
          amount: '0',
          purchasedBy: 'ADMIN',
        },
      });
    }

    return { success: true, endDate: newEndDate };
  });

  // Apply plan features
  try {
    const { applyPlanFeatures } = await import('./plan-features.service');
    await applyPlanFeatures(tenantId, data.plan);
  } catch (error: any) {
    logger.warn(`Failed to apply plan features: ${error.message}`);
  }

  // Invalidate cache
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(`tenant:${tenantId}`);
      const keys = await redis.keys('tenants:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.warn('Failed to invalidate tenant cache:', error);
    }
  }

  return result;
};


export default { createTenant, getTenants, getTenantById, updateTenant, deleteTenant, updateTenantSubscription };
