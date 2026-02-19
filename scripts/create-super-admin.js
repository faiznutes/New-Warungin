const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createSuperAdmin() {
  console.log("Creating super admin user...");

  const hashedPassword = await bcrypt.hash("12345678", 10);

  // First create a default tenant
  let tenant = await prisma.tenant.findFirst({
    where: { name: "Warungin HQ" },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Warungin HQ",
        slug: "warungin-hq",
        isActive: true,
        plan: "ENTERPRISE",
        maxUsers: 100,
      },
    });
    console.log("Created tenant:", tenant.id);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@demo.com" },
  });

  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.email);

    // Update password
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { password: hashedPassword },
    });
    console.log("Password updated to: 12345678");
    return;
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log("Super admin created:", admin.email);
  console.log("Password: 12345678");
  console.log("User ID:", admin.id);
}

createSuperAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
