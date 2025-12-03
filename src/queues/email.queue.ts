import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';

// Lazy initialization - only create queue if Redis is actually available
let emailQueueInstance: Queue | null = null;

const getEmailQueue = (): Queue | null => {
  if (emailQueueInstance) {
    return emailQueueInstance;
  }
  
  const redisClient = getRedisClient();
  
  // Only create queue if Redis is actually available and not failed
  if (!redisClient) {
    return null;
  }
  
  try {
    emailQueueInstance = new Queue('email', {
      connection: redisClient,
    });
    return emailQueueInstance;
  } catch (error) {
    // Queue creation failed - Redis not available
    return null;
  }
};

// Export lazy getter - initialize on first access
export const emailQueue = getEmailQueue();

export const addEmailJob = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!emailQueue) {
    // Email queue not available (Redis not configured) - fail silently
    // This is expected in development environments without Redis
    return;
  }
  await emailQueue.add('send-email', {
    to,
    subject,
    html,
  });
};

