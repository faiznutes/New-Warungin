/**
 * Webhook Retry Queue using Redis
 * Handles failed payment callbacks and retries them
 */

import { getRedisClient } from '../config/redis';
import logger from './logger';

const QUEUE_KEY = 'webhook:retry:queue';
const PROCESSED_KEY_PREFIX = 'webhook:processed:';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export interface WebhookPayload {
  orderId: string;
  transactionId: string;
  transactionStatus: string;
  notification: any;
  timestamp: number;
  retryCount: number;
}

/**
 * Add webhook to retry queue
 */
export async function addToRetryQueue(payload: WebhookPayload): Promise<void> {
  try {
    const redis = getRedisClient();
    
    // Add to queue with timestamp
    await redis.lpush(QUEUE_KEY, JSON.stringify({
      ...payload,
      timestamp: Date.now(),
    }));
    
    logger.warn('Webhook added to retry queue', {
      orderId: payload.orderId,
      transactionId: payload.transactionId,
      retryCount: payload.retryCount,
    });
  } catch (error) {
    logger.error('Failed to add webhook to retry queue', {
      error: error instanceof Error ? error.message : String(error),
      orderId: payload.orderId,
    });
  }
}

/**
 * Get next webhook from retry queue
 */
export async function getNextFromQueue(): Promise<WebhookPayload | null> {
  try {
    const redis = getRedisClient();
    const item = await redis.rpop(QUEUE_KEY);
    
    if (!item) {
      return null;
    }
    
    return JSON.parse(item) as WebhookPayload;
  } catch (error) {
    logger.error('Failed to get webhook from retry queue', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Check if webhook has been processed (idempotency check)
 */
export async function isProcessed(transactionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const key = `${PROCESSED_KEY_PREFIX}${transactionId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Failed to check webhook processed status', {
      error: error instanceof Error ? error.message : String(error),
      transactionId,
    });
    // Fail open - allow processing if check fails
    return false;
  }
}

/**
 * Mark webhook as processed (idempotency)
 */
export async function markAsProcessed(transactionId: string, ttl: number = 86400): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `${PROCESSED_KEY_PREFIX}${transactionId}`;
    // Store for 24 hours (86400 seconds) to prevent duplicate processing
    await redis.setex(key, ttl, '1');
  } catch (error) {
    logger.error('Failed to mark webhook as processed', {
      error: error instanceof Error ? error.message : String(error),
      transactionId,
    });
  }
}

/**
 * Process retry queue (should be called periodically)
 */
export async function processRetryQueue(handler: (payload: WebhookPayload) => Promise<void>): Promise<void> {
  try {
    const payload = await getNextFromQueue();
    
    if (!payload) {
      return; // No items in queue
    }
    
    // Check if already processed
    if (await isProcessed(payload.transactionId)) {
      logger.info('Skipping already processed webhook', {
        transactionId: payload.transactionId,
        orderId: payload.orderId,
      });
      return;
    }
    
    // Check retry count
    if (payload.retryCount >= MAX_RETRIES) {
      logger.error('Webhook exceeded max retries, giving up', {
        transactionId: payload.transactionId,
        orderId: payload.orderId,
        retryCount: payload.retryCount,
      });
      return;
    }
    
    // Wait for retry delay
    const timeSinceLastAttempt = Date.now() - payload.timestamp;
    if (timeSinceLastAttempt < RETRY_DELAY) {
      // Put back in queue and wait
      await addToRetryQueue(payload);
      return;
    }
    
    try {
      // Process webhook
      await handler(payload);
      
      // Mark as processed on success
      await markAsProcessed(payload.transactionId);
      
      logger.info('Webhook retry successful', {
        transactionId: payload.transactionId,
        orderId: payload.orderId,
        retryCount: payload.retryCount,
      });
    } catch (error) {
      // Increment retry count and add back to queue
      const retryPayload: WebhookPayload = {
        ...payload,
        retryCount: payload.retryCount + 1,
        timestamp: Date.now(),
      };
      
      await addToRetryQueue(retryPayload);
      
      logger.warn('Webhook retry failed, will retry again', {
        transactionId: payload.transactionId,
        orderId: payload.orderId,
        retryCount: payload.retryCount,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    logger.error('Error processing retry queue', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get queue size
 */
export async function getQueueSize(): Promise<number> {
  try {
    const redis = getRedisClient();
    return await redis.llen(QUEUE_KEY);
  } catch (error) {
    logger.error('Failed to get queue size', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}
