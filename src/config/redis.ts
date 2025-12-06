import { Redis } from 'ioredis';
import env from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;
let redisFailed = false; // Track if Redis connection has failed

// Initialize Redis connection on module load
const initializeRedis = async (): Promise<void> => {
  if (!env.REDIS_URL && (!env.REDIS_HOST || env.REDIS_HOST.trim() === '')) {
    throw new Error('Redis is required but not configured. Please set REDIS_URL or REDIS_HOST in environment variables.');
  }
};

export const getRedisClient = (): Redis => {
  // Redis is MANDATORY for production
  // Check if Redis is configured
  if (!env.REDIS_URL && (!env.REDIS_HOST || env.REDIS_HOST.trim() === '')) {
    throw new Error('Redis is required but not configured. Please set REDIS_URL or REDIS_HOST in environment variables.');
  }

  // If Redis connection has already failed, throw error (mandatory)
  if (redisFailed) {
    throw new Error('Redis connection failed. Redis is mandatory for this application.');
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
          lazyConnect: true,
          enableOfflineQueue: false, // Disable offline queue to fail fast
          connectTimeout: 2000, // 2 second timeout
          showFriendlyErrorStack: false, // Don't show full error stack
        }
      );

      redisClient.on('error', (err) => {
        logger.error('Redis error (mandatory service)', { error: err.message });
        // Mark as failed - Redis is mandatory
        if (err.message.includes('ECONNREFUSED') || err.message.includes('connect')) {
          logger.error('❌ Redis connection failed - Redis is mandatory for this application');
          redisFailed = true;
          redisClient = null;
        }
      });

      redisClient.on('connect', () => {
        logger.info('✅ Redis connected');
      });

      redisClient.on('ready', () => {
        logger.info('✅ Redis ready');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis (mandatory service)', { error: error instanceof Error ? error.message : String(error) });
      redisClient = null;
      throw new Error('Failed to initialize Redis. Redis is mandatory for this application.');
    }
  }

  if (!redisClient) {
    throw new Error('Redis client not initialized. Redis is mandatory for this application.');
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

