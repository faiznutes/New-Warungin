/**
 * API Key Rotation Utility
 * Supports multiple API keys (current + previous) for smooth rotation
 * Uses Redis to store and validate API keys
 */

import { getRedisClient } from '../config/redis';
import logger from './logger';
import env from '../config/env';

const API_KEY_PREFIX = 'apikey:';
const CURRENT_KEY = 'apikey:current';
const PREVIOUS_KEY = 'apikey:previous';
const ROTATION_KEY = 'apikey:rotation:';

/**
 * Initialize API keys in Redis (called on startup)
 */
export async function initializeApiKeys(): Promise<void> {
  try {
    const redis = getRedisClient();
    const currentKey = env.INTERNAL_API_KEY || 'change-me-in-production';
    
    // Store current key
    await redis.set(CURRENT_KEY, currentKey);
    
    // Check if there's a previous key in Redis (from previous rotation)
    const previousKey = await redis.get(PREVIOUS_KEY);
    if (!previousKey) {
      // No previous key, set it to current (for first time)
      await redis.set(PREVIOUS_KEY, currentKey);
    }
    
    logger.info('API keys initialized in Redis');
  } catch (error) {
    logger.error('Failed to initialize API keys', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Validate API key (checks both current and previous for smooth rotation)
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    
    // Get current and previous keys
    const [currentKey, previousKey] = await Promise.all([
      redis.get(CURRENT_KEY),
      redis.get(PREVIOUS_KEY),
    ]);
    
    // Check against current key
    if (currentKey && apiKey === currentKey) {
      return true;
    }
    
    // Check against previous key (for rotation period)
    if (previousKey && apiKey === previousKey) {
      logger.warn('API key validated using previous key (rotation in progress)', {
        keyPrefix: apiKey.substring(0, 8) + '...',
      });
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Failed to validate API key', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Fallback to env check if Redis fails
    const currentKey = env.INTERNAL_API_KEY || 'change-me-in-production';
    return apiKey === currentKey;
  }
}

/**
 * Rotate API key (set new key as current, old current as previous)
 */
export async function rotateApiKey(newKey: string): Promise<void> {
  try {
    const redis = getRedisClient();
    
    // Get current key
    const currentKey = await redis.get(CURRENT_KEY);
    
    if (currentKey) {
      // Move current to previous
      await redis.set(PREVIOUS_KEY, currentKey);
      
      // Set expiration for previous key (30 days grace period)
      await redis.expire(PREVIOUS_KEY, 30 * 24 * 60 * 60);
    }
    
    // Set new key as current
    await redis.set(CURRENT_KEY, newKey);
    
    // Store rotation timestamp
    await redis.set(`${ROTATION_KEY}${Date.now()}`, newKey);
    
    logger.info('API key rotated successfully', {
      newKeyPrefix: newKey.substring(0, 8) + '...',
    });
  } catch (error) {
    logger.error('Failed to rotate API key', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get current API key
 */
export async function getCurrentApiKey(): Promise<string | null> {
  try {
    const redis = getRedisClient();
    return await redis.get(CURRENT_KEY);
  } catch (error) {
    logger.error('Failed to get current API key', {
      error: error instanceof Error ? error.message : String(error),
    });
    return env.INTERNAL_API_KEY || null;
  }
}

/**
 * Get rotation history
 */
export async function getRotationHistory(limit: number = 10): Promise<Array<{ timestamp: number; keyPrefix: string }>> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(`${ROTATION_KEY}*`);
    
    const history = await Promise.all(
      keys.slice(-limit).map(async (key) => {
        const timestamp = parseInt(key.replace(ROTATION_KEY, ''));
        const keyValue = await redis.get(key);
        return {
          timestamp,
          keyPrefix: keyValue ? keyValue.substring(0, 8) + '...' : 'unknown',
        };
      })
    );
    
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error('Failed to get rotation history', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
