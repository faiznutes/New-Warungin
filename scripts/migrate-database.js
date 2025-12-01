#!/usr/bin/env node

/**
 * Safe database migration script for production
 * This script runs Prisma migrations safely without resetting the database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Starting safe database migration...\n');

try {
  // Check if Prisma schema exists
  const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  if (!fs.existsSync(prismaSchemaPath)) {
    console.error('❌ Prisma schema not found at:', prismaSchemaPath);
    process.exit(1);
  }

  // Generate Prisma Client first (required before migrations)
  console.log('📦 Generating Prisma Client...');
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✅ Prisma Client generated\n');
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client:', error.message);
    process.exit(1);
  }

  // Run migrations using migrate deploy (safe for production)
  // This applies pending migrations without resetting the database
  console.log('🗄️  Running database migrations...');
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('\n✅ Migrations completed successfully');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n💡 Tips:');
    console.log('  - Check database connection');
    console.log('  - Verify migration files are correct');
    console.log('  - Check database permissions');
    process.exit(1);
  }

  // Verify migrations status
  console.log('\n📊 Checking migration status...');
  try {
    execSync('npx prisma migrate status', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (error) {
    // migrate status might fail if there are pending migrations, that's okay
    console.log('⚠️  Some migrations may be pending');
  }

  console.log('\n✨ Migration process completed!');
} catch (error) {
  console.error('\n❌ Unexpected error:', error.message);
  process.exit(1);
}

