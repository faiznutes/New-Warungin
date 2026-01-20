import crypto from 'crypto';
import env from '../config/env';

/**
 * Encryption utility for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 64; // 64 bytes for salt
const TAG_LENGTH = 16; // 16 bytes for GCM tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

// Get encryption key from environment or generate one
// In production, this should be set in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');

// Derive a consistent key from ENCRYPTION_KEY
function getKey(): Buffer {
  if (process.env.ENCRYPTION_KEY) {
    // Use provided key (should be 64 hex chars = 32 bytes)
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  
  // Fallback: derive key from JWT_SECRET (not ideal, but better than nothing)
  // This is a temporary solution - should set ENCRYPTION_KEY in production
  const secret = env.JWT_SECRET;
  return crypto.pbkdf2Sync(secret, 'default-password-salt', 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt a plaintext string
 * @param plaintext - The text to encrypt
 * @returns Encrypted string in format: iv:salt:tag:encrypted
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return '';
  }

  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive key with salt for this specific encryption
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256');
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Return format: iv:salt:tag:encrypted (all hex encoded)
    return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    // If encryption fails, log error but don't crash
    // In production, this should never happen
    logger.error('Encryption failed:', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedText - The encrypted text in format: iv:salt:tag:encrypted
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    return '';
  }

  // Check if it's already plaintext (for backward compatibility during migration)
  // If it doesn't contain colons, assume it's plaintext
  if (!encryptedText.includes(':')) {
    // This is likely plaintext from before encryption was implemented
    // Return as-is for backward compatibility
    // Migration: Supports both old and new encryption formats
    return encryptedText;
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, saltHex, tagHex, encrypted] = parts;
    
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const salt = Buffer.from(saltHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    // Derive key with salt (must match encryption)
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // If decryption fails, it might be plaintext from before encryption
    // Return as-is for backward compatibility
    // Log old format detection for audit trail
    console.error('Decryption failed, might be plaintext:', error);
    return encryptedText; // Return as-is for backward compatibility
  }
}

/**
 * Check if a string is encrypted
 * @param text - The text to check
 * @returns true if the text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) {
    return false;
  }
  
  // Encrypted format: iv:salt:tag:encrypted (all hex, separated by colons)
  const parts = text.split(':');
  return parts.length === 4 && parts.every(part => /^[0-9a-f]+$/i.test(part));
}
