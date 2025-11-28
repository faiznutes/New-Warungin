# 🔧 Fix Constraint - Dengan Username yang Benar

Panduan untuk fix constraint dengan mengecek username database yang benar terlebih dahulu.

---

## 🔍 Step 1: Cek Username Database yang Benar

### Opsi A: Cek dari Environment Variable Container

```bash
docker compose exec postgres env | grep POSTGRES_USER
```

### Opsi B: Cek dari DATABASE_URL di Backend Container

```bash
docker compose exec backend env | grep DATABASE_URL
```

Dari output, ambil username yang ada di `postgresql://USERNAME:password@...`

### Opsi C: Cek dari .env File (jika ada akses)

```bash
cat .env | grep POSTGRES_USER
```

---

## 📋 Step 2: Fix Constraint dengan Username yang Benar

Setelah tahu username yang benar (kemungkinan `postgres`), jalankan:

### Jika username adalah `postgres`:

```bash
# Drop constraint
docker compose exec postgres psql -U postgres -d warungin -c 'ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";'

# Add constraint dengan CASCADE
docker compose exec postgres psql -U postgres -d warungin -c 'ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
```

### Jika username berbeda (misalnya dari .env):

Ganti `postgres` dengan username yang benar dari Step 1.

---

## ✅ Step 3: Verifikasi

```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

**Output yang diharapkan:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

---

## 🚀 Step 4: Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

**Output yang diharapkan:**
```
Database schema is up to date!
```

---

## 🆘 Troubleshooting

### Error: role "warungin" does not exist

Username database bukan `warungin`. Gunakan `postgres` atau cek username yang benar dari Step 1.

### Error: password authentication failed

Jika perlu password, gunakan format dengan password:

```bash
docker compose exec postgres psql -U postgres -d warungin -W
```

Atau set password di environment variable:

```bash
PGPASSWORD=your_password docker compose exec postgres psql -U postgres -d warungin -c '...'
```

---

**Last Updated:** 2024-11-28

