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

// Export lazy getter - initialize on first access
export const notificationQueue = getNotificationQueue();

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
  if (!notificationQueue) {
    // Fallback: send directly via Socket.IO
    emitToTenant(data.tenantId, 'notification', {
      type: data.type,
      message: data.message,
      data: data.data,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  await notificationQueue.add('send-notification', {
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

