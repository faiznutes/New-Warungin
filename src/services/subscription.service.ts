import { PrismaClient } from '@prisma/client';
import prisma from '../config/database';
import { calculateUpgradeCost, addMonths, getDiscountForDuration } from '../utils/subscription-calculator';
import { applyPlanFeatures } from './plan-features.service';
import logger from '../utils/logger';

export interface CreateSubscriptionInput {
  plan: 'BASIC' | 'PRO' | 'CUSTOM';
  duration: number; // days
  addedBySuperAdmin?: boolean; // true if added by super admin
}

export interface UpgradeSubscriptionInput {
  newPlan: 'BASIC' | 'PRO' | 'CUSTOM';
  upgradeType: 'temporary' | 'until_end' | 'custom'; // temporary = 1 bulan, until_end = sampai masa aktif, custom = 3/6/12 bulan
  customDuration?: number; // days, only for custom type
}

export class SubscriptionService {
  async getCurrentSubscription(tenantId: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          subscriptions: {
            where: { 
              OR: [
                { status: 'ACTIVE' },
                { 
                  status: 'EXPIRED',
                  // IMPORTANT: Skip expired temporary subscriptions
                  // Hanya ambil expired subscriptions yang bukan temporary upgrade
                  temporaryUpgrade: { not: true },
                },
              ],
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const now = new Date();
      
      // IMPORTANT: Skip expired temporary subscriptions
      // Hanya ambil subscription yang ACTIVE atau yang bukan temporary upgrade
      // Priority: ACTIVE subscriptions first, then non-temporary EXPIRED
      // IMPORTANT: Skip temporary subscriptions yang sudah expired
      let subscription = tenant.subscriptions.find((sub: any) => 
        sub.status === 'ACTIVE' && (!sub.temporaryUpgrade || (sub.endDate && sub.endDate > now))
      ) || tenant.subscriptions.find((sub: any) => 
        sub.status === 'EXPIRED' && sub.temporaryUpgrade !== true
      ) || tenant.subscriptions.find((sub: any) => 
        sub.status === 'ACTIVE' && sub.temporaryUpgrade === true && sub.endDate && sub.endDate > now
      ) || null;
      
      // IMPORTANT: If subscription is temporary and expired, skip it
      if (subscription && (subscription as any).temporaryUpgrade === true && subscription.endDate && subscription.endDate <= now) {
        logger.debug('Found expired temporary subscription, skipping it', { tenantId });
        subscription = null; // Skip expired temporary subscription
      }
      
      let subscriptionEnd = tenant.subscriptionEnd || null;

      let daysRemaining = 0;
      let hoursRemaining = 0;
      let minutesRemaining = 0;
      let secondsRemaining = 0;
      let isExpired = false;
      let isTemporaryUpgrade = false;

      if (subscriptionEnd) {
        const diffTime = subscriptionEnd.getTime() - now.getTime();
        // IMPORTANT: Only mark as expired if subscriptionEnd is truly in the past
        // If subscriptionEnd is in the future (even by 1 millisecond), it's not expired
        isExpired = diffTime <= 0;
        
        if (!isExpired) {
          // Calculate all time units
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          daysRemaining = Math.floor(totalHours / 24);
          
          // Calculate remaining time for display when <= 1 day
          hoursRemaining = totalHours % 24;
          minutesRemaining = totalMinutes % 60;
          secondsRemaining = totalSeconds % 60;
        } else {
          // If expired, still calculate for reference
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      } else {
        // No subscriptionEnd means no active subscription
        isExpired = true;
        daysRemaining = 0;
      }

      // Check if this is a temporary upgrade (for displaying in minutes if < 1 day)
      if (subscription) {
        isTemporaryUpgrade = (subscription as any).temporaryUpgrade === true;
      }

      // Safely access temporaryUpgrade and previousPlan (may not exist if migration not run)
      // IMPORTANT: Initialize subscriptionData here, but it may be updated after revert
      let subscriptionData: any = subscription ? {
        ...subscription,
        temporaryUpgrade: (subscription as any).temporaryUpgrade ?? false,
        previousPlan: (subscription as any).previousPlan ?? null,
      } : null;

      // Get plan from subscription or tenant
      // IMPORTANT: If subscription is temporary and expired, use tenant plan (should be BASIC after revert)
      let currentPlan = subscriptionData?.plan || tenant.subscriptionPlan || 'BASIC';

      // IMPORTANT: Check if temporary upgrade has expired (even if tenant.subscriptionEnd is still in future)
      // Temporary upgrade should be reverted when the temporary subscription itself expires
      let shouldRevertTemporaryUpgrade = false;
      if (tenant.temporaryUpgrade === true && tenant.previousPlan) {
        // Find temporary subscription to check if it has expired
        // IMPORTANT: Query langsung dari database untuk memastikan kita dapat temporary subscription yang benar
        const tempSubscription = await prisma.subscription.findFirst({
          where: {
            tenantId: tenantId,
            temporaryUpgrade: true,
            status: { in: ['ACTIVE', 'EXPIRED'] },
          },
          orderBy: { createdAt: 'desc' },
        });
        
        if (tempSubscription && tempSubscription.endDate) {
          const tempSubscriptionEnd = tempSubscription.endDate;
          if (tempSubscriptionEnd <= now) {
            shouldRevertTemporaryUpgrade = true;
            logger.info('Temporary upgrade expired', { tenantId, subscriptionEnd: tempSubscriptionEnd.toISOString(), now: now.toISOString() });
          }
        } else if (tempSubscription && !tempSubscription.endDate) {
          // If temporary subscription exists but has no endDate, it should be reverted
          shouldRevertTemporaryUpgrade = true;
          logger.info('Temporary upgrade found without endDate, triggering revert', { tenantId });
        }
      }

      // IMPORTANT: If temporary upgrade has expired, trigger revert immediately
      // This ensures revert happens as soon as temporary subscription expires
      // IMPORTANT: Priority is to show remaining basic time, not expired boost
      if (shouldRevertTemporaryUpgrade && tenant.temporaryUpgrade === true && tenant.previousPlan) {
        try {
          // Trigger revert immediately when temporary upgrade expires
          logger.info('Triggering immediate revert for expired temporary upgrade', { tenantId });
          await this.revertTemporaryUpgradeForTenant(tenantId);
          
          // Reload tenant data after revert (with subscriptions to get updated subscription data)
          // IMPORTANT: Skip temporary subscriptions yang sudah dihapus
          const revertedTenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
              subscriptions: {
                where: { 
                  OR: [
                    { status: 'ACTIVE' },
                    { 
                      status: 'EXPIRED',
                      temporaryUpgrade: { not: true },
                    },
                  ],
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          });
          
          if (revertedTenant) {
            // Update all data from reverted tenant
            currentPlan = revertedTenant.subscriptionPlan || 'BASIC';
            subscriptionEnd = revertedTenant.subscriptionEnd;
            isTemporaryUpgrade = false; // No longer a temporary upgrade after revert
            
            // Update subscription data from reverted tenant
            // IMPORTANT: Find the most recent non-temporary subscription (BASIC plan)
            // Don't use expired temporary subscription
            // Priority: Find subscription that matches reverted plan and is not temporary
            const revertedSubscription = revertedTenant.subscriptions.find((sub: any) => 
              !sub.temporaryUpgrade && sub.plan === currentPlan && sub.status === 'ACTIVE'
            ) || revertedTenant.subscriptions.find((sub: any) => 
              !sub.temporaryUpgrade && sub.plan === currentPlan
            ) || revertedTenant.subscriptions.find((sub: any) => 
              !sub.temporaryUpgrade
            ) || null;
            
            if (revertedSubscription) {
              subscriptionData = {
                ...revertedSubscription,
                plan: currentPlan, // Ensure plan matches reverted plan
                temporaryUpgrade: false,
                previousPlan: null,
                status: subscriptionEnd && subscriptionEnd > now ? 'ACTIVE' : 'EXPIRED',
              };
            } else {
              // No subscription found, create a subscriptionData with correct plan from tenant
              // This ensures we show BASIC plan, not expired boost
              subscriptionData = {
                id: null,
                tenantId: tenantId,
                plan: currentPlan,
                startDate: revertedTenant.subscriptionStart || now,
                endDate: subscriptionEnd,
                status: subscriptionEnd && subscriptionEnd > now ? 'ACTIVE' : 'EXPIRED',
                amount: '0',
                temporaryUpgrade: false,
                previousPlan: null,
              };
            }
            
            // IMPORTANT: Update isTemporaryUpgrade to false after revert
            isTemporaryUpgrade = false;
            
            // Recalculate isExpired and remaining time based on reverted subscription
            if (subscriptionEnd) {
              const diffTime = subscriptionEnd.getTime() - now.getTime();
              isExpired = diffTime <= 0;
              
              if (!isExpired) {
                const totalSeconds = Math.floor(diffTime / 1000);
                const totalMinutes = Math.floor(totalSeconds / 60);
                const totalHours = Math.floor(totalMinutes / 60);
                daysRemaining = Math.floor(totalHours / 24);
                hoursRemaining = totalHours % 24;
                minutesRemaining = totalMinutes % 60;
                secondsRemaining = totalSeconds % 60;
              } else {
                daysRemaining = 0;
                hoursRemaining = 0;
                minutesRemaining = 0;
                secondsRemaining = 0;
              }
            } else {
              isExpired = true;
              daysRemaining = 0;
            }
            
            logger.debug('After revert', { tenantId, plan: currentPlan, subscriptionEnd: subscriptionEnd?.toISOString(), isExpired, daysRemaining });
          }
        } catch (error: any) {
          logger.error('Failed to revert temporary upgrade in getCurrentSubscription', { tenantId, error: error.message });
          // Continue with original logic if revert fails
        }
      } else if ((isExpired || shouldRevertTemporaryUpgrade) && currentPlan !== 'BASIC') {
        // Mark as expired in response, but don't revert here (already handled above or will be handled by middleware/cron)
        logger.warn('Subscription expired, revert will be handled by middleware/cron job', { tenantId, plan: currentPlan });
        // Only mark as expired if subscriptionEnd is truly expired
        if (subscriptionEnd && subscriptionEnd <= now) {
          isExpired = true;
        } else if (subscriptionEnd) {
          // SubscriptionEnd is in the future, so it's not expired
          isExpired = false;
          // Recalculate remaining time
          const diffTime = subscriptionEnd.getTime() - now.getTime();
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          daysRemaining = Math.floor(totalHours / 24);
          hoursRemaining = totalHours % 24;
          minutesRemaining = totalMinutes % 60;
          secondsRemaining = totalSeconds % 60;
        } else {
          // No subscriptionEnd, mark as expired
          isExpired = true;
        }
      } else if (isExpired && currentPlan === 'BASIC') {
        // If already BASIC but expired, still deactivate CASHIER, KITCHEN, SUPERVISOR users
        // ADMIN_TENANT is excluded (always remains active)
        // IMPORTANT: Only mark as expired if subscriptionEnd is truly expired
        // Don't mark as expired if subscriptionEnd is in the future
        if (subscriptionEnd && subscriptionEnd <= now) {
          // SubscriptionEnd is truly expired
          isExpired = true;
          try {
            const { updateUserStatusBasedOnSubscription } = await import('./user-status.service');
            await updateUserStatusBasedOnSubscription(tenantId);
          } catch (error: any) {
            logger.error('Failed to deactivate users for expired BASIC subscription', { tenantId, error: error.message });
          }
        } else if (subscriptionEnd) {
          // SubscriptionEnd is in the future, so it's not expired
          // This can happen after revert from temporary upgrade
          isExpired = false;
          // Recalculate remaining time
          const diffTime = subscriptionEnd.getTime() - now.getTime();
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          daysRemaining = Math.floor(totalHours / 24);
          hoursRemaining = totalHours % 24;
          minutesRemaining = totalMinutes % 60;
          secondsRemaining = totalSeconds % 60;
        } else {
          // No subscriptionEnd, mark as expired
          isExpired = true;
        }
      }

      // IMPORTANT: Use updated subscriptionEnd (may have been updated after revert)
      // Priority: Show remaining basic time, not expired boost
      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subscriptionPlan: currentPlan, // Return reverted plan if expired
          subscriptionStart: tenant.subscriptionStart,
          subscriptionEnd: subscriptionEnd, // Use updated subscriptionEnd after revert
        },
        subscription: subscriptionData,
        plan: currentPlan, // Add plan to response for easier access
        daysRemaining: Math.max(0, daysRemaining),
        hoursRemaining: Math.max(0, hoursRemaining),
        minutesRemaining: Math.max(0, minutesRemaining),
        secondsRemaining: Math.max(0, secondsRemaining),
        isExpired,
        isTemporaryUpgrade, // Will be false after revert
        status: isExpired ? 'EXPIRED' : (subscriptionData?.status || 'INACTIVE'),
      };
    } catch (error: any) {
      // Check if error is related to missing columns
      if (error.message?.includes('column') && (error.message?.includes('temporaryUpgrade') || error.message?.includes('previousPlan'))) {
        throw new Error('Database schema needs to be updated. Please run: node scripts/add-subscription-upgrade-fields.js');
      }
      throw error;
    }
  }

