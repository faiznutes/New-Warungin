# 🔧 Fix Multiple Migrations - Constraints Already Exist

Panduan untuk memperbaiki multiple migrations yang gagal karena constraints/types sudah ada di database.

---

## 🔍 Masalah

Beberapa migrations gagal karena:
- Type/constraint sudah ada di database (migration sudah pernah dijalankan sebagian)
- Migration history tidak sinkron dengan state database

---

## ✅ Solusi: Mark Semua Failed Migrations sebagai Applied

### Step 1: Cek Status Migration

```bash
docker compose exec backend npx prisma migrate status
```

Ini akan menunjukkan migration mana yang failed.

### Step 2: Mark Failed Migrations sebagai Applied

Untuk setiap migration yang gagal karena constraint/type sudah ada, mark sebagai applied:

```bash
# Mark migration reward_points
docker compose exec backend npx prisma migrate resolve --applied 20251114184000_add_reward_points

# Jika ada migration lain yang gagal, mark juga
# docker compose exec backend npx prisma migrate resolve --applied <migration_name>
```

### Step 3: Lanjutkan Migrate

```bash
docker compose exec backend npx prisma migrate deploy
```

### Step 4: Ulangi Jika Ada Migration Lain yang Gagal

Jika masih ada migration yang gagal, ulangi Step 2 dan Step 3 sampai semua migration berhasil.

---

## 🚀 Script Otomatis (Jika Banyak Migration)

Jika banyak migration yang perlu di-mark, gunakan script ini:

```bash
# List semua migration yang perlu di-mark
MIGRATIONS=(
  "20251114184000_add_reward_points"
  # Tambahkan migration lain yang gagal di sini
)

for migration in "${MIGRATIONS[@]}"; do
  echo "Marking $migration as applied..."
  docker compose exec backend npx prisma migrate resolve --applied "$migration"
done

# Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy
```

---

## 📋 Langkah-Langkah Detail

### Untuk Migration `20251114184000_add_reward_points`:

```bash
# 1. Mark sebagai applied
docker compose exec backend npx prisma migrate resolve --applied 20251114184000_add_reward_points

# 2. Lanjutkan migrate
docker compose exec backend npx prisma migrate deploy

# 3. Jika masih ada error, ulangi untuk migration berikutnya
```

---

## 🔍 Verifikasi

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

Jika migration tidak ditemukan, cek apakah migration file ada:

```bash
ls -la prisma/migrations/
```

### Error: Migration already recorded as applied

Ini berarti migration sudah di-mark sebelumnya. Lanjutkan ke migration berikutnya.

### Error: Constraint already exists (selama migrate deploy)

Jika masih ada error constraint sudah ada saat migrate deploy, berarti ada migration lain yang juga perlu di-mark. Cek error message dan mark migration tersebut.

---

## 💡 Tips

1. **Jangan skip migration** - Pastikan semua migration di-mark dengan benar
2. **Cek satu per satu** - Mark migration yang gagal satu per satu, lalu coba migrate deploy
3. **Verifikasi constraint** - Setelah mark migration, verifikasi constraint sudah benar di database
4. **Backup database** - Sebelum mark migration, backup database terlebih dahulu (optional tapi recommended)

---

**Last Updated:** 2024-11-28

