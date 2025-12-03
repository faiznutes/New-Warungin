import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';

// Lazy initialization - only create queue if Redis is actually available
let backupQueueInstance: Queue | null = null;

const getBackupQueue = (): Queue | null => {
  if (backupQueueInstance) {
    return backupQueueInstance;
  }
  
  const redisClient = getRedisClient();
  
  // Only create queue if Redis is actually available and not failed
  if (!redisClient) {
    return null;
  }
  
  try {
    backupQueueInstance = new Queue('backup', {
      connection: redisClient,
    });
    return backupQueueInstance;
  } catch (error) {
    // Queue creation failed - Redis not available
    return null;
  }
};

// Export lazy getter - initialize on first access
export const backupQueue = getBackupQueue();

export const addBackupJob = async (
  tenantId: string | undefined,
  type: 'full' | 'incremental' = 'incremental'
): Promise<void> => {
  if (!backupQueue) {
    console.warn('Backup queue not available (Redis not configured)');
    return;
  }
  await backupQueue.add('database-backup', {
    tenantId,
    type,
  });
};

