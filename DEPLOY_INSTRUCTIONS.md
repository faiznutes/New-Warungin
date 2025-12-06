# 🚀 Instruksi Deploy dengan Rebuild Docker

Karena SSH connection timeout dari Windows/WSL, silakan jalankan perintah berikut **langsung di server VPS**:

## 📋 Langkah-langkah:

### 1. SSH ke Server
```bash
# Dari Windows (Git Bash atau PowerShell)
ssh warungin@192.168.0.101
# atau
ssh root@192.168.0.101
```

### 2. Masuk ke Root (jika perlu)
```bash
sudo su -
```

### 3. Navigate ke Project Directory
```bash
cd /home/warungin/Warungin
```

### 4. Pull Latest Changes
```bash
git fetch origin
git pull origin main
```

### 5. Rebuild dan Restart Docker
```bash
# Stop containers
docker compose down

# Rebuild images (dengan --no-cache untuk fresh build)
docker compose build --no-cache

# Start containers
docker compose up -d
```

### 6. Check Status
```bash
# Check container status
docker compose ps

# Check logs jika ada masalah
docker compose logs -f
```

## 🔄 Atau Gunakan Script Otomatis

Jika script sudah ada di server:

```bash
cd /home/warungin/Warungin
bash scripts/deploy-remote-rebuild.sh
```

## 📝 Perubahan yang Baru di-Deploy:

1. ✅ **Addons System** - 100% (semua addon spesifik sudah ditambahkan)
2. ✅ **Paket Langganan** - 100% (MAX plan features sudah lengkap)
3. ✅ **Test Cases** - 100% (manual checklist, unit tests, integration tests)
4. ✅ **Addon Expiry Checker** - cron job untuk check expired addons
5. ✅ **StoreSelectorModal** - untuk multi-store selection
6. ✅ **Sync Manager** - untuk offline transaction sync
7. ✅ **Report Export** - PDF/Excel/CSV export untuk PRO/MAX plans

## ⚠️ Catatan Penting:

- Rebuild dengan `--no-cache` akan memakan waktu lebih lama tapi memastikan semua perubahan ter-apply
- Pastikan `.env` file sudah dikonfigurasi dengan benar
- Check logs jika ada error setelah rebuild
- Database migrations akan berjalan otomatis saat container start

## 🐛 Troubleshooting:

Jika ada masalah:

1. **Container tidak start:**
   ```bash
   docker compose logs backend
   docker compose logs frontend
   ```

2. **Build error:**
   ```bash
   docker compose build --no-cache 2>&1 | tee build.log
   ```

3. **Database connection error:**
   ```bash
   docker compose ps postgres
   docker compose logs postgres
   ```

4. **Port conflict:**
   ```bash
   docker compose down
   # Edit docker-compose.yml jika perlu
   docker compose up -d
   ```
