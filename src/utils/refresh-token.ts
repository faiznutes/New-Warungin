/**
 * Refresh Token Management with Rotation and Blacklist
 * Uses Redis for token blacklist and rotation tracking
 */

import { getRedisClient } from '../config/redis';
import { generateToken, generateRefreshToken, verifyToken, TokenPayload } from './jwt';
import logger from './logger';
import env from '../config/env';

const BLACKLIST_PREFIX = 'refresh:blacklist:';
const TOKEN_FAMILY_PREFIX = 'refresh:family:';
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Blacklist a refresh token
 */
export async function blacklistRefreshToken(token: string, ttl: number = REFRESH_TOKEN_TTL): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `${BLACKLIST_PREFIX}${token}`;
    await redis.setex(key, ttl, '1');
  } catch (error) {
    logger.error('Failed to blacklist refresh token', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if refresh token is blacklisted
 */
export async function isRefreshTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const key = `${BLACKLIST_PREFIX}${token}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Failed to check refresh token blacklist', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Fail open - allow token if check fails
    return false;
  }
}

/**
 * Get token family (for rotation detection)
 */
async function getTokenFamily(userId: string): Promise<string | null> {
  try {
    const redis = getRedisClient();
    const key = `${TOKEN_FAMILY_PREFIX}${userId}`;
    return await redis.get(key);
  } catch (error) {
    logger.error('Failed to get token family', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    return null;
  }
}

/**
 * Set token family (for rotation detection)
 */
async function setTokenFamily(userId: string, familyId: string, ttl: number = REFRESH_TOKEN_TTL): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `${TOKEN_FAMILY_PREFIX}${userId}`;
    await redis.setex(key, ttl, familyId);
  } catch (error) {
    logger.error('Failed to set token family', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
  }
}

/**
 * Rotate refresh token (issue new token and blacklist old one)
 */
export async function rotateRefreshToken(
  oldToken: string,
  payload: TokenPayload
): Promise<{ token: string; refreshToken: string }> {
  // Blacklist old token
  await blacklistRefreshToken(oldToken);
  
  // Generate new tokens
  const token = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Update token family
  const familyId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  await setTokenFamily(payload.userId, familyId);
  
  return { token, refreshToken };
}

/**
 * Verify and rotate refresh token
 */
export async function verifyAndRotateRefreshToken(
  refreshToken: string
): Promise<{ token: string; refreshToken: string; payload: TokenPayload }> {
  // Check if token is blacklisted
  if (await isRefreshTokenBlacklisted(refreshToken)) {
    throw new Error('Refresh token has been revoked');
  }
  
  // Verify token
  const refreshSecret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  let payload: TokenPayload;
  
  try {
    const jwt = await import('jsonwebtoken');
    payload = jwt.verify(refreshToken, refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
  
  // Check token family (detect reuse)
  const currentFamily = await getTokenFamily(payload.userId);
  if (currentFamily) {
    // Token family exists - this is a rotation scenario
    // If old token is used again, it's a potential attack
    // We'll blacklist the entire family and require re-login
    logger.warn('Potential token reuse detected', {
      userId: payload.userId,
    });
    await blacklistRefreshToken(refreshToken);
    throw new Error('Refresh token has been revoked due to security reasons');
  }
  
  // Rotate token (issue new tokens and blacklist old one)
  const { token, refreshToken: newRefreshToken } = await rotateRefreshToken(refreshToken, payload);
  
  return {
    token,
    refreshToken: newRefreshToken,
    payload,
  };
}

/**
 * Revoke all refresh tokens for a user (logout all devices)
 */
export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  try {
    const redis = getRedisClient();
    // Remove token family to force re-login
    const key = `${TOKEN_FAMILY_PREFIX}${userId}`;
    await redis.del(key);
    
    logger.info('All refresh tokens revoked for user', { userId });
  } catch (error) {
    logger.error('Failed to revoke all refresh tokens', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
  }
}
