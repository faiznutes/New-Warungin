const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Seeding Demo Data...');

    try {
        const pass = await bcrypt.hash('admin123', 10);
        const cashierPass = await bcrypt.hash('cashier123', 10);

        // 1. Buat Tenant Demo
        console.log('Using email: demo@warungin.com');
        const tenant = await prisma.tenant.upsert({
            where: { email: 'demo@warungin.com' },
            update: {},
            create: {
                name: 'Warung Demo Spesial',
                email: 'demo@warungin.com',
                phone: '08123456789',
                slug: 'warung-demo',
                isActive: true,
                subscriptionPlan: 'PRO',
                subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
        });
        console.log('✅ Tenant Created:', tenant.name);

        // 2. Buat Admin Tenant
        const adminExists = await prisma.user.findFirst({
            where: { email: 'admin@demo.com', tenantId: tenant.id }
        });

        if (!adminExists) {
            await prisma.user.create({
                data: {
                    email: 'admin@demo.com',
                    password: pass,
                    name: 'Admin Demo',
                    role: 'ADMIN_TENANT',
                    isActive: true,
                    tenantId: tenant.id
                }
            });
            console.log('✅ User Created: admin@demo.com');
        } else {
            // Update password just in case
            await prisma.user.update({
                where: { id: adminExists.id },
                data: { password: pass, isActive: true }
            });
            console.log('✅ User Updated: admin@demo.com');
        }

        // 3. Buat Cashier
        const cashierExists = await prisma.user.findFirst({
            where: { email: 'cashier@demo.com', tenantId: tenant.id }
        });

        if (!cashierExists) {
            await prisma.user.create({
                data: {
                    email: 'cashier@demo.com',
                    password: cashierPass,
                    name: 'Kasir Demo',
                    role: 'CASHIER',
                    isActive: true,
                    tenantId: tenant.id
                }
            });
            console.log('✅ User Created: cashier@demo.com');
        } else {
            // Update password just in case
            await prisma.user.update({
                where: { id: cashierExists.id },
                data: { password: cashierPass, isActive: true }
            });
            console.log('✅ User Updated: cashier@demo.com');
        }

        // 4. Buat Produk Dummy
        const productCount = await prisma.product.count({ where: { tenantId: tenant.id } });
        if (productCount === 0) {
            await prisma.product.createMany({
                data: [
                    { tenantId: tenant.id, name: 'Nasi Goreng Spesial', sku: 'FOOD-001', price: 25000, cost: 15000, stock: 100, category: 'Makanan', isActive: true },
                    { tenantId: tenant.id, name: 'Es Teh Manis', sku: 'DRINK-001', price: 5000, cost: 2000, stock: 200, category: 'Minuman', isActive: true },
                    { tenantId: tenant.id, name: 'Kopi Susu Gula Aren', sku: 'DRINK-002', price: 18000, cost: 8000, stock: 50, category: 'Minuman', isActive: true },
                    { tenantId: tenant.id, name: 'Roti Bakar Coklat', sku: 'SNACK-001', price: 15000, cost: 8000, stock: 30, category: 'Snack', isActive: true }
                ]
            });
            console.log('✅ 4 Dummy Products Created');
        } else {
            console.log('ℹ️ Products already exist');
        }

    } catch (e) {
        console.error('❌ ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
