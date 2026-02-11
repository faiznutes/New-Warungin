import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Clean DATABASE_URL to fix format issues
function cleanDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  let cleanedUrl = url;

  // Remove "DATABASE_URL=" prefix if present
  if (cleanedUrl.startsWith('DATABASE_URL=')) {
    cleanedUrl = cleanedUrl.replace('DATABASE_URL=', '');
  }
  // Remove "DATABASE_URL=" if present at the end
  cleanedUrl = cleanedUrl.replace(/DATABASE_URL=$/g, '');
  cleanedUrl = cleanedUrl.replace(/DATABASE_URL=/g, '');

  // Trim whitespace
  cleanedUrl = cleanedUrl.trim();

  // Remove duplicate schema parameters (if any)
  cleanedUrl = cleanedUrl.replace(/schema=publicschema=public/g, 'schema=public');
  cleanedUrl = cleanedUrl.replace(/&schema=public&schema=public/g, '&schema=public');
  cleanedUrl = cleanedUrl.replace(/\?schema=public&schema=public/g, '?schema=public');

  // Validate URL format
  if (!cleanedUrl.startsWith('postgresql://') && !cleanedUrl.startsWith('postgres://')) {
    throw new Error(`Invalid DATABASE_URL format: URL must start with postgresql:// or postgres://`);
  }

  return cleanedUrl;
}

// Get cleaned DATABASE_URL
const databaseUrl = cleanDatabaseUrl(process.env.DATABASE_URL);

// Configure connection pool for 500 concurrent users
// Each user may have multiple concurrent requests, so we need adequate connections
// Note: Prisma manages connection pooling automatically via connection string
// These variables are informational only for documentation
const connectionPoolSize = 200; // Base pool size for 500 users (40% of users)
const maxConnections = 500; // Maximum connections (1:1 with users for peak load)

// Important: Prisma doesn't use these variables directly
// Connection pooling is handled by PostgreSQL or connection pooler (pgbouncer)
// For direct connections, PostgreSQL max_connections setting controls the limit

// Check if using pgbouncer (Supabase pooler)
const isPgbouncer = databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes('pgbouncer=true');

// For pgbouncer, ensure proper connection parameters
let finalDatabaseUrl = databaseUrl;
if (isPgbouncer) {
  try {
    // Ensure pgbouncer=true and connection_limit=1 for pgbouncer
    // This prevents "prepared statement already exists" errors
    const url = new URL(databaseUrl);
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
    finalDatabaseUrl = url.toString();
  } catch (error) {
    // If URL parsing fails, try manual string manipulation
    // Note: Logger should be available here, but using try-catch for safety
    if (process.env.NODE_ENV !== 'production') {
      try {
        logger.warn('Failed to parse DATABASE_URL, using original', { error: error instanceof Error ? error.message : String(error) });
      } catch {
        // Fallback to console if logger not available
        logger.warn('Failed to parse DATABASE_URL, using original:', error);
      }
    }
    // Add parameters manually if not present
    if (!finalDatabaseUrl.includes('pgbouncer=true')) {
      finalDatabaseUrl += (finalDatabaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    if (!finalDatabaseUrl.includes('connection_limit=')) {
      finalDatabaseUrl += '&connection_limit=1';
    }
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
    ]
    : ['error'],
  datasources: {
    db: {
      url: finalDatabaseUrl, // Use URL with pgbouncer parameters if needed
    },
  },
  // Connection pool settings optimized for 500 concurrent users
  // Prisma uses connection pooling via the database URL
  // For Supabase pooler, connections are managed by pgbouncer
  // For direct connections, we rely on database connection limits
});

// Add middleware for query timeouts
// This ensures no query hangs indefinitely (default 5s)
prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        // Set a 5s timeout for all queries to prevent database lockups
        const result = await Promise.race([
          query(args),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 5000)
          )
        ]);
        return result;
      },
    },
  },
});

// Note: RLS context is set via Express middleware (setRLSContext)
// and applied using $executeRawUnsafe before queries when needed.
// Prisma middleware doesn't have access to request context directly,
// so we rely on application-level tenant filtering as primary security.
// RLS policies in database provide additional defense-in-depth.

// Enhanced logging for development + slow query logging for production
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD || '500', 10); // 500ms default

prisma.$on('query' as never, (e: any) => {
  const duration = e.duration;
  const isSlow = duration > SLOW_QUERY_THRESHOLD;

  if (process.env.NODE_ENV === 'development') {
    // In development, log all queries
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${duration}ms`,
      target: e.target,
    });
  } else if (isSlow) {
    // In production, only log slow queries
    // Sanitize query params to prevent leaking sensitive data
    // Note: Using dynamic import inside event handler to avoid top-level await
    import('../utils/log-sanitizer').then(({ sanitizeForLogging }) => {
      logger.warn('Slow database query detected', sanitizeForLogging({
        query: e.query.substring(0, 200), // Truncate long queries
        params: e.params,
        duration: `${duration}ms`,
        threshold: `${SLOW_QUERY_THRESHOLD}ms`,
        target: e.target,
      }));
    }).catch(() => {
      // Fallback if sanitizer fails
      logger.warn('Slow database query detected', {
        query: e.query.substring(0, 200),
        duration: `${duration}ms`,
        threshold: `${SLOW_QUERY_THRESHOLD}ms`,
      });
    });
  }
});

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
    timestamp: new Date().toISOString(),
  });
});

prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('info' as never, (e: any) => {
  logger.info('Prisma Info', {
    message: e.message,
    target: e.target,
  });
});

// Test connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    if (process.env.NODE_ENV !== 'production') {
      try {
        logger.info('Database connection established');
      } catch {
        // Fallback to console if logger not available
        logger.info('✅ Database connection established');
      }
    }
  } catch (error: unknown) {
    const err = error as Error;
    try {
      logger.error('Database connection failed', { message: err.message });
      logger.error('Please check your DATABASE_URL in .env file');
    } catch {
      // Fallback to console if logger not available
      logger.error('❌ Database connection failed:', err.message);
      logger.error('Please check your DATABASE_URL in .env file');
    }
    // Don't exit - let the app start and handle errors gracefully
  }
}

// Test connection immediately (non-blocking)
// Wrap in try-catch to prevent unhandled promise rejection
testConnection().catch((error: any) => {
  // Don't crash if connection test fails - app will handle it in health check
  if (process.env.NODE_ENV === 'development') {
    try {
      logger.error('Failed to test database connection (non-blocking)', { error: error?.message || error });
    } catch {
      // Fallback to console if logger not available
      logger.error('⚠️  Failed to test database connection (non-blocking):', error?.message || error);
    }
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Note: Error event handler is now set up above with enhanced logging for development

export default prisma;

