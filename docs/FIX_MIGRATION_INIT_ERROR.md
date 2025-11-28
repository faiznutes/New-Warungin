# 🔧 Fix Migration Init Error - Type Already Exists

Panduan untuk memperbaiki error migration `20251106034738_init` yang gagal karena type "UserRole" sudah ada.

---

## 🔍 Masalah

1. Constraint `transactions_orderId_fkey` sudah di-drop tapi belum di-add lagi
2. Migration `20251106034738_init` gagal karena type "UserRole" sudah ada di database

---

## ✅ Solusi

### Step 1: Add Constraint yang Belum Selesai

```bash
docker compose exec postgres psql -U postgres -d warungin -c 'ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
```

### Step 2: Verifikasi Constraint

```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

**Output yang diharapkan:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

### Step 3: Mark Migration Init sebagai Applied

Karena migration `20251106034738_init` sudah pernah dijalankan sebagian (type sudah ada), mark sebagai applied:

```bash
docker compose exec backend npx prisma migrate resolve --applied 20251106034738_init
```

### Step 4: Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

---

## 🆘 Jika Step 3 Gagal

Jika ada error saat mark migration, cek status migration dulu:

```bash
docker compose exec backend npx prisma migrate status
```

Jika migration sudah ada di database tapi tidak terdeteksi, kita perlu manual mark di database:

```bash
# Masuk ke database
docker compose exec postgres psql -U postgres -d warungin

# Di dalam psql, jalankan:
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  '20251106034738_init',
  'checksum_dari_migration_file',  -- Ganti dengan checksum yang benar
  NOW(),
  '20251106034738_init',
  NULL,
  NULL,
  NOW(),
  1
)
ON CONFLICT DO NOTHING;

-- Keluar dari psql
\q
```

**Atau lebih mudah, gunakan Prisma migrate resolve:**

```bash
docker compose exec backend npx prisma migrate resolve --applied 20251106034738_init
```

---

## 📋 All-in-One Command

```bash
# 1. Add constraint
docker compose exec postgres psql -U postgres -d warungin -c 'ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;'

# 2. Verifikasi constraint
docker compose exec postgres psql -U postgres -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"

# 3. Mark migration init sebagai applied
docker compose exec backend npx prisma migrate resolve --applied 20251106034738_init

# 4. Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

---

## ✅ Verifikasi Final

Setelah semua langkah, verifikasi:

```bash
# Cek status migration
docker compose exec backend npx prisma migrate status

# Output yang diharapkan:
# Database schema is up to date!
```

---

**Last Updated:** 2024-11-28

