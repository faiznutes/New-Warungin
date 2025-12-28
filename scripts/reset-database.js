/**
 * Reset Database Script
 * Hapus semua data dan reset database ke kondisi awal
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n');

  try {
    // Disable foreign key checks temporarily
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    // Delete all data in correct order (respecting foreign keys)
    console.log('Deleting all data...');
    
    // Delete in reverse order of dependencies
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WebhookDelivery" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Webhook" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "PasswordHistory" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "BackupLog" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "ContactMessage" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RewardPoint" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Reward" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Discount" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "StockTransfer" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "PurchaseOrder" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "OrderItem" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Order" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "CashShift" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "StoreShift" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "ProductStock" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Product" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Category" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Supplier" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Customer" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Outlet" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "TenantAddon" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Subscription" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Tenant" CASCADE;');

    // Re-enable foreign key checks
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    console.log('✅ All data deleted\n');

    // Create system tenant
    console.log('Creating system tenant...');
    const systemTenant = await prisma.tenant.create({
      data: {
        id: 'system',
        name: 'System',
        email: 'system@warungin.com',
        slug: 'system',
        isActive: true,
      },
    });
    console.log('✅ System tenant created\n');

    // Create super admin
    console.log('Creating super admin...');
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        tenantId: systemTenant.id,
        email: 'admin@warungin.com',
        password: hashedPassword,
        defaultPassword: superAdminPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Super Admin created!');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${superAdminPassword}\n`);

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

