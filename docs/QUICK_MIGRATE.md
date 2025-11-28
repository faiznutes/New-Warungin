# 🚀 Quick Guide: Migrate Database dengan Docker

Panduan cepat untuk migrate database menggunakan Docker (tidak perlu install Node.js).

---

## ✅ Langkah Cepat (Copy-Paste)

```bash
# 1. Masuk ke direktori project
cd ~/New-Warungin

# 2. Pastikan container backend running
docker compose ps

# 3. Generate Prisma Client
docker compose exec backend npx prisma generate

# 4. Cek status migration
docker compose exec backend npx prisma migrate status

# 5. Jalankan migration (Production)
docker compose exec backend npx prisma migrate deploy
```

---

## 📝 Penjelasan Command

### 1. Cek Status Container

```bash
docker compose ps
```

Output yang diharapkan:
```
NAME                IMAGE                    STATUS
new-warungin-backend-1   backend:latest         Up X minutes
```

Jika container tidak running:
```bash
docker compose up -d backend
```

### 2. Generate Prisma Client

```bash
docker compose exec backend npx prisma generate
```

**Apa yang dilakukan:**
- Generate Prisma Client berdasarkan schema
- Diperlukan setelah ada perubahan schema atau pull code baru

### 3. Cek Status Migration

```bash
docker compose exec backend npx prisma migrate status
```

**Output yang diharapkan:**
```
Database schema is up to date!
```

Atau jika ada migration yang belum dijalankan:
```
X migration(s) have not yet been applied:
  - 20241128100000_add_config_to_payment_mapping
```

### 4. Jalankan Migration

```bash
docker compose exec backend npx prisma migrate deploy
```

**Apa yang dilakukan:**
- Menjalankan semua migration yang belum dijalankan
- Tidak akan membuat migration file baru
- Aman untuk production

---

## 🔧 Troubleshooting

### Error: Container tidak running

```bash
# Start container
docker compose up -d backend

# Cek logs jika ada error
docker compose logs backend
```

### Error: Cannot connect to database

```bash
# Cek apakah database container running
docker compose ps

# Cek environment variables
docker compose exec backend env | grep DATABASE_URL

# Test koneksi database
docker compose exec backend npx prisma db pull
```

### Error: Migration already applied

Jika migration sudah dijalankan sebelumnya:
```bash
# Cek status
docker compose exec backend npx prisma migrate status

# Jika semua sudah applied, tidak perlu action
# Output: "Database schema is up to date!"
```

### Error: Permission denied

```bash
# Pastikan user memiliki akses ke Docker
sudo usermod -aG docker $USER
# Logout dan login lagi

# Atau gunakan sudo (tidak recommended)
sudo docker compose exec backend npx prisma migrate deploy
```

---

## 📋 Checklist Sebelum Migrate

- [ ] Container backend sudah running
- [ ] Database container sudah running
- [ ] Environment variables sudah benar (`.env`)
- [ ] Backup database sudah dibuat (optional tapi recommended)
- [ ] Code sudah di-pull dari GitHub

---

## 🆘 Butuh Bantuan?

1. Cek logs container: `docker compose logs backend`
2. Cek status migration: `docker compose exec backend npx prisma migrate status`
3. Test koneksi database: `docker compose exec backend npx prisma db pull`
4. Lihat dokumentasi lengkap: `docs/SSH_PULL_AND_MIGRATE.md`

---

## 💡 Tips

- **Selalu gunakan Docker** untuk migrate di production
- **Backup database** sebelum migrate (terutama di production)
- **Test di staging** sebelum migrate di production
- **Monitor logs** selama proses migrate

