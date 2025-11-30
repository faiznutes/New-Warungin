-- AlterTable: Add phone and isProcessed fields to contact_submissions
-- Add phone field (optional)
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Add isProcessed field (default false)
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "isProcessed" BOOLEAN NOT NULL DEFAULT false;

-- Add updatedAt field
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create index for isProcessed
CREATE INDEX IF NOT EXISTS "contact_submissions_isProcessed_idx" ON "contact_submissions"("isProcessed");

