/**
 * Utility to sanitize sensitive data before logging
 * Prevents secrets, passwords, tokens, and other sensitive data from appearing in logs
 */

const SENSITIVE_PATTERNS = [
  /password/gi,
  /secret/gi,
  /token/gi,
  /key/gi,
  /api[_-]?key/gi,
  /auth[_-]?token/gi,
  /access[_-]?token/gi,
  /refresh[_-]?token/gi,
  /jwt[_-]?secret/gi,
  /database[_-]?url/gi,
  /connection[_-]?string/gi,
  /credential/gi,
  /authorization/gi,
  /bearer/gi,
  /private[_-]?key/gi,
  /public[_-]?key/gi,
];

const SENSITIVE_KEYS = [
  'password',
  'secret',
  'token',
  'key',
  'apiKey',
  'api_key',
  'authToken',
  'accessToken',
  'refreshToken',
  'jwtSecret',
  'jwt_secret',
  'databaseUrl',
  'database_url',
  'DATABASE_URL',
  'connectionString',
  'credential',
  'authorization',
  'bearer',
  'privateKey',
  'publicKey',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_PASSWORD',
  'SMTP_PASS',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
];

/**
 * Check if a key is sensitive
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  
  // Check exact matches
  if (Array.isArray(SENSITIVE_KEYS) && SENSITIVE_KEYS.some((sk: string) => lowerKey === sk.toLowerCase())) {
    return true;
  }
  
  // Check pattern matches
  return Array.isArray(SENSITIVE_PATTERNS) && SENSITIVE_PATTERNS.some((pattern: RegExp) => pattern.test(key));
}

/**
 * Redact sensitive value
 */
function redactValue(value: any): string {
  if (value === null || value === undefined) {
    return '[null]';
  }
  
  if (typeof value === 'string') {
    if (value.length === 0) {
      return '[empty]';
    }
    // Redact if it looks like a secret (long string, contains special chars)
    if (value.length > 20 && /[A-Za-z0-9+/=]{20,}/.test(value)) {
      return '[REDACTED]';
    }
    // Redact if it's a URL with credentials
    if (value.includes('://') && (value.includes('@') || value.includes('password') || value.includes('secret'))) {
      return '[REDACTED_URL]';
    }
    return '[REDACTED]';
  }
  
  return '[REDACTED]';
}

/**
 * Sanitize object recursively, redacting sensitive fields
 */
export function sanitizeForLogging(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {};
    
    for (const key in data) {
      if (isSensitiveKey(key)) {
        sanitized[key] = redactValue(data[key]);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        sanitized[key] = sanitizeForLogging(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }
    
    return sanitized;
  }
  
  // Handle strings - check if they contain sensitive patterns
  if (typeof data === 'string') {
    // Check if string contains sensitive patterns
    if (Array.isArray(SENSITIVE_PATTERNS) && SENSITIVE_PATTERNS.some((pattern: RegExp) => pattern.test(data))) {
      return '[REDACTED]';
    }
    return data;
  }
  
  return data;
}

/**
 * Sanitize error object for logging
 */
export function sanitizeError(error: any): any {
  if (!error) {
    return error;
  }
  
  const sanitized: any = {
    name: error.name,
    message: error.message,
  };
  
  if (error.stack) {
    // Remove potential secrets from stack trace
    let stack = error.stack;
    // Redact URLs with credentials
    stack = stack.replace(/https?:\/\/[^@]+@[^\s]+/g, '[REDACTED_URL]');
    // Redact potential secrets in stack
    stack = stack.replace(/(password|secret|token|key)=[^\s,)]+/gi, '$1=[REDACTED]');
    sanitized.stack = stack;
  }
  
  if (error.code) {
    sanitized.code = error.code;
  }
  
  // Sanitize any additional properties
  for (const key in error) {
    if (!['name', 'message', 'stack', 'code'].includes(key)) {
      sanitized[key] = sanitizeForLogging(error[key]);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize environment variables object
 */
export function sanitizeEnv(env: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const key in env) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = env[key];
    }
  }
  
  return sanitized;
}
