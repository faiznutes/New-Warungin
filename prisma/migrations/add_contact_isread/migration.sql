-- Add isRead and readAt columns to contact_submissions table
ALTER TABLE "contact_submissions" 
ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- Create index on isRead for better query performance
CREATE INDEX IF NOT EXISTS "contact_submissions_isRead_idx" ON "contact_submissions"("isRead");
