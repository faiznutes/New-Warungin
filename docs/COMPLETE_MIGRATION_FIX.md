# ✅ Complete Migration Fix - Step by Step

Panduan lengkap untuk menyelesaikan semua masalah migration dari awal sampai akhir.

---

## 📋 Checklist Masalah yang Sudah Ditemukan

1. ✅ Migration `20250112000000_add_cascade_delete_transaction` - Constraint sudah di-drop, perlu di-add lagi
2. ✅ Migration `20251106034738_init` - Type sudah ada, sudah di-mark sebagai applied
3. ✅ Migration `20251114184000_add_reward_points` - Constraint sudah ada, sudah di-mark sebagai applied
4. ✅ Migration `20251120000002_add_webhook_model` - Constraint sudah ada, perlu di-mark sebagai applied
5. ⚠️ NPX cache corrupted - Perlu di-clear

---

## 🚀 Langkah-Langkah Lengkap

### Step 1: Fix Constraint yang Belum Selesai

```bash
# Add constraint transactions_orderId_fkey yang sudah di-drop
docker compose exec postgres psql -U postgres -d warungin -c 'ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
```

### Step 2: Verifikasi Constraint

```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"
```

**Pastikan output menunjukkan:**
```
constraint_name              | constraint_definition
----------------------------|--------------------------------------------------
transactions_orderId_fkey   | FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

### Step 3: Mark Migration Webhook sebagai Applied

```bash
docker compose exec backend npx prisma migrate resolve --applied 20251120000002_add_webhook_model
```

### Step 4: Clear NPX Cache

```bash
# Clear npx cache
docker compose exec backend rm -rf /home/nodejs/.npm/_npx

# Clear npm cache
docker compose exec backend npm cache clean --force
```

### Step 5: Lanjutkan Migrate

```bash
# Coba migrate dengan --yes flag untuk skip prompt
docker compose exec backend npx --yes prisma migrate deploy
```

### Step 6: Jika Masih Ada Migration yang Gagal

Jika masih ada migration yang gagal dengan error "constraint/type already exists", mark migration tersebut:

```bash
# Contoh jika migration X gagal
docker compose exec backend npx prisma migrate resolve --applied <migration_name>
docker compose exec backend npx --yes prisma migrate deploy
```

### Step 7: Verifikasi Final

```bash
# Cek status migration
docker compose exec backend npx prisma migrate status

# Output yang diharapkan:
# Database schema is up to date!
```

---

## 🚀 All-in-One Script (Copy-Paste)

```bash
# 1. Add constraint yang belum selesai
docker compose exec postgres psql -U postgres -d warungin -c 'ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;'

# 2. Verifikasi constraint
docker compose exec postgres psql -U postgres -d warungin -c "SELECT conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition FROM pg_constraint WHERE conrelid = 'transactions'::regclass AND conname = 'transactions_orderId_fkey';"

# 3. Mark migration webhook sebagai applied
docker compose exec backend npx prisma migrate resolve --applied 20251120000002_add_webhook_model

# 4. Clear npx cache
docker compose exec backend rm -rf /home/nodejs/.npm/_npx
docker compose exec backend npm cache clean --force

# 5. Lanjutkan migrate
docker compose exec backend npx --yes prisma migrate deploy

# 6. Verifikasi final
docker compose exec backend npx prisma migrate status
```

---

## 🆘 Troubleshooting

### Jika NPX Masih Error

Install prisma di container:

```bash
docker compose exec backend npm install -g prisma
docker compose exec backend npx --yes prisma migrate deploy
```

### Jika Masih Ada Migration yang Gagal

Cek error message untuk nama migration yang gagal, lalu mark:

```bash
docker compose exec backend npx prisma migrate resolve --applied <migration_name>
docker compose exec backend npx --yes prisma migrate deploy
```

### Jika Constraint Masih Belum Ada

Cek apakah constraint benar-benar sudah di-add:

```bash
docker compose exec postgres psql -U postgres -d warungin -c "\d transactions"
```

---

## ✅ Checklist Final

- [ ] Constraint `transactions_orderId_fkey` sudah di-add dengan CASCADE
- [ ] Migration `20251120000002_add_webhook_model` sudah di-mark sebagai applied
- [ ] NPX cache sudah di-clear
- [ ] Migrate deploy berhasil
- [ ] Status migration menunjukkan "Database schema is up to date!"

---

**Last Updated:** 2024-11-28

