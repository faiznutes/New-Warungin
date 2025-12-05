import { Redis } from 'ioredis';
import env from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;
let redisFailed = false; // Track if Redis connection has failed
let connectionErrorLogged = false; // Track if we've logged connection errors to avoid spam

export const getRedisClient = (): Redis | null => {
  // Redis is optional - return null if not configured
  // Check if Redis is explicitly disabled or not configured
  const redisHost = env.REDIS_HOST?.trim() || '';
  const hasRedisUrl = !!env.REDIS_URL;
  
  // If REDIS_URL is not set and REDIS_HOST is empty, don't try to connect
  if (!hasRedisUrl && !redisHost) {
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
            // Stop retrying after 1 attempt to fail fast
            if (times > 1) {
              if (!redisFailed) {
                redisFailed = true;
                // Disconnect and destroy client
                if (redisClient) {
                  try {
                    redisClient.disconnect();
                  } catch (e) {
                    // Ignore disconnect errors
                  }
                  redisClient = null;
                }
              }
              return null; // Stop retrying
            }
            return null; // Don't retry - fail immediately
          },
          maxRetriesPerRequest: 0, // No retries per request
          lazyConnect: true, // Don't connect immediately
          enableOfflineQueue: false, // Disable offline queue to fail fast
          connectTimeout: 1000, // 1 second timeout (reduced from 2s)
          showFriendlyErrorStack: false, // Don't show full error stack
          enableReadyCheck: false, // Disable ready check to prevent errors
          autoResubscribe: false, // Disable auto resubscribe
          autoResendUnfulfilledCommands: false, // Disable auto resend
          // Suppress reconnect attempts completely
          reconnectOnError: () => {
            // Don't reconnect on error - fail fast
            return false;
          },
        }
      );

      // Set up error handlers BEFORE any connection attempt
      redisClient.on('error', (err) => {
        // Suppress all Redis connection errors to prevent unhandled rejection
        // Redis is optional, so these errors are expected if Redis is not running
        const errorMessage = err.message || String(err);
        const isConnectionError = 
          errorMessage.includes('ECONNREFUSED') || 
          errorMessage.includes('connect') ||
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('Connection is closed') ||
          errorMessage.includes('getaddrinfo') ||
          errorMessage.includes('EAI_AGAIN');
        
        // Only log connection errors once to avoid spam
        if (isConnectionError && !connectionErrorLogged) {
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
        }
        // Don't log error - it's expected if Redis is not available
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
        connectionErrorLogged = false;
      });

      // Don't try to connect immediately - let it connect lazily when needed
      // This prevents connection errors on startup if Redis is not available
      // Connection will be attempted only when a command is executed
    } catch (error) {
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

