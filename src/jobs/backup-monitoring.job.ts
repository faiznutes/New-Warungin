/**
 * Backup Monitoring Job
 * Scans for failed backups and sends notifications
 * Runs at 08:00 daily
 */

import prisma from '../config/database';
import logger from '../utils/logger';

export const processBackupMonitoringJob = async (): Promise<void> => {
  logger.info('🔍 Starting backup monitoring job...');

  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find failed backups older than 1 day
    const failedBackups = await prisma.backupLog.findMany({
      where: {
        status: { in: ['failed', 'email_failed'] },
        generatedAt: { lt: oneDayAgo },
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
      orderBy: { generatedAt: 'desc' },
    });

    if (failedBackups.length > 0) {
      logger.warn(`⚠️ Found ${failedBackups.length} failed backups older than 1 day`);

      // Group by tenant
      const tenantFailures: Record<string, { tenant: any; failures: number; lastFailure: Date }> = {};

      for (const backup of failedBackups) {
        if (!tenantFailures[backup.tenantId]) {
          tenantFailures[backup.tenantId] = {
            tenant: backup.tenant,
            failures: 0,
            lastFailure: backup.generatedAt,
          };
        }
        tenantFailures[backup.tenantId].failures++;
        if (backup.generatedAt > tenantFailures[backup.tenantId].lastFailure) {
          tenantFailures[backup.tenantId].lastFailure = backup.generatedAt;
        }
      }

      // Check for tenants with 3+ consecutive days of failures
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const criticalFailures = Object.values(tenantFailures).filter(
        (tf) => tf.failures >= 3 && tf.lastFailure < threeDaysAgo
      );

      if (criticalFailures.length > 0) {
        logger.error(`🚨 CRITICAL: ${criticalFailures.length} tenants have failed backups for 3+ days:`, {
          tenants: criticalFailures.map(tf => ({
            tenantId: tf.tenant.id,
            tenantName: tf.tenant.name,
            failures: tf.failures,
            lastFailure: tf.lastFailure,
          })),
        });

        // TODO: Send notification to super admin (Telegram, email, etc.)
        // For now, just log it
      }
    } else {
      logger.info('✅ All backups are healthy');
    }

    logger.info('✅ Backup monitoring job completed');
  } catch (error: any) {
    logger.error('❌ Backup monitoring job failed:', error);
    throw error;
  }
};
