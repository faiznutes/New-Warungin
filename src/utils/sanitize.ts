/**
 * Input Sanitization Utilities
 * Sanitize user input to prevent XSS attacks and injection
 */

/**
 * Sanitize text content (strip all HTML tags)
 * For business data fields like description, notes, message
 * @param text - Text to sanitize
 * @returns Sanitized text without HTML
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Remove HTML tags using regex (safe for server-side)
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Remove script tags and event handlers (extra safety)
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script/gi, '')
    .replace(/<\/script>/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize string field (remove special characters that could cause issues)
 * @param str - String to sanitize
 * @param maxLength - Maximum length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeString(str: string | null | undefined, maxLength: number = 1000): string {
  if (!str) return '';
  
  // Remove null bytes and control characters
  let sanitized = str.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

/**
 * Sanitize email address
 * @param email - Email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  
  // Basic email sanitization (remove spaces, lowercase)
  let sanitized = email.trim().toLowerCase();
  
  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize phone number (keep only digits and +)
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Keep only digits, +, and spaces
  let sanitized = phone.replace(/[^\d+\s-]/g, '');
  
  // Remove extra spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

