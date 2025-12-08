import { Worker } from 'bullmq';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';
// Email system disabled - using n8n instead
// import { emailQueue } from '../queues/email.queue';
import { backupQueue } from '../queues/backup.queue';
import { notificationQueue } from '../queues/notification.queue';
import { getSubscriptionQueue } from '../queues/subscription.queue';
import { getAddonQueue } from '../queues/addon.queue';
// import { processEmailJob } from '../jobs/email.job';
import { processBackupJob } from '../jobs/backup.job';
import { processNotificationJob } from '../queues/notification.queue';
import { processSubscriptionRevertJob } from '../jobs/subscription-revert.job';
import { processDailyBackupEmailJob } from '../jobs/daily-backup-email.job';
import { processBackupMonitoringJob } from '../jobs/backup-monitoring.job';
import { processAddonExpiryCheckerJob } from '../jobs/addon-expiry-checker.job';

// Initialize workers lazily to avoid blocking app start
let redisClient: ReturnType<typeof getRedisClient> | null = null;
// Email worker disabled - using n8n instead
let backupWorker: Worker | null = null;
let notificationWorker: Worker | null = null;
let subscriptionWorker: Worker | null = null;
let addonWorker: Worker | null = null;
let workersInitialized = false;

// Initialize workers only when needed (lazy initialization)
const initializeWorkers = (): void => {
  if (workersInitialized) return;

  try {
    redisClient = getRedisClient();

    if (!redisClient) {
      logger.info('ℹ️  Redis not configured - scheduled jobs disabled');
      workersInitialized = true;
      return;
    }

    // Wait a bit for Redis connection, but don't block
    // If Redis is not available, workers will fail gracefully
    setTimeout(() => {
      try {
        // Check if Redis is actually connected before creating workers
        if (redisClient && redisClient.status === 'ready') {
          // Email worker disabled - using n8n instead
          // emailWorker = new Worker('email', async (job) => {
          //   await processEmailJob(job);
          // }, {
          //   connection: redisClient!,
          // });

          // Backup worker - handles both database backup and daily email backup
          backupWorker = new Worker('backup', async (job) => {
            if (job.name === 'daily-backup-email') {
              await processDailyBackupEmailJob();
            } else if (job.name === 'backup-monitoring') {
              await processBackupMonitoringJob();
            } else {
              await processBackupJob(job);
            }
          }, {
            connection: redisClient!,
          });

          // Addon expiry checker worker
          addonWorker = new Worker('addon', async (job) => {
            if (job.name === 'check-expired-addons') {
              await processAddonExpiryCheckerJob();
            }
          }, {
            connection: redisClient!,
          });

          notificationWorker = new Worker('notification', async (job) => {
            await processNotificationJob(job);
          }, {
            connection: redisClient!,
          });

          subscriptionWorker = new Worker('subscription', async (job) => {
            await processSubscriptionRevertJob(job);
          }, {
            connection: redisClient!,
          });

          logger.info('✅ BullMQ workers created');
        } else {
          logger.warn('⚠️  Redis not ready - workers not created');
          logger.warn('⚠️  Scheduled jobs will be disabled');
        }
      } catch (error: any) {
        logger.warn('⚠️  Failed to create BullMQ workers:', error?.message || error);
        logger.warn('⚠️  Scheduled jobs will be disabled');
        // emailWorker = null; // Disabled
        backupWorker = null;
        notificationWorker = null;
        subscriptionWorker = null;
        addonWorker = null;
      }
      workersInitialized = true;
    }, 2000); // Wait 2 seconds for Redis connection
  } catch (error: any) {
    logger.warn('⚠️  Redis initialization error:', error?.message || error);
    logger.warn('⚠️  Scheduled jobs will be disabled');
    workersInitialized = true;
  }
};

