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
    // Create queue with lazy connection to prevent immediate connection attempt
    backupQueueInstance = new Queue('backup', {
      connection: redisClient,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
    return backupQueueInstance;
  } catch (error) {
    // Queue creation failed - Redis not available
    return null;
  }
};

// Export getter function - initialize on first access (not at module load)
// This prevents connection attempt during module initialization
export const getBackupQueueInstance = (): Queue | null => {
  return getBackupQueue();
};

// For backward compatibility, export as null initially
// Use getBackupQueueInstance() instead
export const backupQueue: Queue | null = null;

export const addBackupJob = async (
  tenantId: string | undefined,
  type: 'full' | 'incremental' = 'incremental'
): Promise<void> => {
  const queue = getBackupQueueInstance();
  if (!queue) {
    console.warn('Backup queue not available (Redis not configured)');
    return;
  }
  await queue.add('database-backup', {
    tenantId,
    type,
  });
};

