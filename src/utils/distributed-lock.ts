/**
 * Distributed Lock Utility using Redis
 * Prevents race conditions in concurrent operations
 */

import { getRedisClient } from '../config/redis';
import logger from './logger';

const LOCK_PREFIX = 'lock:';
const DEFAULT_TTL = 30; // 30 seconds default lock timeout

/**
 * Acquire a distributed lock
 * @param key - Lock key (will be prefixed with 'lock:')
 * @param ttl - Time to live in seconds (default: 30)
 * @returns Lock token if acquired, null if already locked
 */
export async function acquireLock(key: string, ttl: number = DEFAULT_TTL): Promise<string | null> {
  try {
    const redis = getRedisClient();
    const lockKey = `${LOCK_PREFIX}${key}`;
    const lockToken = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Try to set lock with NX (only if not exists) and EX (expiration)
    const result = await redis.set(lockKey, lockToken, 'EX', ttl, 'NX');
    
    if (result === 'OK') {
      return lockToken;
    }
    
    return null; // Lock already exists
  } catch (error) {
    logger.error('Failed to acquire lock', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    // In case of Redis error, allow operation to proceed (fail open)
    // This prevents Redis failures from blocking critical operations
    return null;
  }
}

/**
 * Release a distributed lock
 * @param key - Lock key
 * @param token - Lock token returned from acquireLock
 * @returns true if released, false otherwise
 */
export async function releaseLock(key: string, token: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const lockKey = `${LOCK_PREFIX}${key}`;
    
    // Use Lua script to ensure we only delete if token matches (prevents deleting someone else's lock)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await redis.eval(script, 1, lockKey, token) as number;
    return result === 1;
  } catch (error) {
    logger.error('Failed to release lock', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Execute a function with a distributed lock
 * Automatically acquires and releases the lock
 * @param key - Lock key
 * @param fn - Function to execute
 * @param ttl - Lock timeout in seconds
 * @param retries - Number of retry attempts if lock is busy
 * @param retryDelay - Delay between retries in milliseconds
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
  retries: number = 3,
  retryDelay: number = 100
): Promise<T> {
  let lockToken: string | null = null;
  let attempts = 0;
  
  while (attempts <= retries) {
    lockToken = await acquireLock(key, ttl);
    
    if (lockToken) {
      try {
        // Lock acquired, execute function
        return await fn();
      } finally {
        // Always release lock
        await releaseLock(key, lockToken);
      }
    }
    
    // Lock is busy, wait and retry
    if (attempts < retries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempts + 1)));
      attempts++;
    } else {
      throw new Error(`Failed to acquire lock after ${retries} retries: ${key}`);
    }
  }
  
  throw new Error(`Failed to acquire lock: ${key}`);
}

/**
 * Check if a lock exists
 */
export async function isLocked(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const lockKey = `${LOCK_PREFIX}${key}`;
    const exists = await redis.exists(lockKey);
    return exists === 1;
  } catch (error) {
    logger.error('Failed to check lock status', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
