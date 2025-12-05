import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { emitToTenant } from '../socket/socket';

// Lazy initialization - only create queue if Redis is actually available
let notificationQueueInstance: Queue | null = null;

const getNotificationQueue = (): Queue | null => {
  if (notificationQueueInstance) {
    return notificationQueueInstance;
  }
  
  const redisClient = getRedisClient();
  
  // Only create queue if Redis is actually available and not failed
  if (!redisClient) {
    return null;
  }
  
  try {
    notificationQueueInstance = new Queue('notification', {
      connection: redisClient,
    });
    return notificationQueueInstance;
  } catch (error) {
    // Queue creation failed - Redis not available
    return null;
  }
};

// Export getter function - initialize on first access (not at module load)
// This prevents connection attempt during module initialization
export const getNotificationQueueInstance = (): Queue | null => {
  return getNotificationQueue();
};

// For backward compatibility, export as null initially
// Use getNotificationQueueInstance() instead
export const notificationQueue: Queue | null = null;

export interface NotificationData {
  tenantId: string;
  userId?: string;
  type: string;
  message: string;
  data?: any;
}

export const addNotificationJob = async (
  data: NotificationData
): Promise<void> => {
  const queue = getNotificationQueueInstance();
  if (!queue) {
    // Fallback: send directly via Socket.IO
    emitToTenant(data.tenantId, 'notification', {
      type: data.type,
      message: data.message,
      data: data.data,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  await queue.add('send-notification', {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Process notification job
export const processNotificationJob = async (job: any): Promise<void> => {
  const { tenantId, type, message, data } = job.data;

  // Emit via Socket.IO
  emitToTenant(tenantId, 'notification', {
    type,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

