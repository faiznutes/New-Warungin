# Fix: Git Repository Setup di Server

## Problem
```
fatal: not a git repository (or any of the parent directories): .git
```

Ini berarti direktori `/root/New-Warungin` di server belum diinisialisasi sebagai git repository.

## Solusi

### Opsi 1: Initialize Git Repository (jika direktori sudah ada)

SSH ke server dan jalankan:

```bash
ssh root@192.168.1.101
cd /root/New-Warungin

# Backup .env file dulu
cp .env .env.backup 2>/dev/null || true

# Initialize git repository
git init
git remote add origin https://github.com/faiznutes/New-Warungin.git
git fetch origin
git checkout -b main
git branch --set-upstream-to=origin/main main
git pull origin main --allow-unrelated-histories

# Restore .env
cp .env.backup .env 2>/dev/null || true
```

### Opsi 2: Clone Repository Fresh (RECOMMENDED jika tidak ada file penting)

```bash
ssh root@192.168.1.101

# Backup .env jika ada
cp /root/New-Warungin/.env /root/.env.backup 2>/dev/null || true

# Hapus direktori lama
rm -rf /root/New-Warungin

# Clone repository baru
cd /root
git clone https://github.com/faiznutes/New-Warungin.git
cd New-Warungin

# Restore .env
cp /root/.env.backup .env 2>/dev/null || true

# Setup .env jika belum ada
if [ ! -f .env ]; then
    cp env.example .env
    echo "⚠️  Edit .env file dengan konfigurasi yang benar"
fi
```

### Opsi 3: Menggunakan Script Otomatis

```bash
# Dari local machine, jalankan:
ssh root@192.168.1.101 "bash -s" < scripts/setup-git-on-server.sh
```

## Setelah Git Setup

Setelah git repository sudah ter-setup, jalankan:

```bash
cd /root/New-Warungin
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose ps
```

## Verifikasi

```bash
cd /root/New-Warungin
git status
git remote -v
git branch
```

Pastikan:
- ✅ `.git` directory ada
- ✅ Remote origin mengarah ke `https://github.com/faiznutes/New-Warungin.git`
- ✅ Branch adalah `main`
- ✅ `.env` file masih ada dan tidak ter-overwrite
