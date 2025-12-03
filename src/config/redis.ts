import { Redis } from 'ioredis';
import env from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;
let redisFailed = false; // Track if Redis connection has failed

export const getRedisClient = (): Redis | null => {
  // Redis is optional - return null if not configured
  // Check if Redis is explicitly disabled or not configured
  const redisHost = env.REDIS_HOST?.trim() || '';
  const hasRedisUrl = !!env.REDIS_URL;
  
  // If REDIS_URL is not set and REDIS_HOST is empty, don't try to connect
  if (!hasRedisUrl && !redisHost) {
    return null;
  }
  
  // If REDIS_HOST is 'redis' (default from docker-compose), check if Redis service is actually available
  // In production, if Redis service is not running, we should not try to connect
  // We'll let it try once, but if it fails, mark as failed immediately

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
            // Stop retrying after 2 attempts (reduced from 3)
            if (times > 2) {
              if (!redisFailed) {
                logger.info('ℹ️  Redis connection failed after 2 attempts - disabling Redis');
                redisFailed = true;
                // Disconnect and destroy client
                if (redisClient) {
                  redisClient.disconnect();
                  redisClient = null;
                }
              }
              return null; // Stop retrying
            }
            const delay = Math.min(times * 100, 1000);
            return delay;
          },
          maxRetriesPerRequest: null, // Required for BullMQ
          lazyConnect: true, // Don't connect immediately
          enableOfflineQueue: false, // Disable offline queue to fail fast
          connectTimeout: 2000, // 2 second timeout
          showFriendlyErrorStack: false, // Don't show full error stack
          enableReadyCheck: false, // Disable ready check to prevent errors
          autoResubscribe: false, // Disable auto resubscribe
          autoResendUnfulfilledCommands: false, // Disable auto resend
          // Suppress reconnect attempts
          reconnectOnError: () => {
            // Don't reconnect on error - fail fast
            return false;
          },
        }
      );

      // Track if we've logged connection errors to avoid spam
      let connectionErrorLogged = false;

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
        
        // Only log connection errors once to avoid spam
        if (isConnectionError && !connectionErrorLogged) {
          logger.info('ℹ️  Redis not available - scheduled jobs disabled (this is normal if Redis is not installed)');
          connectionErrorLogged = true;
          redisFailed = true;
          // Disconnect immediately to prevent further connection attempts
          if (redisClient) {
            try {
              redisClient.disconnect();
            } catch (e) {
              // Ignore disconnect errors
            }
            redisClient = null;
          }
        } else if (!isConnectionError) {
          logger.warn('Redis error (optional service):', errorMessage);
        }
      });
      
      // Handle connection close events to prevent unhandled rejection
      redisClient.on('close', () => {
        if (!redisFailed) {
          redisFailed = true;
          redisClient = null;
        }
      });
      
      // Handle end events
      redisClient.on('end', () => {
        if (!redisFailed) {
          redisFailed = true;
          redisClient = null;
        }
      });

      redisClient.on('connect', () => {
        logger.info('✅ Redis connected');
        redisFailed = false; // Reset failed flag on successful connection
        connectionErrorLogged = false;
      });

      redisClient.on('ready', () => {
        logger.info('✅ Redis ready');
        redisFailed = false; // Reset failed flag on ready
      });

      // Don't try to connect immediately - let it connect lazily when needed
      // This prevents connection errors on startup if Redis is not available
      // Connection will be attempted only when a command is executed
    } catch (error) {
      logger.info('ℹ️  Redis not available - scheduled jobs disabled');
      redisClient = null;
      redisFailed = true;
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

