/**
 * Job to check and deactivate expired addons
 * Runs daily to check for expired addons and deactivate them
 */

import prisma from '../config/database';
import logger from '../utils/logger';

export async function processAddonExpiryCheckerJob(): Promise<void> {
  try {
    const now = new Date();
    
    // Find all active addons that have expired
    const expiredAddons = await prisma.tenantAddon.findMany({
      where: {
        status: 'active',
        expiresAt: {
          lte: now, // expiresAt <= now means expired
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (expiredAddons.length === 0) {
      logger.info('✅ No expired addons found');
      return;
    }

    // Deactivate expired addons
    const deactivatedCount = await prisma.tenantAddon.updateMany({
      where: {
        id: { in: expiredAddons.map(a => a.id) },
      },
      data: {
        status: 'inactive',
      },
    });

    logger.info(`✅ Deactivated ${deactivatedCount.count} expired addon(s)`, {
      addons: expiredAddons.map(a => ({
        id: a.id,
        addonName: a.addonName,
        tenantId: a.tenantId,
        tenantName: a.tenant.name,
        expiredAt: a.expiresAt,
      })),
    });

    // Check for addons expiring in 3 days (for notifications)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoonAddons = await prisma.tenantAddon.findMany({
      where: {
        status: 'active',
        expiresAt: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (expiringSoonAddons.length > 0) {
      logger.info(`⚠️  Found ${expiringSoonAddons.length} addon(s) expiring in 3 days`, {
        addons: expiringSoonAddons.map(a => ({
          id: a.id,
          addonName: a.addonName,
          tenantId: a.tenantId,
          tenantName: a.tenant.name,
          expiresAt: a.expiresAt,
        })),
      });
      
      // TODO: Send notification email to tenants about expiring addons
      // This can be implemented later with email service
    }
  } catch (error: any) {
    logger.error('❌ Error checking expired addons:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
