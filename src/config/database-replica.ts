/**
 * Database Read Replica Configuration
 * Use read replica for reporting and read-heavy queries
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Clean database URL (remove query parameters for connection pooling)
 */
function cleanDatabaseUrl(url: string): string {
  if (!url) {
    throw new Error('Database URL is not defined');
  }
  
  let cleanedUrl = url;
  
  // Remove "DATABASE_URL=" prefix if present
  if (cleanedUrl.startsWith('DATABASE_URL=')) {
    cleanedUrl = cleanedUrl.replace('DATABASE_URL=', '');
  }
  cleanedUrl = cleanedUrl.replace(/DATABASE_URL=$/g, '');
  cleanedUrl = cleanedUrl.replace(/DATABASE_URL=/g, '');
  
  // Trim whitespace
  cleanedUrl = cleanedUrl.trim();
  
  try {
    const urlObj = new URL(cleanedUrl);
    // Remove query parameters that might interfere with connection
    urlObj.search = '';
    cleanedUrl = urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original (might be valid PostgreSQL connection string)
    // Just validate it starts with postgresql:// or postgres://
    if (!cleanedUrl.startsWith('postgresql://') && !cleanedUrl.startsWith('postgres://')) {
      throw new Error(`Invalid DATABASE_URL format: URL must start with postgresql:// or postgres://`);
    }
  }
  
  return cleanedUrl;
}

let readReplicaClient: PrismaClient | null = null;

/**
 * Get read replica Prisma client
 * Falls back to main database if read replica is not configured
 */
export function getReadReplicaClient(): PrismaClient {
  if (!readReplicaClient) {
    try {
      const readReplicaUrl = process.env.DATABASE_READ_URL || process.env.DATABASE_URL;
      
      if (!readReplicaUrl) {
        // Fallback to main database connection if no URL is set
        logger.warn('DATABASE_READ_URL not set, using main DATABASE_URL');
        const mainUrl = process.env.DATABASE_URL;
        if (!mainUrl) {
          throw new Error('DATABASE_URL must be set');
        }
        try {
          const cleanedUrl = cleanDatabaseUrl(mainUrl);
          readReplicaClient = new PrismaClient({
            datasources: {
              db: {
                url: cleanedUrl,
              },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
          });
        } catch (cleanError: any) {
          logger.error('Failed to clean database URL', { error: cleanError.message });
          // Use URL as-is if cleaning fails
          readReplicaClient = new PrismaClient({
            datasources: {
              db: {
                url: mainUrl,
              },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
          });
        }
      } else {
        try {
          const cleanedUrl = cleanDatabaseUrl(readReplicaUrl);
          readReplicaClient = new PrismaClient({
            datasources: {
              db: {
                url: cleanedUrl,
              },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
          });
        } catch (cleanError: any) {
          console.error('Failed to clean read replica URL:', cleanError.message);
          // Use URL as-is if cleaning fails
          readReplicaClient = new PrismaClient({
            datasources: {
              db: {
                url: readReplicaUrl,
              },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
          });
        }
      }
    } catch (error: any) {
      // If read replica fails, fallback to main database
      logger.error('Failed to initialize read replica, falling back to main database', { error: error.message });
      const mainUrl = process.env.DATABASE_URL;
      if (!mainUrl) {
        throw new Error('DATABASE_URL must be set');
      }
      try {
        const cleanedUrl = cleanDatabaseUrl(mainUrl);
        readReplicaClient = new PrismaClient({
          datasources: {
            db: {
              url: cleanedUrl,
            },
          },
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
      } catch (cleanError: any) {
        console.error('Failed to clean main database URL:', cleanError.message);
        // Use URL as-is if cleaning fails
        readReplicaClient = new PrismaClient({
          datasources: {
            db: {
              url: mainUrl,
            },
          },
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
      }
    }
  }

  return readReplicaClient;
}

/**
 * Use read replica for read operations
 * Example: const users = await getReadReplicaClient().user.findMany();
 */
export default getReadReplicaClient;

