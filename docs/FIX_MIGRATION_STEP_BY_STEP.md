# 🔧 Fix Migration - Step by Step

Panduan step-by-step untuk memperbaiki migration yang gagal.

---

## ✅ Status Saat Ini

Migration `20250112000000_add_cascade_delete_transaction` sudah di-mark sebagai applied, tapi constraint mungkin belum benar di database.

---

## 📋 Langkah-Langkah

### Step 1: Cek Status Container

```bash
docker compose ps
```

**Jika container `db` tidak running, start dulu:**
```bash
docker compose up -d db
```

**Tunggu sampai container healthy:**
```bash
docker compose ps
# Tunggu sampai status "warungin-postgres" menjadi "Healthy"
```

### Step 2: Cek Constraint Saat Ini

```bash
docker compose exec db psql -U warungin -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

**Output yang diharapkan:**
- Jika sudah benar: `ON DELETE CASCADE ON UPDATE CASCADE`
- Jika belum benar: `ON DELETE RESTRICT ON UPDATE CASCADE`

### Step 3: Fix Constraint (Jika Belum Benar)

```bash
docker compose exec db psql -U warungin -d warungin <<'EOF'
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_orderId_fkey";
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_orderId_fkey" 
FOREIGN KEY ("orderId") 
REFERENCES "orders"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
EOF
```

### Step 4: Verifikasi Constraint

```bash
docker compose exec db psql -U warungin -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

**Pastikan output menunjukkan:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

### Step 5: Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

**Output yang diharapkan:**
```
Database schema is up to date!
```

---

## 🆘 Troubleshooting

### Error: service "db" is not running

```bash
# Start container db
docker compose up -d db

# Tunggu sampai healthy
docker compose ps

# Cek logs jika ada masalah
docker compose logs db
```

### Error: Migration already recorded as applied

Ini normal jika migration sudah di-mark sebagai applied. Langsung lanjut ke Step 3 untuk fix constraint manual.

### Error: Cannot drop constraint

```bash
# Cek apakah ada dependencies
docker compose exec db psql -U warungin -d warungin -c "SELECT conname, contype, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'transactions'::regclass;"
```

---

## ✅ Checklist

- [ ] Container `db` running dan healthy
- [ ] Constraint sudah dicek
- [ ] Constraint sudah di-fix (jika perlu)
- [ ] Constraint sudah diverifikasi
- [ ] Migration deploy berhasil
- [ ] Database schema up to date

---

**Last Updated:** 2024-11-28

