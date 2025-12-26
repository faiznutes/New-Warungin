const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  try {
    // Create Super Admin
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@warungin.com' },
      update: { password: hashedPassword },
      create: {
        email: 'superadmin@warungin.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
    console.log('✅ Super Admin created:', superAdmin.email);

    // Create Demo Tenant
    const tenant = await prisma.tenant.upsert({
      where: { email: 'demo@warungin.com' },
      update: {},
      create: {
        name: 'Demo Warung',
        email: 'demo@warungin.com',
        phone: '+6281234567890',
        slug: 'demo-warung',
        isActive: true,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        subscriptionPlan: 'PRO',
      }
    });
    console.log('✅ Demo Tenant created:', tenant.name);

    // Create Demo Admin
    const demoAdminPassword = await bcrypt.hash('admin123', 10);
    const demoAdmin = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.com' } },
      update: { password: demoAdminPassword },
      create: {
        tenantId: tenant.id,
        email: 'admin@demo.com',
        password: demoAdminPassword,
        name: 'Admin Demo',
        role: 'ADMIN_TENANT',
        isActive: true
      }
    });
    console.log('✅ Demo Admin created:', demoAdmin.email);

    // Create Demo Cashier
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'cashier@demo.com' } },
      update: { password: cashierPassword },
      create: {
        tenantId: tenant.id,
        email: 'cashier@demo.com',
        password: cashierPassword,
        name: 'Kasir Demo',
        role: 'CASHIER',
        isActive: true
      }
    });
    console.log('✅ Demo Cashier created:', cashier.email);

    // Create Demo Products
    const products = await prisma.product.createMany({
      data: [
        { tenantId: tenant.id, name: 'Nasi Goreng', sku: 'NG001', price: 15000, cost: 8000, stock: 100, category: 'Makanan', isActive: true },
        { tenantId: tenant.id, name: 'Mie Ayam', sku: 'MA001', price: 12000, cost: 6000, stock: 100, category: 'Makanan', isActive: true },
        { tenantId: tenant.id, name: 'Es Teh Manis', sku: 'ETM001', price: 3000, cost: 1000, stock: 200, category: 'Minuman', isActive: true },
        { tenantId: tenant.id, name: 'Kopi', sku: 'KP001', price: 5000, cost: 2000, stock: 200, category: 'Minuman', isActive: true },
      ],
      skipDuplicates: true
    });
    console.log('✅ Demo Products created:', products.count);

    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@warungin.com / SuperAdmin123!');
    console.log('Tenant Admin: admin@demo.com / admin123');
    console.log('Cashier: cashier@demo.com / cashier123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
