-- AlterTable
ALTER TABLE "tenant_addons" ADD COLUMN "addedBySuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "addedBySuperAdmin" BOOLEAN NOT NULL DEFAULT false;

