import { Redis } from 'ioredis';
import env from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;
let redisFailed = false; // Track if Redis connection has failed

export const getRedisClient = (): Redis | null => {
  // Redis is optional - return null if not configured
  // Check if Redis is explicitly disabled or not configured
  // If REDIS_URL is not set and REDIS_HOST is empty, don't try to connect
  if (!env.REDIS_URL && (!env.REDIS_HOST || env.REDIS_HOST.trim() === '')) {
    return null;
  }

  // If Redis connection has already failed, don't try again
  if (redisFailed) {
    return null;
  }

  if (!redisClient) {
    try {
      const redisConfig = env.REDIS_URL 
        ? env.REDIS_URL 
        : {
            host: env.REDIS_HOST || 'localhost',
            port: env.REDIS_PORT || 6379,
            password: env.REDIS_PASSWORD || undefined,
          };
      
      redisClient = new Redis(
        redisConfig as any,
        {
          retryStrategy: (times) => {
            // Stop retrying after 3 attempts
            if (times > 3) {
              logger.info('ℹ️  Redis connection failed after 3 attempts - disabling Redis');
              redisFailed = true;
              redisClient = null;
              return null; // Stop retrying
            }
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: null, // Required for BullMQ
          lazyConnect: true, // Don't connect immediately
          enableOfflineQueue: false, // Disable offline queue to fail fast
          connectTimeout: 2000, // 2 second timeout
          showFriendlyErrorStack: false, // Don't show full error stack
          // Suppress connection errors to prevent unhandled rejection
          enableReadyCheck: false, // Disable ready check to prevent errors
          autoResubscribe: false, // Disable auto resubscribe
          autoResendUnfulfilledCommands: false, // Disable auto resend
        }
      );

      redisClient.on('error', (err) => {
        // Suppress all Redis connection errors to prevent unhandled rejection
        // Redis is optional, so these errors are expected if Redis is not running
        const errorMessage = err.message || String(err);
        const isConnectionError = 
          errorMessage.includes('ECONNREFUSED') || 
          errorMessage.includes('connect') ||
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('Connection is closed') ||
          errorMessage.includes('getaddrinfo');
        
        if (!isConnectionError) {
          logger.warn('Redis error (optional service):', errorMessage);
        }
        
        // Mark as failed and set to null for any connection-related error
        if (isConnectionError) {
          logger.info('ℹ️  Redis not available - scheduled jobs disabled (this is normal if Redis is not installed)');
          redisFailed = true;
          redisClient = null;
        }
      });
      
      // Handle connection close events to prevent unhandled rejection
      redisClient.on('close', () => {
        logger.info('ℹ️  Redis connection closed - scheduled jobs disabled');
        redisFailed = true;
        redisClient = null;
      });
      
      // Handle end events
      redisClient.on('end', () => {
        logger.info('ℹ️  Redis connection ended - scheduled jobs disabled');
        redisFailed = true;
        redisClient = null;
      });

      redisClient.on('connect', () => {
        logger.info('✅ Redis connected');
      });

      redisClient.on('ready', () => {
        logger.info('✅ Redis ready');
      });
    } catch (error) {
      logger.info('ℹ️  Redis not available - scheduled jobs disabled');
      redisClient = null;
      return null;
    }
  }

  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
    } catch (error) {
      logger.warn('Redis close error:', error);
    }
  }
};

