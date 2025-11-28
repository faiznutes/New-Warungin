# 🐳 Panduan Pull & Build dengan Docker di SSH

Panduan lengkap untuk melakukan pull code dari GitHub dan build menggunakan Docker di server SSH.

---

## ⚡ Quick Start

```bash
# 1. Masuk ke direktori project
cd ~/New-Warungin

# 2. Pull code terbaru
git pull origin main

# 3. Rebuild dan restart container
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Migrate database (jika ada perubahan schema)
docker compose exec backend npx prisma migrate deploy
```

---

## 📋 Langkah Detail

### 1. Masuk ke Server via SSH

```bash
ssh user@your-server-ip
# atau
ssh user@your-server-domain
```

### 2. Navigate ke Direktori Project

```bash
cd ~/New-Warungin
# atau
cd /path/to/your/project
```

### 3. Cek Status Git

```bash
git status
```

**Output yang diharapkan:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

Jika ada perubahan lokal yang belum di-commit:
```bash
# Stash perubahan lokal (jika perlu)
git stash

# Atau commit perubahan lokal terlebih dahulu
git add -A
git commit -m "Local changes before pull"
```

### 4. Pull Code dari GitHub

```bash
# Pull dari branch main
git pull origin main

# Atau jika ingin pull dari branch tertentu
git pull origin <branch-name>
```

**Output yang diharapkan:**
```
Updating abc1234..def5678
Fast-forward
 ... (list of changed files)
```

### 5. Cek Status Container

```bash
# Cek container yang sedang running
docker compose ps
```

**Output yang diharapkan:**
```
NAME                    IMAGE                    STATUS
new-warungin-backend-1  backend:latest           Up X minutes
new-warungin-frontend-1 frontend:latest          Up X minutes
new-warungin-db-1       postgres:15              Up X minutes
```

### 6. Stop Container (Jika Running)

```bash
# Stop semua container
docker compose down

# Atau stop container tertentu
docker compose stop backend
docker compose stop frontend
```

### 7. Rebuild Container

#### Opsi A: Rebuild Semua (Recommended untuk Update Besar)

```bash
# Rebuild semua service tanpa cache
docker compose build --no-cache

# Atau rebuild service tertentu
docker compose build --no-cache backend
docker compose build --no-cache frontend
```

#### Opsi B: Rebuild dengan Cache (Lebih Cepat)

```bash
# Rebuild dengan cache (jika tidak ada perubahan dependency)
docker compose build
```

**Catatan:**
- `--no-cache` memastikan semua layer di-rebuild dari awal (lebih lama tapi lebih aman)
- Tanpa `--no-cache` akan menggunakan cache (lebih cepat)

### 8. Start Container

```bash
# Start semua container
docker compose up -d

# Atau start container tertentu
docker compose up -d backend
docker compose up -d frontend
```

**Penjelasan:**
- `-d` = detach mode (run di background)
- Container akan otomatis start jika ada perubahan

### 9. Cek Logs (Optional)

```bash
# Cek logs semua container
docker compose logs -f

# Cek logs container tertentu
docker compose logs -f backend
docker compose logs -f frontend

# Cek logs terakhir (50 baris)
docker compose logs --tail=50 backend
```

**Tips:**
- Tekan `Ctrl+C` untuk keluar dari log viewer
- Gunakan `-f` untuk follow (real-time logs)

### 10. Migrate Database (Jika Ada Perubahan Schema)

```bash
# Generate Prisma Client
docker compose exec backend npx prisma generate

# Cek status migration
docker compose exec backend npx prisma migrate status

# Jalankan migration
docker compose exec backend npx prisma migrate deploy
```

**Lihat dokumentasi lengkap:** `docs/QUICK_MIGRATE.md`

---

## 🔧 Troubleshooting

### Error: Container tidak bisa start

```bash
# Cek logs untuk error
docker compose logs backend

# Cek apakah port sudah digunakan
docker compose ps
netstat -tulpn | grep :3000  # Backend port
netstat -tulpn | grep :5173  # Frontend port

# Restart container
docker compose restart backend
```

### Error: Build gagal

```bash
# Cek Dockerfile
cat Dockerfile.backend
cat Dockerfile.frontend

# Cek environment variables
docker compose config

# Rebuild dengan verbose output
docker compose build --progress=plain backend
```

### Error: Database connection failed

```bash
# Cek apakah database container running
docker compose ps db

# Cek database logs
docker compose logs db

# Test koneksi database
docker compose exec backend npx prisma db pull
```

### Error: Port already in use

```bash
# Cek port yang digunakan
sudo lsof -i :3000  # Backend
sudo lsof -i :5173  # Frontend

# Stop service yang menggunakan port
sudo systemctl stop <service-name>

# Atau ubah port di docker-compose.yml
```

### Error: Permission denied

```bash
# Pastikan user memiliki akses ke Docker
sudo usermod -aG docker $USER
# Logout dan login lagi

# Atau gunakan sudo (tidak recommended)
sudo docker compose up -d
```

### Error: Out of disk space

```bash
# Cek disk space
df -h

# Clean up Docker (hapus unused images, containers, volumes)
docker system prune -a --volumes

# Hapus build cache
docker builder prune -a
```

---

## 📋 Checklist Sebelum Pull & Build

- [ ] Backup database (optional tapi recommended)
- [ ] Cek disk space tersedia
- [ ] Cek status container saat ini
- [ ] Stash atau commit perubahan lokal
- [ ] Pull code dari GitHub
- [ ] Cek perubahan yang terjadi (git log)
- [ ] Rebuild container
- [ ] Start container
- [ ] Migrate database (jika perlu)
- [ ] Test aplikasi berjalan dengan baik

---

## 🚀 Script Otomatis (Optional)

Buat file `pull-and-build.sh`:

```bash
#!/bin/bash

set -e  # Exit on error

echo "🔄 Pulling latest code..."
git pull origin main

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Building containers..."
docker compose build --no-cache

echo "🚀 Starting containers..."
docker compose up -d

echo "📊 Checking container status..."
docker compose ps

echo "🗄️ Running database migrations..."
docker compose exec backend npx prisma migrate deploy

echo "✅ Done! Check logs with: docker compose logs -f"
```

**Gunakan script:**
```bash
chmod +x pull-and-build.sh
./pull-and-build.sh
```

---

## 💡 Tips & Best Practices

1. **Selalu backup database** sebelum pull & build (terutama di production)
2. **Test di staging** sebelum deploy ke production
3. **Monitor logs** setelah build untuk memastikan tidak ada error
4. **Gunakan `--no-cache`** jika ada perubahan dependency atau Dockerfile
5. **Cek disk space** sebelum build (Docker bisa menggunakan banyak space)
6. **Gunakan `docker compose logs -f`** untuk monitor real-time
7. **Keep container running** saat pull untuk zero-downtime (jika memungkinkan)

---

## 📚 Dokumentasi Terkait

- **Quick Migrate:** `docs/QUICK_MIGRATE.md`
- **SSH Pull & Migrate:** `docs/SSH_PULL_AND_MIGRATE.md`
- **Docker Compose:** `docker-compose.yml`

---

## 🆘 Butuh Bantuan?

1. Cek logs: `docker compose logs -f`
2. Cek status: `docker compose ps`
3. Restart container: `docker compose restart <service>`
4. Rebuild dari awal: `docker compose build --no-cache`

---

**Last Updated:** 2024-11-28

