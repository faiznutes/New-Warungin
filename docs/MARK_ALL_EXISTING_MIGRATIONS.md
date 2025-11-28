# 🔧 Mark All Existing Migrations as Applied

Panduan untuk mark semua migration yang constraint/type sudah ada di database sebagai applied.

---

## 🔍 Masalah

Beberapa migrations gagal karena constraint/type sudah ada di database. Kita perlu mark semua migration yang sudah ada sebagai applied.

---

## ✅ Solusi: Mark Migration yang Gagal

### Step 1: Mark Migration Webhook yang Gagal

```bash
docker compose exec backend npx prisma migrate resolve --applied 20251120000002_add_webhook_model
```

### Step 2: Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

### Step 3: Ulangi untuk Migration Lain yang Gagal

Jika masih ada migration yang gagal, mark migration tersebut juga.

---

## 🚀 Script Otomatis untuk Semua Migration

Jika ingin mark semua migration sekaligus (jika yakin semua sudah ada di database):

```bash
# List semua migration yang mungkin sudah ada
MIGRATIONS=(
  "20251106034738_init"
  "20251114184000_add_reward_points"
  "20251118190000_enable_rls"
  "20251119000000_add_performance_indexes"
  "20251120000000_add_2fa_fields"
  "20251120000001_add_password_history"
  "20251120000002_add_webhook_model"
  "20250112000000_add_cascade_delete_transaction"
)

for migration in "${MIGRATIONS[@]}"; do
  echo "Marking $migration as applied..."
  docker compose exec backend npx prisma migrate resolve --applied "$migration" 2>/dev/null || echo "Migration $migration already marked or not found"
done

# Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

---

## 📋 Langkah-Langkah Manual (Recommended)

Lebih aman untuk mark satu per satu dan cek hasilnya:

### 1. Mark Migration Webhook

```bash
docker compose exec backend npx prisma migrate resolve --applied 20251120000002_add_webhook_model
```

### 2. Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

### 3. Jika Masih Ada Error

Jika masih ada migration yang gagal, lihat error message dan mark migration tersebut:

```bash
# Contoh jika migration X gagal
docker compose exec backend npx prisma migrate resolve --applied <migration_name>
docker compose exec backend npx prisma migrate deploy
```

---

## 🔍 Cek Status Migration

Untuk melihat migration mana yang sudah applied dan mana yang belum:

```bash
docker compose exec backend npx prisma migrate status
```

---

## ✅ Verifikasi Final

Setelah semua migration di-mark, verifikasi:

```bash
# Cek status migration
docker compose exec backend npx prisma migrate status

# Output yang diharapkan:
# Database schema is up to date!
```

---

## 🆘 Troubleshooting

### Error: Migration not found

Migration file tidak ada di `prisma/migrations/`. Cek apakah migration file ada:

```bash
ls -la prisma/migrations/
```

### Error: Migration already recorded as applied

Ini normal, berarti migration sudah di-mark sebelumnya. Lanjutkan ke migration berikutnya.

### Error: Constraint already exists (selama migrate deploy)

Masih ada migration lain yang constraint sudah ada. Mark migration tersebut juga.

---

## 💡 Tips

1. **Mark satu per satu** - Lebih aman untuk mark migration satu per satu dan cek hasilnya
2. **Cek error message** - Error message akan menunjukkan migration mana yang gagal
3. **Backup database** - Sebelum mark migration, backup database terlebih dahulu (optional tapi recommended)
4. **Verifikasi constraint** - Setelah mark migration, verifikasi constraint sudah benar di database

---

**Last Updated:** 2024-11-28

