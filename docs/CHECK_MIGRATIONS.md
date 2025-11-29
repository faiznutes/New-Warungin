# Check Migrations Status

## Step 1: Check migration status

```bash
docker compose exec backend npx prisma migrate status
```

Ini akan menampilkan:
- Migration yang sudah applied
- Migration yang pending
- Migration yang failed

## Step 2: Check if fields exist in database

```bash
# Check field in tenant_addons
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'tenant_addons' AND column_name = 'addedBySuperAdmin';"

# Check field in subscriptions
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'addedBySuperAdmin';"
```

## Step 3: Check migration history

```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT migration_name, finished_at, applied_steps_count FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 20;"
```

## Step 4: Check for duplicate migrations

```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT migration_name, COUNT(*) as count FROM _prisma_migrations GROUP BY migration_name HAVING COUNT(*) > 1;"
```

## Step 5: Check for failed migrations

```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT migration_name, finished_at, applied_steps_count, logs FROM _prisma_migrations WHERE finished_at IS NULL OR logs IS NOT NULL;"
```

## Step 6: Fix duplicate migration (if exists)

Jika ada migration duplicate `20251129222355_add_added_by_super_admin_field`:

```bash
# Remove duplicate migration folder (jika ada)
rm -rf prisma/migrations/20251129222355_add_added_by_super_admin_field

# Mark the correct migration as applied
docker compose exec backend npx prisma migrate resolve --applied 20250129000000_add_added_by_super_admin_field
```

## Step 7: Run migrate deploy

```bash
docker compose exec backend npx prisma migrate deploy
```

## Step 8: Verify all migrations are applied

```bash
docker compose exec backend npx prisma migrate status
```

Semua migration harus menunjukkan status "Applied".

