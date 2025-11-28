# 🔧 Fix Constraint - Final Solution

Panduan untuk fix constraint tanpa TTY (untuk SSH non-interactive).

---

## ✅ Solusi: Gunakan `-c` Flag

Karena heredoc (`<<EOF`) memerlukan TTY, gunakan flag `-c` dengan command yang di-escape.

---

## 📋 Command (Copy-Paste)

### Step 1: Drop Constraint

```bash
docker compose exec postgres psql -U warungin -d warungin -c 'ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";'
```

### Step 2: Add Constraint dengan CASCADE

```bash
docker compose exec postgres psql -U warungin -d warungin -c 'ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
```

### Step 3: Verifikasi Constraint

```bash
docker compose exec postgres psql -U warungin -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

**Output yang diharapkan:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

### Step 4: Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

**Output yang diharapkan:**
```
Database schema is up to date!
```

---

## 🚀 All-in-One Command (Alternative)

Jika ingin dalam satu command:

```bash
docker compose exec -T postgres psql -U warungin -d warungin <<'SQL'
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
SQL
```

**Note:** Flag `-T` disable TTY allocation.

---

## 📝 Atau Buat File SQL Sementara

```bash
# 1. Buat file SQL
cat > /tmp/fix_constraint.sql <<'EOF'
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EOF

# 2. Jalankan file SQL
docker compose exec -T postgres psql -U warungin -d warungin < /tmp/fix_constraint.sql

# 3. Hapus file
rm /tmp/fix_constraint.sql
```

---

## ✅ Verifikasi

Setelah fix, verifikasi constraint sudah benar:

```bash
docker compose exec postgres psql -U warungin -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

Pastikan output menunjukkan `ON DELETE CASCADE ON UPDATE CASCADE`.

---

**Last Updated:** 2024-11-28

