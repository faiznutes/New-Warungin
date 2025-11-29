# Fix Duplicate Migration

## Masalah

Ada folder migration kosong `20251129222355_add_added_by_super_admin_field` yang duplicate dengan `20250129000000_add_added_by_super_admin_field`.

## Solusi

### 1. Hapus folder migration duplicate (sudah dilakukan di code)

Folder `prisma/migrations/20251129222355_add_added_by_super_admin_field` sudah dihapus.

### 2. Pastikan migration yang benar sudah applied

```bash
# Check migration status
docker compose exec backend npx prisma migrate status

# Jika migration 20250129000000_add_added_by_super_admin_field belum applied, mark sebagai applied
docker compose exec backend npx prisma migrate resolve --applied 20250129000000_add_added_by_super_admin_field
```

### 3. Verifikasi field sudah ada di database

```bash
# Check field in tenant_addons
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'tenant_addons' AND column_name = 'addedBySuperAdmin';"

# Check field in subscriptions
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'addedBySuperAdmin';"
```

### 4. Jika field belum ada, tambahkan manual

```bash
# Tambahkan field ke tenant_addons
docker compose exec postgres psql -U postgres -d warungin -c "ALTER TABLE \"tenant_addons\" ADD COLUMN IF NOT EXISTS \"addedBySuperAdmin\" BOOLEAN NOT NULL DEFAULT false;"

# Tambahkan field ke subscriptions
docker compose exec postgres psql -U postgres -d warungin -c "ALTER TABLE \"subscriptions\" ADD COLUMN IF NOT EXISTS \"addedBySuperAdmin\" BOOLEAN NOT NULL DEFAULT false;"
```

### 5. Run migrate deploy

```bash
docker compose exec backend npx prisma migrate deploy
```

### 6. Verify semua migration sudah applied

```bash
docker compose exec backend npx prisma migrate status
```

Semua migration harus menunjukkan status "Applied".

