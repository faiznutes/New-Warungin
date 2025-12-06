/**
 * Server-side input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize string input - remove HTML tags and dangerous characters
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => 
      typeof item === 'string' ? sanitizeString(item) : 
      typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, any>) : 
      item
    ) as unknown as T;
  }
  
  const sanitized = { ...obj } as Record<string, any>;
  
  for (const key in sanitized) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as any)[key] = sanitizeObject(value as Record<string, any>);
    }
  }
  
  return sanitized as T;
}

/**
 * Sanitize email - basic validation and cleaning
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Remove whitespace and convert to lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize URL - validate and clean URL
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const sanitized = url.trim();
  
  // Only allow http, https protocols
  if (!sanitized.match(/^https?:\/\//i)) {
    return '';
  }
  
  // Remove javascript: and data: protocols
  if (sanitized.match(/^(javascript|data):/i)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize number - ensure it's a valid number
 */
export function sanitizeNumber(input: any): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }
  
  if (typeof input === 'string') {
    const num = parseFloat(input);
    return isNaN(num) ? null : num;
  }
  
  return null;
}

/**
 * Sanitize integer
 */
export function sanitizeInteger(input: any): number | null {
  const num = sanitizeNumber(input);
  return num !== null ? Math.floor(num) : null;
}
