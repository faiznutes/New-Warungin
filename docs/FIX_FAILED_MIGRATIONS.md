# Fix Failed Migrations

## Masalah

Ada beberapa migration yang failed:
1. `20251114184000_add_reward_points` - constraint sudah ada
2. `20250112000000_add_cascade_delete_transaction` - table tidak ada (tapi sudah di-resolve)
3. `20251106034738_init` - type sudah ada (tapi sudah di-resolve)
4. `20251120000002_add_webhook_model` - constraint sudah ada (tapi sudah di-resolve)

## Solusi

### Step 1: Mark semua failed migrations sebagai applied

```bash
# Mark migration sebagai applied
docker compose exec backend npx prisma migrate resolve --applied 20251114184000_add_reward_points
docker compose exec backend npx prisma migrate resolve --applied 20250112000000_add_cascade_delete_transaction
docker compose exec backend npx prisma migrate resolve --applied 20251106034738_init
docker compose exec backend npx prisma migrate resolve --applied 20251120000002_add_webhook_model
```

### Step 2: Clean up duplicate entries (optional)

Jika ada duplicate entries di _prisma_migrations:

```bash
# Check duplicate entries
docker compose exec postgres psql -U postgres -d warungin -c "SELECT migration_name, COUNT(*) as count FROM _prisma_migrations GROUP BY migration_name HAVING COUNT(*) > 1;"

# Delete duplicate entries (yang finished_at IS NULL)
docker compose exec postgres psql -U postgres -d warungin -c "DELETE FROM _prisma_migrations WHERE finished_at IS NULL AND migration_name IN ('20251114184000_add_reward_points', '20250112000000_add_cascade_delete_transaction', '20251106034738_init', '20251120000002_add_webhook_model');"
```

### Step 3: Verify migration status

```bash
docker compose exec backend npx prisma migrate status
```

Semua migration harus menunjukkan status "Applied".

### Step 4: Run migrate deploy

```bash
docker compose exec backend npx prisma migrate deploy
```

### Step 5: Verify semua migration sudah applied

```bash
docker compose exec backend npx prisma migrate status
```

## Catatan

- Migration yang failed biasanya karena constraint/table/type sudah ada di database
- Mark sebagai applied jika constraint/table/type sudah benar-benar ada
- Jangan hapus migration files, hanya mark sebagai applied

