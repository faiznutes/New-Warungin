# Clean Duplicate Migration Entries

## Masalah

Migration sudah di-record sebagai applied, tapi ada entry yang failed (finished_at IS NULL). Ini menyebabkan error "already recorded as applied".

## Solusi

### Step 1: Check duplicate entries

```bash
# Check duplicate entries
docker compose exec postgres psql -U postgres -d warungin -c "SELECT migration_name, finished_at, applied_steps_count FROM _prisma_migrations WHERE migration_name IN ('20251114184000_add_reward_points', '20250112000000_add_cascade_delete_transaction', '20251106034738_init', '20251120000002_add_webhook_model') ORDER BY migration_name, finished_at;"
```

### Step 2: Delete failed entries (yang finished_at IS NULL)

```bash
# Delete entries yang finished_at IS NULL (yang failed)
docker compose exec postgres psql -U postgres -d warungin -c "DELETE FROM _prisma_migrations WHERE finished_at IS NULL AND migration_name IN ('20251114184000_add_reward_points', '20250112000000_add_cascade_delete_transaction', '20251106034738_init', '20251120000002_add_webhook_model');"
```

### Step 3: Verify entries sudah dihapus

```bash
# Check lagi apakah masih ada duplicate
docker compose exec postgres psql -U postgres -d warungin -c "SELECT migration_name, finished_at, applied_steps_count FROM _prisma_migrations WHERE migration_name IN ('20251114184000_add_reward_points', '20250112000000_add_cascade_delete_transaction', '20251106034738_init', '20251120000002_add_webhook_model') ORDER BY migration_name, finished_at;"
```

Setiap migration seharusnya hanya punya 1 entry dengan `finished_at` yang tidak NULL.

### Step 4: Verify migration status

```bash
docker compose exec backend npx prisma migrate status
```

Semua migration harus menunjukkan status "Applied".

### Step 5: Run migrate deploy

```bash
docker compose exec backend npx prisma migrate deploy
```

## Catatan

- Hanya hapus entries yang `finished_at IS NULL` (yang failed)
- Jangan hapus entries yang sudah `finished_at` (yang sudah applied)
- Setelah clean up, migration status harus menunjukkan semua "Applied"

