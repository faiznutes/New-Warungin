-- Create super admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (id, email, password, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'super-admin-001',
  'admin@warungin.com',
  '$2a$10$rZ5YjKxH9uK8qE.vF9qGxO7jXxH5nKqH5nKqH5nKqH5nKqH5nKqHu',
  'Super Admin',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = 'SUPER_ADMIN',
  "isActive" = true,
  "updatedAt" = NOW();