// Schedule jobs
export const scheduleJobs = async (): Promise<void> => {
  if (!redisClient) {
    logger.warn('⚠️  Redis not available - scheduled jobs disabled');
    return;
  }

  const subscriptionQueue = getSubscriptionQueue();

  try {
    // Daily backup email job (runs at 23:59 - before midnight)
    if (backupQueue) {
      await backupQueue.add(
        'daily-backup-email',
        {},
        {
          repeat: {
            pattern: '59 23 * * *', // 23:59 daily
          },
        }
      );
      logger.info('✅ Daily backup email job scheduled: 23:59 daily');
    }

    // Backup monitoring job (runs at 08:00)
    if (backupQueue) {
      await backupQueue.add(
        'backup-monitoring',
        {},
        {
          repeat: {
            pattern: '0 8 * * *', // 08:00 daily
          },
        }
      );
      logger.info('✅ Backup monitoring job scheduled: 08:00 daily');
    }

    // Legacy database backup job (runs at 2 AM) - keep for backward compatibility
    if (backupQueue) {
      await backupQueue.add(
        'daily-backup',
        {
          type: 'incremental',
        },
        {
          repeat: {
            pattern: '0 2 * * *', // 2 AM daily
          },
        }
      );
    }

    // Subscription revert job
    // In production: daily at 3 AM
    if (subscriptionQueue) {
      const pattern = '0 3 * * *'; // 3 AM daily for production
      
      await subscriptionQueue.add(
        'revert-temporary-upgrades',
        {},
        {
          repeat: {
            pattern: pattern,
          },
        }
      );
      
      logger.info(`✅ Subscription revert job scheduled: ${pattern}`);
    }

    // Addon expiry checker job (runs daily at 4 AM)
    const addonQueue = getAddonQueue();
    if (addonQueue) {
      await addonQueue.add(
        'check-expired-addons',
        {},
        {
          repeat: {
            pattern: '0 4 * * *', // 4 AM daily
          },
        }
      );
      logger.info('✅ Addon expiry checker job scheduled: 04:00 daily');
    }

    logger.info('✅ Scheduled jobs initialized');
  } catch (error) {
    logger.warn('⚠️  Failed to initialize scheduled jobs:', error);
  }
};

// Process scheduled emails (runs every minute)
// This can be called directly or integrated with a cron library
let scheduledEmailInterval: NodeJS.Timeout | null = null;

// Webhook retry queue processor (runs every 10 seconds)
let webhookRetryInterval: NodeJS.Timeout | null = null;

export const startScheduledEmailProcessor = (): void => {
  // Only start if not already running
  if (scheduledEmailInterval) {
    return;
  }

  // Import email scheduler service
  import('../services/email-scheduler.service').then(({ default: emailSchedulerService }) => {
    // Process scheduled emails every minute
    scheduledEmailInterval = setInterval(async () => {
      try {
        const results = await emailSchedulerService.processScheduledEmails();
        if (results.processed > 0) {
          logger.info(`✅ Processed ${results.processed} scheduled emails: ${results.sent} sent, ${results.failed} failed`);
        }
      } catch (error: any) {
        logger.error('❌ Error processing scheduled emails:', error);
      }
    }, 60000); // Every minute (60000 ms)

    logger.info('✅ Scheduled email processor started (runs every minute)');
  }).catch((error) => {
    logger.warn('⚠️  Failed to start scheduled email processor:', error);
  });
};

export const stopScheduledEmailProcessor = (): void => {
  if (scheduledEmailInterval) {
    clearInterval(scheduledEmailInterval);
    scheduledEmailInterval = null;
    logger.info('✅ Scheduled email processor stopped');
  }
};

/**
 * Start webhook retry queue processor
 */
export const startWebhookRetryProcessor = (): void => {
  if (webhookRetryInterval) {
    return; // Already running
  }

  import('../utils/webhook-queue').then(({ processRetryQueue }) => {
    import('../services/payment.service').then(({ default: paymentService }) => {
      // Process retry queue every 10 seconds
      webhookRetryInterval = setInterval(async () => {
        try {
          await processRetryQueue(async (payload) => {
            // Re-process webhook
            await paymentService.handleWebhook(payload.notification);
          });
        } catch (error: any) {
          logger.error('Error processing webhook retry queue', {
            error: error.message,
            stack: error.stack,
          });
        }
      }, 10000); // Every 10 seconds

      logger.info('✅ Webhook retry queue processor started (runs every 10 seconds)');
    }).catch((error) => {
      logger.warn('⚠️  Failed to start webhook retry processor:', error);
    });
  }).catch((error) => {
    logger.warn('⚠️  Failed to start webhook retry processor:', error);
  });
};

export const stopWebhookRetryProcessor = (): void => {
  if (webhookRetryInterval) {
    clearInterval(webhookRetryInterval);
    webhookRetryInterval = null;
    logger.info('✅ Webhook retry processor stopped');
  }
};

// Start scheduler (only after workers are initialized)
if (process.env.NODE_ENV !== 'test') {
  // Initialize workers asynchronously
  initializeWorkers();
  
  // Try to schedule jobs after a delay
  setTimeout(() => {
    if (redisClient) {
      scheduleJobs().catch((error) => {
        logger.error('Failed to start scheduler:', error);
      });
    }
  }, 2000);

  // Start scheduled email processor
  setTimeout(() => {
    startScheduledEmailProcessor();
  }, 3000); // Start after workers are initialized

  // Start webhook retry queue processor
  setTimeout(() => {
    startWebhookRetryProcessor();
  }, 4000); // Start after workers are initialized
}

// Email queue disabled - using n8n instead
// export { emailQueue, backupQueue, notificationQueue };
export { backupQueue, notificationQueue };

