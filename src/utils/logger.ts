import winston from 'winston';

// Create logs directory if it doesn't exist (for file transport)
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Use process.env directly to avoid circular dependency with env.ts
const NODE_ENV = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'warungin' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Console transport with enhanced formatting  
if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let log = `${timestamp} [${level}]: ${message}`;
          
          // Add stack trace if available
          if (stack) {
            log += `\n${stack}`;
          }
          
          // Add metadata if available (exclude service name)
          const filteredMeta = { ...meta };
          delete filteredMeta.service;
          
          if (Object.keys(filteredMeta).length > 0) {
            // Format metadata nicely
            try {
              const metaStr = JSON.stringify(filteredMeta, null, 2);
              // Only show first 500 chars of metadata to avoid cluttering console
              if (metaStr.length > 500) {
                log += `\n${metaStr.substring(0, 500)}... (truncated)`;
              } else {
                log += `\n${metaStr}`;
              }
            } catch (e) {
              log += `\n[Metadata could not be stringified]`;
            }
          }
          
          return log;
        })
      ),
    })
  );
} else {
  // Production console transport - simpler format
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Helper function to add request context to logs
export function logWithContext(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context: Record<string, any> = {}
) {
  try {
  logger[level](message, context);
  } catch (error) {
    // Fallback to console if logger fails
    console.error('Logger error:', error);
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](message, context);
  }
}

// Helper to safely serialize metadata, preventing circular reference errors
function safeSerialize(meta: any): any {
  if (!meta) return undefined;
  
  try {
    // Use a Set to track visited objects and prevent circular references
    const visited = new WeakSet();
    
    const replacer = (key: string, value: any): any => {
      // Skip req/res objects to avoid circular references
      if (key === 'req' || key === 'res') {
        return '[Object]';
      }
      
      // Handle objects
      if (typeof value === 'object' && value !== null) {
        // Check for circular reference
        if (visited.has(value)) {
          return '[Circular]';
        }
        visited.add(value);
      }
      
      // Handle functions
      if (typeof value === 'function') {
        return '[Function]';
      }
      
      // Handle undefined (JSON.stringify removes undefined, but we want to keep it)
      if (value === undefined) {
        return null;
      }
      
      return value;
    };
    
    // Try to stringify and parse to catch any serialization errors
    const serialized = JSON.stringify(meta, replacer);
    return JSON.parse(serialized);
  } catch (error) {
    // If serialization fails, return a safe representation
    return { 
      error: 'Failed to serialize metadata',
      message: meta?.message || String(meta),
    };
  }
}

// Safe logger wrapper to prevent errors from breaking the app
// This ensures that even if winston logger fails, we still log to console
const safeLogger = {
  info: (message: string, meta?: any) => {
    try {
      const safeMeta = safeSerialize(meta);
      logger.info(message, safeMeta);
    } catch (error) {
      // Fallback to console if logger fails
      console.log(message, meta);
    }
  },
  warn: (message: string, meta?: any) => {
    try {
      const safeMeta = safeSerialize(meta);
      logger.warn(message, safeMeta);
    } catch (error) {
      console.warn(message, meta);
    }
  },
  error: (message: string, meta?: any) => {
    try {
      const safeMeta = safeSerialize(meta);
      logger.error(message, safeMeta);
    } catch (error) {
      console.error(message, meta);
    }
  },
  debug: (message: string, meta?: any) => {
    try {
      const safeMeta = safeSerialize(meta);
      logger.debug(message, safeMeta);
    } catch (error) {
      console.debug(message, meta);
    }
  },
};

export default safeLogger;
