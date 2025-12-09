import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

let addonQueue: Queue | null = null;

export const getAddonQueue = (): Queue | null => {
  if (addonQueue) {
    return addonQueue;
  }

  const redisClient = getRedisClient();
  if (!redisClient) {
    logger.warn('⚠️  Redis not configured - addon queue disabled');
    return null;
  }

  try {
    addonQueue = new Queue('addon', {
      connection: redisClient,
    });
    logger.info('✅ Addon queue created');
    return addonQueue;
  } catch (error: any) {
    logger.error('❌ Failed to create addon queue:', error);
    return null;
  }
};

export { addonQueue };