  async extendSubscription(tenantId: string, data: CreateSubscriptionInput) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const now = new Date();
    // IMPORTANT: If subscriptionEnd exists and is in the future or equal to now, extend from there
    // If subscriptionEnd is expired or null, start from now
    // This ensures we don't lose remaining duration when extending
    // Even if subscriptionEnd is slightly in the past (e.g., 1 second), we should still extend from it
    // to preserve any remaining duration
    const startDate = tenant.subscriptionEnd && tenant.subscriptionEnd >= now 
      ? tenant.subscriptionEnd 
      : now;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + data.duration);
    
    // Ensure endDate is in the future
    if (endDate <= now) {
      // If calculated endDate is in the past, set it to at least now + duration
      endDate.setTime(now.getTime() + (data.duration * 24 * 60 * 60 * 1000));
    }

    // Calculate amount based on plan with discount
    const planPrices: Record<string, number> = {
      BASIC: 200000,
      PRO: 350000,
      CUSTOM: 500000,
    };
    const monthlyPrice = planPrices[data.plan] || 0;
    
    // Discount based on duration: 3 bulan = 5%, 6 bulan = 10%, 12 bulan = 15%
    let discount = 0;
    if (data.duration >= 365) {
      discount = 0.15; // 15% for 12 months
    } else if (data.duration >= 180) {
      discount = 0.10; // 10% for 6 months
    } else if (data.duration >= 90) {
      discount = 0.05; // 5% for 3 months
    }
    
    const baseAmount = (monthlyPrice * data.duration) / 30;
    const amount = baseAmount * (1 - discount);

    return prisma.$transaction(async (tx) => {
      // Update tenant subscription
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: data.plan,
          subscriptionStart: startDate,
          subscriptionEnd: endDate,
        },
      });

      // Create subscription record
      const subscription = await tx.subscription.create({
        data: {
          tenantId,
          plan: data.plan,
          startDate,
          endDate,
          status: 'ACTIVE',
          amount: amount.toString(),
          addedBySuperAdmin: data.addedBySuperAdmin || false, // Set based on who created it
        },
      });

      // Update active addons: if addon expires after new subscription end, reduce it to subscription end
      const activeAddons = await tx.tenantAddon.findMany({
        where: {
          tenantId,
          status: 'active',
        },
      });

      for (const addon of activeAddons) {
        if (addon.expiresAt) {
          const addonExpiry = new Date(addon.expiresAt);
          if (addonExpiry > endDate) {
            await tx.tenantAddon.update({
              where: { id: addon.id },
              data: {
                expiresAt: endDate,
              },
            });
          }
        }
      }

      // Auto activate users when subscription is active
      await tx.user.updateMany({
        where: {
          tenantId,
          role: {
            in: ['CASHIER', 'KITCHEN', 'SUPERVISOR'],
          },
        },
        data: {
          isActive: true,
        },
      });

      return { tenant: updatedTenant, subscription };
    }).then(async (result) => {
      // Award points from subscription purchase (10rb = 5 point)
      // Use Math.floor to ensure integer amount
      const amountInt = Math.floor(amount);
      if (amountInt > 0) {
        try {
          const rewardPointService = (await import('./reward-point.service')).default;
          await rewardPointService.awardPointsFromSubscription(
            tenantId,
            amountInt,
            data.plan,
            data.duration
          );
        } catch (error: any) {
          // Log error but don't fail the subscription extension
          logger.error('Error awarding points from subscription', { error: error.message, tenantId });
        }
      }
      return result;
    });
  }

  /**
   * Upgrade subscription with prorata calculation
   */
  async upgradeSubscription(tenantId: string, data: UpgradeSubscriptionInput) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const now = new Date();
    const currentPlan = tenant.subscriptionPlan as 'BASIC' | 'PRO' | 'CUSTOM';
    const subscriptionEnd = tenant.subscriptionEnd;
    
    if (!subscriptionEnd || subscriptionEnd <= now) {
      throw new Error('Subscription has expired. Please extend first.');
    }

    // Validasi: Tidak bisa upgrade jika sudah memiliki temporaryUpgrade == true
    if (tenant.temporaryUpgrade === true) {
      throw new Error('Tidak bisa upgrade jika sudah memiliki temporary upgrade aktif. Tunggu hingga upgrade sementara berakhir.');
    }

    // Check if there's already a temporary upgrade active
    const existingTemporaryUpgrade = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        endDate: { gt: now },
        temporaryUpgrade: true,
      },
    });

    if (existingTemporaryUpgrade && data.upgradeType === 'temporary') {
      throw new Error('Tidak bisa memiliki dua temporary upgrade aktif bersamaan');
    }

    // Plan prices (monthly)
    const planPrices: Record<string, number> = {
      BASIC: 200000,
      PRO: 350000,
      CUSTOM: 500000,
    };

    const currentPlanPrice = planPrices[currentPlan] || 0;
    const newPlanPrice = planPrices[data.newPlan] || 0;

    // Calculate remaining days
    const remainingDays = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (remainingDays <= 0) {
      throw new Error('No remaining subscription days');
    }

    // Calculate upgrade duration and end date based on type
    let upgradeDuration = 0;
    let upgradeEndDate: Date;
    let temporaryUpgrade = false;
    let previousPlan: string | null = null;
    let upgradeMonths = 0;

    if (data.upgradeType === 'temporary') {
      // Temporary upgrade dengan custom duration (dalam days)
      // Jika customDuration diberikan, gunakan itu (dalam days)
      if (data.customDuration) {
        upgradeDuration = data.customDuration;
        // Treat as days (normal case)
        upgradeEndDate = new Date(now.getTime() + upgradeDuration * 24 * 60 * 60 * 1000);
        upgradeMonths = Math.ceil(upgradeDuration / 30);
      } else {
        // Default: 1 bulan ke depan
        upgradeMonths = 1;
        upgradeDuration = 30;
        upgradeEndDate = addMonths(now, upgradeMonths);
      }
      temporaryUpgrade = true;
      previousPlan = currentPlan;
    } else if (data.upgradeType === 'until_end') {
      // Sampai masa aktif selesai - plan baru aktif sampai tanggal endDate yang sama
      upgradeDuration = remainingDays;
      upgradeEndDate = subscriptionEnd; // Tetap menggunakan endDate yang sama
      upgradeMonths = Math.ceil(remainingDays / 30);
    } else if (data.upgradeType === 'custom' && data.customDuration) {
      // Custom duration (3, 6, 12 bulan) - menggantikan paket utama
      upgradeDuration = data.customDuration;
      upgradeMonths = Math.ceil(upgradeDuration / 30);
      upgradeEndDate = addMonths(now, upgradeMonths);
      
      // Jika custom duration melebihi subscription end, extend subscription
      if (upgradeEndDate > subscriptionEnd) {
        // Keep upgradeEndDate as calculated (extend subscription)
      } else {
        // Jika masih dalam masa aktif, gunakan subscription end
        upgradeEndDate = subscriptionEnd;
        upgradeDuration = remainingDays;
        upgradeMonths = Math.ceil(remainingDays / 30);
      }
    } else {
      throw new Error('Invalid upgrade type or missing custom duration');
    }

    // Calculate upgrade cost using the provided function
    const { upgradeCost } = calculateUpgradeCost({
      currentPlanPrice,
      newPlanPrice,
      endDate: subscriptionEnd,
      upgradeMonths,
    });

    // Apply discount for custom duration (3, 6, 12 bulan)
    let discount = 0;
    if (data.upgradeType === 'custom' && data.customDuration) {
      discount = getDiscountForDuration(data.customDuration);
    }

    const finalAmount = Math.max(0, upgradeCost * (1 - discount));

    return prisma.$transaction(async (tx) => {
      // Save original subscription end date before upgrade (for temporary upgrades)
      const originalSubscriptionEnd = temporaryUpgrade ? subscriptionEnd : null;

      // Update tenant subscription - CRITICAL: Always update subscriptionPlan
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: data.newPlan, // Always update to new plan
          subscriptionStart: now,
          subscriptionEnd: upgradeEndDate,
          ...(temporaryUpgrade && { temporaryUpgrade: true }),
          ...(previousPlan && { previousPlan }),
        } as any,
      });

      logger.info('Tenant subscription updated in database', {
        tenantId,
        oldPlan: currentPlan,
        newPlan: data.newPlan,
        subscriptionEnd: upgradeEndDate,
        originalSubscriptionEnd: originalSubscriptionEnd?.toISOString(),
        temporaryUpgrade,
        previousPlan,
      });

      // Create subscription record
      // Note: temporaryUpgrade and previousPlan will be available after prisma generate
      const subscription = await tx.subscription.create({
        data: {
          tenantId,
          plan: data.newPlan,
          startDate: now,
          endDate: upgradeEndDate,
          status: 'ACTIVE',
          amount: finalAmount.toString(),
          addedBySuperAdmin: false, // Upgrades are always purchased by tenant
          ...(temporaryUpgrade && { temporaryUpgrade: true }),
          ...(previousPlan && { previousPlan }),
        } as any,
      });

      // Save original subscription end to SubscriptionHistory for temporary upgrades
      // First, create history for original subscription (if not exists) so we can calculate remaining time on revert
      if (temporaryUpgrade && originalSubscriptionEnd && originalSubscriptionEnd > now) {
        // Find the last subscription history before this temporary upgrade
        const lastHistory = await tx.subscriptionHistory.findFirst({
          where: {
            tenantId: tenantId,
            isTemporary: false,
            createdAt: { lt: now },
          },
          orderBy: { createdAt: 'desc' },
        });

        // If no history exists or the last history doesn't match originalSubscriptionEnd, create one
        const needsHistory = !lastHistory || lastHistory.endDate.getTime() !== originalSubscriptionEnd.getTime();
        
        if (needsHistory) {
          await tx.subscriptionHistory.create({
            data: {
              subscriptionId: null, // Original subscription might not have a record
              tenantId: tenantId,
              planType: currentPlan,
              startDate: tenant.subscriptionStart || now,
              endDate: originalSubscriptionEnd,
              price: '0',
              durationDays: Math.ceil((originalSubscriptionEnd.getTime() - (tenant.subscriptionStart?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)),
              isTemporary: false,
              reverted: false,
            },
          });
          logger.debug('Created history record for original subscription', { tenantId, plan: currentPlan, endDate: originalSubscriptionEnd.toISOString() });
        }

        // Create history for temporary upgrade
        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            tenantId: tenantId,
            planType: data.newPlan,
            startDate: now,
            endDate: upgradeEndDate,
            price: finalAmount.toString(),
            durationDays: Math.ceil(upgradeDuration),
            isTemporary: true,
            reverted: false,
          },
        });
      }

      logger.info('Subscription record created', {
        tenantId,
        subscriptionId: subscription.id,
        plan: subscription.plan,
        temporaryUpgrade: (subscription as any).temporaryUpgrade,
        previousPlan: (subscription as any).previousPlan,
      });

      // Verify the update was successful
      const verifyTenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        select: { subscriptionPlan: true, subscriptionEnd: true },
      });

      if (verifyTenant?.subscriptionPlan !== data.newPlan) {
        throw new Error(`Failed to update subscription plan. Expected ${data.newPlan}, got ${verifyTenant?.subscriptionPlan}`);
      }

      return {
        tenant: updatedTenant,
        subscription,
        amount: finalAmount,
        upgradeDuration,
        temporaryUpgrade,
        previousPlan,
      };
    });
  }

  /**
   * Revert temporary upgrade for a specific tenant
   * This is called when subscription expires and needs to calculate remaining time
   */
  async revertTemporaryUpgradeForTenant(tenantId: string) {
    const now = new Date();
    
    // Get tenant with subscription info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionEnd: true,
        subscriptionStart: true,
        temporaryUpgrade: true,
        previousPlan: true,
      },
    });

    if (!tenant || !tenant.temporaryUpgrade || !tenant.previousPlan) {
      // Not a temporary upgrade or already reverted, skip
      logger.debug('Skipping revert: not a temporary upgrade or already reverted', { tenantId });
      return;
    }

    // Double-check: if temporaryUpgrade is already false, skip (already reverted)
    // This prevents multiple reverts on the same tenant
    // Note: This check is redundant since we already check above, but kept for safety
    if (!tenant.temporaryUpgrade) {
      logger.debug('Skipping revert: already reverted', { tenantId });
      return;
    }

    const revertPlan = tenant.previousPlan;

    try {
      // Find the temporary upgrade subscription first
      const temporarySubscription = await prisma.subscription.findFirst({
        where: {
          tenantId: tenantId,
          temporaryUpgrade: true,
          status: { in: ['ACTIVE', 'EXPIRED'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Find the subscription history before temporary upgrade to get originalSubscriptionEnd
      // This history was created when temporary upgrade was made (in tenant.routes.ts or upgradeSubscription)
      const upgradeStartDate = temporarySubscription?.startDate || temporarySubscription?.createdAt || tenant.subscriptionStart || now;
      
      // First, try to find history record created when temporary upgrade was made
      // This history has isTemporary: false and shows the original subscription end date
      const beforeTemporaryHistory = await prisma.subscriptionHistory.findFirst({
        where: {
          tenantId: tenantId,
          isTemporary: false,
          createdAt: { lt: upgradeStartDate },
        },
        orderBy: { createdAt: 'desc' },
      });

      let originalSubscriptionEnd: Date | null = null;
      
      // Priority 1: Use history record created when temporary upgrade was made
      if (beforeTemporaryHistory) {
        originalSubscriptionEnd = beforeTemporaryHistory.endDate;
        logger.debug('Found originalSubscriptionEnd from history', { tenantId, endDate: originalSubscriptionEnd.toISOString() });
      } else if (temporarySubscription) {
        // Priority 2: Try to find subscription before upgrade
        const subscriptionBeforeUpgrade = await prisma.subscription.findFirst({
          where: {
            tenantId: tenantId,
            id: { not: temporarySubscription.id },
            OR: [
              { createdAt: { lt: temporarySubscription.createdAt } },
              { startDate: { lt: temporarySubscription.startDate || temporarySubscription.createdAt } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        
        if (subscriptionBeforeUpgrade) {
          originalSubscriptionEnd = subscriptionBeforeUpgrade.endDate;
          logger.debug('Found originalSubscriptionEnd from subscription before upgrade', { tenantId, endDate: originalSubscriptionEnd.toISOString() });
        } else {
          // Priority 3: Try to estimate from tenant.subscriptionStart and calculate backwards
          // This is a fallback if we can't find history or previous subscription
          logger.warn('Could not find originalSubscriptionEnd, might cause incorrect remaining time calculation', { tenantId });
        }
      }

      // Calculate remaining time
      // Example: BASIC 25 hari tersisa, upgrade ke PRO 5 hari (temporary boost)
      // Saat boost 5 hari habis: sisa hari BASIC (25) - durasi temporary upgrade (5) = 20 hari BASIC baru
      // Formula: newSubscriptionEnd = originalSubscriptionEnd - (upgradeEndDate - upgradeStartDate)
      let newSubscriptionEnd: Date;
      if (originalSubscriptionEnd && temporarySubscription) {
        // Calculate upgrade duration in milliseconds
        const tempUpgradeStartDate = temporarySubscription.startDate || temporarySubscription.createdAt || upgradeStartDate;
        const upgradeEndDate = temporarySubscription.endDate || now;
        const upgradeDurationMs = upgradeEndDate.getTime() - tempUpgradeStartDate.getTime();
        
        logger.debug('Calculating remaining time', {
          tenantId,
          originalSubscriptionEnd: originalSubscriptionEnd.toISOString(),
          tempUpgradeStartDate: tempUpgradeStartDate.toISOString(),
          upgradeEndDate: upgradeEndDate.toISOString(),
          upgradeDurationDays: Math.floor(upgradeDurationMs / (1000 * 60 * 60 * 24)),
        });
        
        // Calculate remaining time from original subscription at the time of upgrade
        // remainingTimeFromOriginal = sisa waktu dari original subscription saat upgrade dimulai
        const remainingTimeFromOriginal = originalSubscriptionEnd.getTime() - tempUpgradeStartDate.getTime();
        const remainingTimeDays = Math.floor(remainingTimeFromOriginal / (1000 * 60 * 60 * 24));
        
        // New remaining time = remaining time from original - duration of temporary upgrade
        // Ini adalah logika: sisa basic - durasi boost = sisa basic baru
        const newRemainingTime = Math.max(0, remainingTimeFromOriginal - upgradeDurationMs);
        const newRemainingTimeDays = Math.floor(newRemainingTime / (1000 * 60 * 60 * 24));
        
        // Set new subscription end = now + new remaining time
        newSubscriptionEnd = new Date(now.getTime() + newRemainingTime);
        
        logger.debug('Remaining time calculation result', {
          tenantId,
          remainingTimeFromOriginalDays: remainingTimeDays,
          newRemainingTimeDays,
          newSubscriptionEnd: newSubscriptionEnd.toISOString(),
        });
        
        // IMPORTANT: Ensure newSubscriptionEnd is in the future (not expired)
        // If newRemainingTime > 0, newSubscriptionEnd should be in the future
        // Only set to now if newRemainingTime is 0 or negative
        if (newRemainingTime <= 0) {
          // No remaining time, set to now (expired)
          logger.warn('No remaining time, setting to now (expired)', { tenantId });
          newSubscriptionEnd = now;
        } else {
          // Still have remaining time, ensure it's in the future
          if (newSubscriptionEnd <= now) {
            // This shouldn't happen if calculation is correct, but add safety check
            logger.warn('newSubscriptionEnd is in the past, recalculating', { tenantId });
            newSubscriptionEnd = new Date(now.getTime() + newRemainingTime);
          }
          logger.debug('newSubscriptionEnd is in the future', { tenantId, newSubscriptionEnd: newSubscriptionEnd.toISOString() });
        }
      } else {
        // Fallback: if we can't find originalSubscriptionEnd, use current time
        logger.warn('Cannot calculate remaining time, using current time as fallback', {
          tenantId,
          hasOriginalSubscriptionEnd: !!originalSubscriptionEnd,
          hasTemporarySubscription: !!temporarySubscription,
        });
        newSubscriptionEnd = now;
      }

      // IMPORTANT: DELETE temporary subscription after revert
      // Jangan hanya mark as expired, karena akan tetap diambil di getCurrentSubscription
      // Delete agar tidak menyebabkan kadaluwarsa saat dipanggil ke backend
      if (temporarySubscription) {
        await prisma.subscription.delete({
          where: { id: temporarySubscription.id },
        });
        logger.debug('Deleted temporary subscription', { tenantId, subscriptionId: temporarySubscription.id });
      }

      // Revert tenant to previousPlan with calculated remaining time
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: revertPlan,
          subscriptionEnd: newSubscriptionEnd,
          temporaryUpgrade: false,
          previousPlan: null,
        },
      });

      // Verify the update was successful
      if (updatedTenant.subscriptionPlan !== revertPlan || updatedTenant.temporaryUpgrade !== false) {
        logger.error('Failed to revert tenant', {
          tenantId,
          subscriptionPlan: updatedTenant.subscriptionPlan,
          temporaryUpgrade: updatedTenant.temporaryUpgrade,
          expectedPlan: revertPlan,
        });
        throw new Error(`Failed to revert tenant: subscriptionPlan=${updatedTenant.subscriptionPlan}, temporaryUpgrade=${updatedTenant.temporaryUpgrade}`);
      }

      // Apply plan features (auto-disable users/outlets that exceed limit)
      const { applyPlanFeatures } = await import('./plan-features.service');
      await applyPlanFeatures(tenantId, revertPlan);

      // Update SubscriptionHistory to mark as reverted
      if (temporarySubscription) {
        const history = await prisma.subscriptionHistory.findFirst({
          where: {
            subscriptionId: temporarySubscription.id,
            tenantId: tenantId,
            isTemporary: true,
            reverted: false,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (history) {
          await prisma.subscriptionHistory.update({
            where: { id: history.id },
            data: { reverted: true },
          });
        }
      }

      const daysRemaining = Math.ceil((newSubscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      logger.info('Reverted temporary upgrade', {
        tenantId,
        oldPlan: tenant.subscriptionPlan,
        newPlan: revertPlan,
        daysRemaining,
      });
    } catch (error: any) {
      logger.error('Failed to revert temporary upgrade', { tenantId, error: error.message });
      throw error;
    }
  }

  /**
   * Revert temporary upgrades that have expired
   * Also revert expired PRO/CUSTOM subscriptions to BASIC
   * This should be called by a cron job daily
   */
  async revertTemporaryUpgrades() {
    const now = new Date();
    logger.info('Starting revert temporary upgrades job', { startedAt: now.toISOString() });
    
    // Find all tenants with expired subscriptions (check tenant.subscriptionEnd)
    // This will catch all expired PRO/CUSTOM tenants regardless of subscription records
    const expiredTenants = await prisma.tenant.findMany({
      where: {
        subscriptionEnd: { lte: now },
        subscriptionPlan: { in: ['PRO', 'CUSTOM'] },
      },
      include: {
        subscriptions: {
          where: {
            OR: [
              { status: 'ACTIVE' },
              { status: 'EXPIRED' }, // Also check expired subscriptions
            ],
            endDate: { lte: now },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    logger.debug('Found expired tenants with PRO/CUSTOM plan', { count: expiredTenants.length });

    // Also find expired subscriptions directly (both ACTIVE and EXPIRED to catch all)
    // Also check tenant.temporaryUpgrade to catch cases where subscription might not have the flag
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: { lte: now },
        status: { in: ['ACTIVE', 'EXPIRED'] },
      },
      include: {
        tenant: {
          select: {
            id: true,
            subscriptionPlan: true,
            subscriptionEnd: true,
            temporaryUpgrade: true,
            previousPlan: true,
          },
        },
      },
    });

    // Filter for temporary upgrades
    // Check both subscription.temporaryUpgrade and tenant.temporaryUpgrade
    const temporaryUpgrades = expiredSubscriptions.filter(
      (sub: any) => {
        const isTemporary = sub.temporaryUpgrade === true || sub.tenant?.temporaryUpgrade === true;
        const hasPreviousPlan = sub.previousPlan || sub.tenant?.previousPlan;
        return isTemporary && hasPreviousPlan;
      }
    );

    logger.debug('Found temporary upgrades to revert', { count: temporaryUpgrades.length });

    // Filter for expired PRO/CUSTOM subscriptions (non-temporary)
    // Check both from expiredSubscriptions and expiredTenants
    const expiredProMaxSubscriptions = [
      ...expiredSubscriptions.filter(
        (sub: any) => 
          !sub.temporaryUpgrade && 
          (sub.plan === 'PRO' || sub.plan === 'CUSTOM') &&
          sub.tenant.subscriptionPlan !== 'BASIC'
      ),
      ...expiredTenants
        .map(tenant => ({
          id: tenant.subscriptions.length > 0 ? tenant.subscriptions[0].id : null,
          tenantId: tenant.id,
          plan: tenant.subscriptionPlan,
          tenant: tenant,
        }))
        .filter((sub: any) => 
          (sub.plan === 'PRO' || sub.plan === 'CUSTOM') &&
          sub.plan !== 'BASIC'
        ),
    ];

    // Remove duplicates based on tenantId (one tenant can have multiple subscriptions)
    const uniqueExpiredProMax = expiredProMaxSubscriptions.filter(
      (sub, index, self) => {
        const currentTenantId = sub.tenantId || sub.tenant?.id;
        return index === self.findIndex((s) => (s.tenantId || s.tenant?.id) === currentTenantId);
      }
    );

    logger.debug('Found unique expired PRO/CUSTOM subscriptions to revert', { count: uniqueExpiredProMax.length });

    const results = [];

    // Process temporary upgrades (revert to previousPlan with remaining time)
    for (const upgrade of temporaryUpgrades) {
      // Get previousPlan from subscription or tenant
      const revertPlan = upgrade.previousPlan || upgrade.tenant?.previousPlan || 'BASIC';

      try {
        // Find the subscription history before temporary upgrade to get originalSubscriptionEnd
        // Look for the last non-temporary subscription history before this temporary upgrade
        const upgradeStartDate = upgrade.startDate || upgrade.createdAt || new Date();
        const beforeTemporaryHistory = await prisma.subscriptionHistory.findFirst({
          where: {
            tenantId: upgrade.tenantId,
            isTemporary: false,
            createdAt: { lt: upgradeStartDate },
          },
          orderBy: { createdAt: 'desc' },
        });

        // If no history found, try to get from subscription before upgrade
        // The originalSubscriptionEnd should be the subscriptionEnd before temporary upgrade started
        const subscriptionBeforeUpgrade = await prisma.subscription.findFirst({
          where: {
            tenantId: upgrade.tenantId,
            id: { not: upgrade.id },
            OR: [
              { createdAt: { lt: upgradeStartDate } },
              { startDate: { lt: upgradeStartDate } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        let originalSubscriptionEnd: Date | null = null;
        if (beforeTemporaryHistory) {
          // Use endDate from history
          originalSubscriptionEnd = beforeTemporaryHistory.endDate;
        } else if (subscriptionBeforeUpgrade) {
          // Use endDate from subscription before upgrade
          originalSubscriptionEnd = subscriptionBeforeUpgrade.endDate;
        } else {
          // Last resort: try to get from tenant's subscriptionEnd before upgrade
          // We can't directly get it, but we can estimate based on upgrade duration
          // If upgrade was temporary, the originalSubscriptionEnd should be after upgrade.endDate
          // But we don't have that info, so we'll use a fallback
          logger.warn('Could not find originalSubscriptionEnd, using fallback calculation', { tenantId: upgrade.tenantId });
        }

        // Calculate remaining time: originalSubscriptionEnd - duration of temporary upgrade
        // Example: BASIC 25 hari tersisa, upgrade ke PRO 5 hari (temporary boost)
        // Saat boost 5 hari habis: sisa hari BASIC (25) - durasi temporary upgrade (5) = 20 hari BASIC baru
        // Formula: newSubscriptionEnd = originalSubscriptionEnd - (upgradeEndDate - upgradeStartDate)
        let newSubscriptionEnd: Date;
        if (originalSubscriptionEnd) {
          // Get duration of temporary upgrade from subscription history
          const temporaryHistory = await prisma.subscriptionHistory.findFirst({
            where: {
              subscriptionId: upgrade.id,
              tenantId: upgrade.tenantId,
              isTemporary: true,
              reverted: false,
            },
            orderBy: { createdAt: 'desc' },
          });

          // Calculate upgrade duration in milliseconds (more accurate for small durations like 1 minute)
          const upgradeStartDate = upgrade.startDate || upgrade.createdAt || now;
          const upgradeEndDate = upgrade.endDate;
          const upgradeDurationMs = upgradeEndDate.getTime() - upgradeStartDate.getTime();
          
          // Calculate remaining time from original subscription at the time of upgrade
          // originalSubscriptionEnd is the end date of the original subscription
          // remainingTimeFromOriginal = sisa waktu dari original subscription saat upgrade dimulai
          const remainingTimeFromOriginal = originalSubscriptionEnd.getTime() - upgradeStartDate.getTime();
          
          // New remaining time = remaining time from original - duration of temporary upgrade
          // Ini adalah logika: sisa basic - durasi boost = sisa basic baru
          const newRemainingTime = Math.max(0, remainingTimeFromOriginal - upgradeDurationMs);
          
          // Set new subscription end = now + new remaining time
          newSubscriptionEnd = new Date(now.getTime() + newRemainingTime);
          
          // IMPORTANT: Ensure newSubscriptionEnd is in the future (not expired)
          // If newRemainingTime > 0, newSubscriptionEnd should be in the future
          // Only set to now if newRemainingTime is 0 or negative
          if (newRemainingTime <= 0) {
            // No remaining time, set to now (expired)
            newSubscriptionEnd = now;
          } else {
            // Still have remaining time, ensure it's in the future
            if (newSubscriptionEnd <= now) {
              // This shouldn't happen if calculation is correct, but add safety check
              newSubscriptionEnd = new Date(now.getTime() + newRemainingTime);
            }
          }
        } else {
          // Fallback: if we can't find originalSubscriptionEnd, use current time
          // This means the subscription has fully expired
          newSubscriptionEnd = now;
        }

        // Get upgrade duration for logging
        const upgradeStartDateForLog = upgrade.startDate || upgrade.createdAt || now;
        const upgradeDurationMsForLog = upgrade.endDate.getTime() - upgradeStartDateForLog.getTime();
        const upgradeDurationDaysForLog = upgradeDurationMsForLog / (1000 * 60 * 60 * 24);
        const remainingTimeFromOriginalForLog = originalSubscriptionEnd ? (originalSubscriptionEnd.getTime() - upgradeStartDateForLog.getTime()) : 0;
        const remainingDaysFromOriginalForLog = remainingTimeFromOriginalForLog / (1000 * 60 * 60 * 24);
        const newRemainingTimeForLog = newSubscriptionEnd.getTime() - now.getTime();
        const newRemainingDaysForLog = newRemainingTimeForLog / (1000 * 60 * 60 * 24);

        logger.info('Reverting temporary upgrade for tenant', {
          tenantId: upgrade.tenantId,
          upgradeStartDate: upgradeStartDateForLog,
          upgradeEndDate: upgrade.endDate,
          originalSubscriptionEnd: originalSubscriptionEnd?.toISOString(),
          remainingDaysFromOriginal: remainingDaysFromOriginalForLog.toFixed(4),
          upgradeDurationMs: upgradeDurationMsForLog,
          upgradeDurationDays: upgradeDurationDaysForLog.toFixed(4),
          newRemainingTimeMs: newRemainingTimeForLog,
          newRemainingDays: newRemainingDaysForLog.toFixed(4),
          newSubscriptionEnd: newSubscriptionEnd.toISOString(),
          revertPlan,
          currentTenantPlan: upgrade.tenant?.subscriptionPlan,
          currentTenantTemporaryUpgrade: upgrade.tenant?.temporaryUpgrade,
        });

        // Update subscription to mark as expired
        await prisma.subscription.update({
          where: { id: upgrade.id },
          data: {
            status: 'EXPIRED',
            ...({ temporaryUpgrade: false } as any),
          },
        });

        // Revert tenant to previousPlan with calculated remaining time
        const updatedTenant = await prisma.tenant.update({
          where: { id: upgrade.tenantId },
          data: {
            subscriptionPlan: revertPlan,
            subscriptionEnd: newSubscriptionEnd,
            temporaryUpgrade: false,
            previousPlan: null,
          },
        });

        // Verify the update was successful
        if (updatedTenant.subscriptionPlan !== revertPlan || updatedTenant.temporaryUpgrade !== false) {
          logger.error('Failed to revert tenant', {
            tenantId: upgrade.tenantId,
            subscriptionPlan: updatedTenant.subscriptionPlan,
            temporaryUpgrade: updatedTenant.temporaryUpgrade,
            expectedPlan: revertPlan,
          });
          throw new Error(`Failed to revert tenant: subscriptionPlan=${updatedTenant.subscriptionPlan}, temporaryUpgrade=${updatedTenant.temporaryUpgrade}`);
        }

        // Apply plan features (auto-disable users/outlets that exceed limit)
        await applyPlanFeatures(upgrade.tenantId, revertPlan);

        // Update SubscriptionHistory to mark as reverted
        const history = await prisma.subscriptionHistory.findFirst({
          where: {
            subscriptionId: upgrade.id,
            tenantId: upgrade.tenantId,
            isTemporary: true,
            reverted: false,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (history) {
          await prisma.subscriptionHistory.update({
            where: { id: history.id },
            data: { reverted: true },
          });
        }

        results.push({
          subscriptionId: upgrade.id,
          tenantId: upgrade.tenantId,
          revertedFrom: upgrade.plan,
          revertedTo: revertPlan,
          type: 'temporary_upgrade',
        });

        logger.info('Reverted temporary upgrade for tenant', {
          tenantId: upgrade.tenantId,
          oldPlan: upgrade.plan,
          newPlan: revertPlan,
        });
      } catch (error: any) {
        logger.error('Failed to revert temporary upgrade', {
          upgradeId: upgrade.id,
          tenantId: upgrade.tenantId,
          error: error.message,
        });
        results.push({
          subscriptionId: upgrade.id,
          tenantId: upgrade.tenantId,
          error: error.message,
          type: 'temporary_upgrade',
        });
      }
    }

    // Process expired PRO/CUSTOM subscriptions (revert to BASIC)
    for (const subscription of uniqueExpiredProMax) {
      try {
        const tenantId = subscription.tenantId || subscription.tenant?.id;
        const plan = subscription.plan || subscription.tenant?.subscriptionPlan;
        const subscriptionId = subscription.id;

        if (!tenantId || !plan) {
          logger.warn('Skipping subscription: missing tenantId or plan', { subscriptionId });
          continue;
        }

        // Update subscription to mark as expired (if subscription record exists)
        if (subscriptionId) {
          try {
            await prisma.subscription.update({
              where: { id: subscriptionId },
              data: {
                status: 'EXPIRED',
              },
            });
          } catch (error: any) {
            // Subscription might not exist, continue anyway
            logger.warn('Could not update subscription', { subscriptionId, error: error.message });
          }
        }

        // Revert tenant to BASIC plan
        // IMPORTANT: Keep subscriptionEnd unchanged (don't modify it, use original end date)
        const updatedTenant = await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionPlan: 'BASIC',
            temporaryUpgrade: false,
            previousPlan: null,
            // Keep subscriptionEnd as is - don't change it
          },
        });

        // Apply plan features (auto-disable users/outlets that exceed limit)
        await applyPlanFeatures(tenantId, 'BASIC');

        // Update SubscriptionHistory to mark as reverted (if exists)
        if (subscriptionId) {
          const history = await prisma.subscriptionHistory.findFirst({
            where: {
              subscriptionId: subscriptionId,
              tenantId: tenantId,
              reverted: false,
            },
            orderBy: { createdAt: 'desc' },
          });

          if (history) {
            await prisma.subscriptionHistory.update({
              where: { id: history.id },
              data: { reverted: true },
            });
          }
        }

        // Verify the update
        const verifyTenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { subscriptionPlan: true, subscriptionEnd: true },
        });

        if (verifyTenant?.subscriptionPlan !== 'BASIC') {
          throw new Error(`Failed to revert tenant ${tenantId} to BASIC. Current plan: ${verifyTenant?.subscriptionPlan}`);
        }

        results.push({
          subscriptionId: subscriptionId || null,
          tenantId: tenantId,
          revertedFrom: plan,
          revertedTo: 'BASIC',
          type: 'expired_pro_max',
          subscriptionEnd: verifyTenant?.subscriptionEnd,
        });

        logger.info('Reverted expired subscription', {
          tenantId,
          oldPlan: plan,
          newPlan: 'BASIC',
          subscriptionEnd: verifyTenant?.subscriptionEnd?.toISOString(),
        });
      } catch (error: any) {
        const errorTenantId = subscription.tenantId || subscription.tenant?.id || null;
        logger.error('Failed to revert expired subscription', {
          subscriptionId: subscription.id,
          tenantId: errorTenantId,
          error: error.message,
        });
        results.push({
          subscriptionId: subscription.id || null,
          tenantId: subscription.tenantId || subscription.tenant?.id || null,
          error: error.message,
          type: 'expired_pro_max',
        });
      }
    }

    const summary = {
      reverted: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results,
    };

    logger.info('Revert job completed', {
      reverted: summary.reverted,
      failed: summary.failed,
      total: summary.reverted + summary.failed,
    });

    return summary;
  }


  /**
   * Reduce subscription duration (for Super Admin)
   * This reduces the subscription end date by the specified number of days
   */
  async reduceSubscriptionCustom(tenantId: string, duration: number) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!tenant.subscriptionEnd) {
      throw new Error('Tenant does not have an active subscription');
    }

    const now = new Date();
    const currentEndDate = tenant.subscriptionEnd;
    
    // Calculate new end date (reduce by duration days)
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() - duration);

    // Ensure new end date is not in the past (or at least not before now)
    if (newEndDate < now) {
      throw new Error(`Cannot reduce subscription by ${duration} days. It would make the subscription end date in the past.`);
    }

    // Check if there's an active subscription record
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prisma.$transaction(async (tx) => {
      // Update tenant subscription end date
      // If reducing temporary upgrade to past or now, clear temporaryUpgrade flags
      const shouldClearTemporaryUpgrade = tenant.temporaryUpgrade === true && newEndDate <= now;
      
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionEnd: newEndDate,
          ...(shouldClearTemporaryUpgrade ? {
            temporaryUpgrade: false,
            previousPlan: null,
          } : {}),
        } as any,
      });

      // Update active subscription record if exists
      if (activeSubscription) {
        await tx.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            endDate: newEndDate,
            ...(shouldClearTemporaryUpgrade ? {
              ...({ temporaryUpgrade: false } as any),
            } : {}),
          },
        });
      }

      // Save to SubscriptionHistory
      if (activeSubscription) {
        const durationDays = Math.ceil((newEndDate.getTime() - activeSubscription.startDate.getTime()) / (1000 * 60 * 60 * 24));
        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: activeSubscription.id,
            tenantId: tenantId,
            planType: activeSubscription.plan,
            startDate: activeSubscription.startDate,
            endDate: newEndDate,
            price: activeSubscription.amount.toString(),
            durationDays: durationDays,
            isTemporary: activeSubscription.temporaryUpgrade || false,
            reverted: false,
          },
        });
      }

      return {
        tenant: updatedTenant,
        previousEndDate: currentEndDate,
        newEndDate: newEndDate,
        reducedBy: duration,
      };
    });
  }

  /**
   * Extend subscription with custom duration (for Super Admin)
   * This allows extending without changing plan
   */
  async extendSubscriptionCustom(tenantId: string, duration: number, addedBySuperAdmin: boolean = false) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

      const now = new Date();
      // IMPORTANT: If subscriptionEnd exists and is in the future or equal to now, extend from there
      // If subscriptionEnd is expired or null, start from now
      // This ensures we don't lose remaining duration when extending
      // Even if subscriptionEnd is slightly in the past (e.g., 1 second), we should still extend from it
      // to preserve any remaining duration
      const startDate = tenant.subscriptionEnd && tenant.subscriptionEnd >= now 
        ? tenant.subscriptionEnd 
        : now;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);
      
      // Ensure endDate is in the future
      if (endDate <= now) {
        // If calculated endDate is in the past, set it to at least now + duration
        endDate.setTime(now.getTime() + (duration * 24 * 60 * 60 * 1000));
      }

    // Calculate amount based on current plan
    const planPrices: Record<string, number> = {
      BASIC: 200000,
      PRO: 350000,
      CUSTOM: 500000,
    };
    const currentPlan = tenant.subscriptionPlan as 'BASIC' | 'PRO' | 'CUSTOM';
    const monthlyPrice = planPrices[currentPlan] || 0;
    
    // Discount based on duration
    let discount = 0;
    if (duration >= 365) {
      discount = 0.15;
    } else if (duration >= 180) {
      discount = 0.10;
    } else if (duration >= 90) {
      discount = 0.05;
    }
    
    const baseAmount = (monthlyPrice * duration) / 30;
    const amount = baseAmount * (1 - discount);

    return prisma.$transaction(async (tx) => {
      // If extending a temporary upgrade, preserve temporaryUpgrade flags
      // If extending a non-temporary subscription, clear temporaryUpgrade flags
      const shouldPreserveTemporaryUpgrade = tenant.temporaryUpgrade === true && tenant.previousPlan;
      
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStart: startDate,
          subscriptionEnd: endDate,
          // Preserve temporaryUpgrade flags if it's a temporary upgrade
          // Otherwise, ensure flags are cleared
          ...(shouldPreserveTemporaryUpgrade ? {} : {
            temporaryUpgrade: false,
            previousPlan: null,
          }),
        } as any,
      });

      const subscription = await tx.subscription.create({
        data: {
          tenantId,
          plan: currentPlan,
          startDate,
          endDate,
          status: 'ACTIVE',
          amount: amount.toString(),
          addedBySuperAdmin: addedBySuperAdmin, // Set based on who created it
          // Preserve temporaryUpgrade flags if it's a temporary upgrade
          ...(shouldPreserveTemporaryUpgrade ? {
            temporaryUpgrade: true,
            previousPlan: tenant.previousPlan,
          } : {}),
        } as any,
      });

      return { tenant: updatedTenant, subscription };
    });
  }

  /**
   * Reduce subscription duration (for Super Admin)
   */
  async reduceSubscription(tenantId: string, reduceDays: number) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!tenant.subscriptionEnd) {
      throw new Error('No active subscription to reduce');
    }

    const newEndDate = new Date(tenant.subscriptionEnd);
    newEndDate.setDate(newEndDate.getDate() - reduceDays);

    if (newEndDate <= new Date()) {
      throw new Error('Cannot reduce subscription to past date');
    }

    return prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionEnd: newEndDate,
      },
    });
  }
}

export default new SubscriptionService();
