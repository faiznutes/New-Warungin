/**
 * Daily Backup Email Job
 * Generates and sends daily backup reports to all active tenants
 * Runs at 23:59 daily
 */

import logger from '../utils/logger';
import dailyBackupService from '../services/daily-backup.service';

export const processDailyBackupEmailJob = async (): Promise<void> => {
  logger.info('🔄 Starting daily backup email job...');

  try {
    const result = await dailyBackupService.generateAllDailyBackups();
    
    logger.info(`✅ Daily backup email job completed:`, {
      total: result.total,
      success: result.success,
      failed: result.failed,
    });
  } catch (error: any) {
    logger.error('❌ Daily backup email job failed:', error);
    throw error;
  }
};
