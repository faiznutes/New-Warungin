# Fix Error 502 Bad Gateway

Error 502 biasanya terjadi karena backend crash saat startup. Untuk field `addedBySuperAdmin`, pastikan migration sudah dijalankan **SEBELUM** rebuild backend.

## Langkah-langkah Fix

### 1. Cek apakah field sudah ada di database

```bash
# Cek field di tabel subscriptions
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'addedBySuperAdmin';"

# Cek field di tabel tenant_addons
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'tenant_addons' AND column_name = 'addedBySuperAdmin';"
```

### 2. Jika field belum ada, tambahkan manual

```bash
# Tambahkan field ke tabel tenant_addons
docker compose exec postgres psql -U postgres -d warungin -c "ALTER TABLE \"tenant_addons\" ADD COLUMN IF NOT EXISTS \"addedBySuperAdmin\" BOOLEAN NOT NULL DEFAULT false;"

# Tambahkan field ke tabel subscriptions
docker compose exec postgres psql -U postgres -d warungin -c "ALTER TABLE \"subscriptions\" ADD COLUMN IF NOT EXISTS \"addedBySuperAdmin\" BOOLEAN NOT NULL DEFAULT false;"
```

### 3. Mark migration sebagai applied

```bash
docker compose exec backend npx prisma migrate resolve --applied 20250129000000_add_added_by_super_admin_field
```

### 4. Jalankan migration deploy (untuk memastikan semua migration sudah applied)

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5. Rebuild backend

```bash
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### 6. Cek logs backend

```bash
docker compose logs -f backend
```

Jika masih ada error, cek log untuk melihat error message yang spesifik.

## Troubleshooting

### Error: "column does not exist"
- Pastikan field sudah ditambahkan dengan command di step 2
- Cek lagi dengan command di step 1

### Error: "migration already applied"
- Skip step 3, langsung ke step 4

### Error: "P3009 - migrate found failed migrations"
- Cek migration yang failed dengan:
  ```bash
  docker compose exec postgres psql -U postgres -d warungin -c "SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;"
  ```
- Mark sebagai applied atau rollback sesuai kebutuhan

### Backend masih crash setelah migration
- Cek logs backend untuk error message spesifik
- Pastikan semua field yang diperlukan sudah ada di database
- Pastikan Prisma client sudah di-generate ulang:
  ```bash
  docker compose exec backend npx prisma generate
  ```

