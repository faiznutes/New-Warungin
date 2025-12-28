#!/bin/bash
# Complete deployment script - run on server

set -e

cd ~/New-Warungin

echo "📥 Pulling latest changes..."
git pull origin main || true

echo ""
echo "🔄 Resolving migration issues..."
docker compose exec -T backend npx prisma migrate resolve --applied 20251114184000_add_reward_points || true

echo ""
echo "🔄 Running migrations..."
docker compose exec -T backend npx prisma migrate deploy || {
  echo "⚠️  Some migrations may have failed, but continuing..."
}

echo ""
echo "🔐 Resetting Super Admin..."
SUPERADMIN_PASSWORD=SuperAdmin123! docker compose exec -T backend node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    let systemTenant = await prisma.tenant.findFirst({
      where: { email: 'system@warungin.com' },
    });

    if (!systemTenant) {
      systemTenant = await prisma.tenant.create({
        data: {
          name: 'System',
          email: 'system@warungin.com',
          slug: 'system',
          isActive: true,
        },
      });
    }

    const newPassword = 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        tenantId: systemTenant.id,
        role: 'SUPER_ADMIN',
      },
    });

    if (existingSuperAdmin) {
      await prisma.user.update({
        where: { id: existingSuperAdmin.id },
        data: {
          password: hashedPassword,
          defaultPassword: newPassword,
          isActive: true,
        },
      });
      console.log('✅ Super Admin password reset!');
      console.log('   Email:', existingSuperAdmin.email);
      console.log('   Password:', newPassword);
    } else {
      const newSuperAdmin = await prisma.user.create({
        data: {
          tenantId: systemTenant.id,
          email: 'admin@warungin.com',
          password: hashedPassword,
          defaultPassword: newPassword,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      console.log('✅ Super Admin created!');
      console.log('   Email:', newSuperAdmin.email);
      console.log('   Password:', newPassword);
    }

    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
"

echo ""
echo "🏥 Checking container health..."
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Super Admin Credentials:"
echo "  Email: admin@warungin.com"
echo "  Password: SuperAdmin123!"

