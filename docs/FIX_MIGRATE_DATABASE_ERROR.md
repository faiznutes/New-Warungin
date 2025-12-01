# Fix: Error Cannot find module '/app/scripts/migrate-database.js'

## Masalah

Saat menjalankan `docker compose run --rm backend npm run prisma:migrate:safe`, muncul error:
```
Error: Cannot find module '/app/scripts/migrate-database.js'
```

## Penyebab

File `scripts/migrate-database.js` tidak ada di dalam Docker container karena:
1. File baru saja ditambahkan ke repository
2. Docker image belum di-rebuild setelah file ditambahkan

## Solusi

### Opsi 1: Rebuild Container (Disarankan)

```bash
# 1. Pull perubahan terbaru (jika belum)
git pull origin main

# 2. Rebuild backend container
docker compose build --no-cache backend

# 3. Jalankan migration
docker compose run --rm backend npm run prisma:migrate:safe
```

### Opsi 2: Gunakan Prisma Langsung (Alternatif)

Jika tidak ingin rebuild, gunakan Prisma command langsung:

```bash
# Jalankan migration langsung dengan Prisma
docker compose run --rm backend npx prisma migrate deploy
```

### Opsi 3: Update Lengkap dengan Script

Gunakan script update yang sudah otomatis rebuild:

```bash
# Linux/Mac
./scripts/update-docker.sh

# Windows PowerShell
.\scripts\update-docker.ps1
```

## Verifikasi

Setelah rebuild, verifikasi file ada di container:

```bash
# Cek apakah file ada
docker compose run --rm backend ls -la /app/scripts/migrate-database.js

# Atau cek semua file di scripts
docker compose run --rm backend ls -la /app/scripts/
```

## Catatan

- File `migrate-database.js` sudah ditambahkan ke repository
- Setelah rebuild, file akan tersedia di container
- Migration script menggunakan `prisma migrate deploy` yang aman untuk production (tidak menghapus data)

## Quick Fix

```bash
# Pull + Rebuild + Migrate dalam satu command
git pull origin main && \
docker compose build --no-cache backend && \
docker compose run --rm backend npm run prisma:migrate:safe
```

