/**
 * Test Setup File
 * Runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { getRedisClient } from '../src/config/redis';

let testPrisma: PrismaClient;
let testRedis: ReturnType<typeof getRedisClient>;

// Test database URL
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://test_user:test_password@localhost:5433/warungin_test?schema=public';

// Test Redis URL
const TEST_REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6380';

beforeAll(async () => {
  // Set test environment variables
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6380';
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
  process.env.INTERNAL_API_KEY = 'test-internal-api-key';

  // Initialize test Prisma client
  testPrisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_DATABASE_URL,
      },
    },
    log: ['error'],
  });

  // Connect to test database
  try {
    await testPrisma.$connect();
    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }

  // Run migrations on test database
  try {
    console.log('🔄 Running migrations on test database...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }

  // Initialize Redis (optional for tests that need it)
  try {
    // Redis will be initialized when needed via getRedisClient()
    console.log('✅ Test setup completed');
  } catch (error) {
    console.warn('⚠️  Redis not available for tests (some tests may skip)', error);
  }
});

afterAll(async () => {
  // Cleanup: Truncate all tables (faster than dropping)
  if (testPrisma) {
    try {
      const tablenames = await testPrisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname='public'
      `;

      for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
          try {
            await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
          } catch (error) {
            console.warn(`Failed to truncate ${tablename}:`, error);
          }
        }
      }
      console.log('✅ Test database cleaned');
    } catch (error) {
      console.error('❌ Failed to clean test database:', error);
    } finally {
      await testPrisma.$disconnect();
      console.log('✅ Disconnected from test database');
    }
  }
});

beforeEach(async () => {
  // Optional: Reset specific test data before each test
  // This is handled by afterAll cleanup, but can be customized per test
});

afterEach(async () => {
  // Optional: Cleanup after each test
});

// Export test utilities
export { testPrisma, TEST_DATABASE_URL, TEST_REDIS_URL };
