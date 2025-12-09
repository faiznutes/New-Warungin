# Fix: Setup Git Repository di Server

## Problem
Direktori `/root/New-Warungin` di server belum diinisialisasi sebagai git repository.

## Solusi Cepat (Copy-paste langsung di SSH server)

**SSH ke server dan jalankan perintah berikut:**

```bash
ssh root@192.168.1.101
```

Kemudian copy-paste semua perintah ini:

```bash
cd /root

# Backup .env dulu (PENTING!)
if [ -f New-Warungin/.env ]; then
    cp New-Warungin/.env /root/.env.backup
    echo "✅ .env backed up"
fi

# Hapus direktori lama (jika perlu)
rm -rf New-Warungin

# Clone repository fresh
git clone https://github.com/faiznutes/New-Warungin.git
cd New-Warungin
git checkout main

# Restore .env
if [ -f /root/.env.backup ]; then
    cp /root/.env.backup .env
    echo "✅ .env restored"
fi

# Setup .env jika belum ada
if [ ! -f .env ]; then
    cp env.example .env
    echo "⚠️  Edit .env dengan konfigurasi yang benar!"
fi

# Verify git
git status
git remote -v

# Deploy Docker
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose ps
```

## Atau Gunakan Script Otomatis

**Option 1: Transfer script ke server dan jalankan**

Dari local machine:
```bash
scp scripts/setup-git-and-deploy.sh root@192.168.1.101:/tmp/
```

Di server:
```bash
bash /tmp/setup-git-and-deploy.sh
```

**Option 2: Execute langsung via SSH**

```bash
# Transfer script content via SSH
cat scripts/setup-git-and-deploy.sh | ssh root@192.168.1.101 bash
```

## Quick Fix (One-liner)

Jalankan ini di server:

```bash
cd /root && cp New-Warungin/.env /root/.env.backup 2>/dev/null; rm -rf New-Warungin && git clone https://github.com/faiznutes/New-Warungin.git && cd New-Warungin && cp /root/.env.backup .env 2>/dev/null || cp env.example .env && git checkout main && docker compose down && docker compose build --no-cache && docker compose up -d && docker compose ps
```

## Verifikasi

Setelah selesai, verify:

```bash
cd /root/New-Warungin
git status
git remote -v
ls -la .git
cat .env | head -5  # Pastikan .env masih ada
docker compose ps
```

## Troubleshooting

Jika ada masalah:

1. **Git clone gagal:**
   - Pastikan koneksi internet ke GitHub
   - Check: `ping github.com`
   - Check: `git --version`

2. **Docker build gagal:**
   - Check disk space: `df -h`
   - Check Docker: `docker --version`
   - Check logs: `docker compose logs backend`

3. **.env hilang:**
   - Restore dari backup: `cp /root/.env.backup .env`
   - Atau copy dari env.example dan edit manual
