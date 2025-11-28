# 🔧 Fix Failed Migration: add_cascade_delete_transaction

Panduan untuk memperbaiki migration yang gagal: `20250112000000_add_cascade_delete_transaction`

---

## 🔍 Masalah

Error yang muncul:
```
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `20250112000000_add_cascade_delete_transaction` migration started at 2025-11-28 12:40:41.503964 UTC failed
```

Migration ini mencoba mengubah foreign key constraint `transactions_orderId_fkey` dari `RESTRICT` ke `CASCADE`.

---

## ✅ Solusi

### Opsi 1: Mark Migration sebagai Resolved (Jika Constraint Sudah Benar)

Jika constraint sudah benar di database, kita bisa mark migration sebagai resolved:

```bash
# 1. Cek constraint saat ini di database
docker compose exec backend npx prisma db execute --stdin <<EOF
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass
AND conname = 'transactions_orderId_fkey';
EOF

# 2. Jika constraint sudah dengan CASCADE, mark migration sebagai resolved
docker compose exec backend npx prisma migrate resolve --applied 20250112000000_add_cascade_delete_transaction

# 3. Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

### Opsi 2: Rollback dan Jalankan Ulang (Jika Constraint Belum Benar)

Jika constraint belum benar, kita perlu rollback dan jalankan ulang:

```bash
# 1. Mark migration sebagai rolled back
docker compose exec backend npx prisma migrate resolve --rolled-back 20250112000000_add_cascade_delete_transaction

# 2. Jalankan migration ulang
docker compose exec backend npx prisma migrate deploy
```

### Opsi 3: Manual Fix Constraint (Jika Opsi 1 & 2 Gagal)

Jika kedua opsi di atas gagal, kita bisa manual fix constraint:

```bash
# 1. Masuk ke database
docker compose exec db psql -U warungin -d warungin

# 2. Di dalam psql, jalankan:
-- Cek constraint saat ini
\d transactions

-- Drop constraint yang ada
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";

-- Add constraint baru dengan CASCADE
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_orderId_fkey" 
FOREIGN KEY ("orderId") 
REFERENCES "orders"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Keluar dari psql
\q

# 3. Mark migration sebagai resolved
docker compose exec backend npx prisma migrate resolve --applied 20250112000000_add_cascade_delete_transaction

# 4. Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

---

## 📋 Langkah-Langkah Detail (Recommended)

### Step 1: Cek Status Migration

```bash
docker compose exec backend npx prisma migrate status
```

### Step 2: Cek Constraint di Database

```bash
docker compose exec db psql -U warungin -d warungin -c "
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass
AND conname = 'transactions_orderId_fkey';
"
```

**Output yang diharapkan jika sudah benar:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

**Output jika belum benar:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
```

### Step 3: Fix Berdasarkan Status

#### Jika Constraint Sudah Benar (CASCADE):

```bash
# Mark migration sebagai resolved
docker compose exec backend npx prisma migrate resolve --applied 20250112000000_add_cascade_delete_transaction

# Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

#### Jika Constraint Belum Benar (RESTRICT):

```bash
# Rollback migration
docker compose exec backend npx prisma migrate resolve --rolled-back 20250112000000_add_cascade_delete_transaction

# Atau manual fix constraint
docker compose exec db psql -U warungin -d warungin <<EOF
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_orderId_fkey" 
FOREIGN KEY ("orderId") 
REFERENCES "orders"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
EOF

# Mark migration sebagai resolved
docker compose exec backend npx prisma migrate resolve --applied 20250112000000_add_cascade_delete_transaction

# Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

---

## 🔍 Troubleshooting

### Error: Migration not found

Jika migration tidak ditemukan, cek apakah migration file ada:

```bash
ls -la prisma/migrations/20250112000000_add_cascade_delete_transaction/
```

### Error: Constraint already exists

Jika constraint sudah ada, drop dulu:

```bash
docker compose exec db psql -U warungin -d warungin -c "
ALTER TABLE \"transactions\" DROP CONSTRAINT IF EXISTS \"transactions_orderId_fkey\";
"
```

### Error: Cannot drop constraint (dependencies)

Jika ada dependencies, cek dulu:

```bash
docker compose exec db psql -U warungin -d warungin -c "
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass;
"
```

---

## ✅ Verifikasi

Setelah fix, verifikasi constraint sudah benar:

```bash
# Cek constraint
docker compose exec db psql -U warungin -d warungin -c "
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass
AND conname = 'transactions_orderId_fkey';
"

# Cek status migration
docker compose exec backend npx prisma migrate status
```

**Output yang diharapkan:**
```
Database schema is up to date!
```

---

## 📚 Referensi

- [Prisma Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Prisma Migrate Resolve](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-resolve)

---

**Last Updated:** 2024-11-28

