# 🚀 Instruksi Deploy Perbaikan Server Monitor & Backup

## ⚠️ Masalah WSL
WSL mengalami masalah resource (`Insufficient system resources`), sehingga tidak bisa menjalankan SSH command secara otomatis.

## ✅ Solusi: Jalankan Manual di Server

### Opsi 1: Menggunakan Script Deployment (Recommended)

1. **SSH ke server:**
   ```bash
   ssh faiz@192.168.1.101
   # Password: 123
   ```

2. **Jalankan script deployment:**
   ```bash
   cd ~/New-Warungin
   git pull
   bash scripts/deploy-monitor-fixes.sh
   ```

### Opsi 2: Manual Commands

1. **SSH ke server:**
   ```bash
   ssh faiz@192.168.1.101
   # Password: 123
   ```

2. **Pull perubahan:**
   ```bash
   cd ~/New-Warungin
   git pull
   ```

3. **Restart backend:**
   ```bash
   echo "123" | sudo -S docker compose restart backend
   ```

4. **Tunggu 60 detik, lalu cek status:**
   ```bash
   sleep 60
   sudo docker compose ps backend
   ```

5. **Verifikasi health check:**
   ```bash
   sudo docker compose exec backend wget --quiet --tries=1 --spider http://localhost:3000/health && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
   ```

6. **Cek semua services:**
   ```bash
   sudo docker compose ps
   ```

## 📋 Perubahan yang Sudah Di-Deploy

### Backend (`src/routes/admin-monitor.routes.ts`)
- ✅ Fallback methods untuk disk usage (mendukung berbagai filesystem)
- ✅ Fallback untuk CPU menggunakan `/proc/stat` jika `top` tidak tersedia
- ✅ Error handling yang lebih baik untuk memory usage
- ✅ Fallback untuk uptime menggunakan `/proc/uptime`
- ✅ Fallback untuk load average menggunakan `/proc/loadavg`

### Frontend (`client/src/views/superadmin/ServerMonitor.vue`)
- ✅ Disk usage menampilkan loading state (bukan "Tidak ada data disk")
- ✅ Menampilkan semua disk dengan fallback untuk field kosong

### Frontend (`client/src/views/superadmin/BackupManagement.vue`)
- ✅ Error handling yang lebih baik untuk load backup
- ✅ Error handling yang lebih baik untuk view backup

## ✅ Verifikasi Setelah Deploy

1. **Server Monitor - Disk Usage:**
   - Buka: https://pos.faiznute.site/app/superadmin/server-monitor
   - Tab: "Server Resources"
   - Verifikasi: Disk usage menampilkan data (tidak ada "Tidak ada data disk")

2. **Server Monitor - CPU, Memory, Uptime:**
   - Tab: "Server Resources"
   - Verifikasi: Semua data ter-load dengan benar (tidak ada N/A)

3. **Backup Management:**
   - Buka: https://pos.faiznute.site/app/superadmin/backups
   - Verifikasi: Backup logs ter-load tanpa error
   - Verifikasi: View backup berfungsi dengan baik

## 🔧 Troubleshooting

Jika backend tidak healthy setelah restart:
```bash
# Cek logs
sudo docker compose logs --tail=50 backend

# Cek apakah ada error
sudo docker compose logs backend | grep -i error | tail -20
```

Jika disk usage masih tidak muncul:
```bash
# Test command di backend container
sudo docker compose exec backend df -h
```

## 📝 Catatan

- Semua perubahan sudah di-commit dan push ke Git
- Script deployment sudah tersedia di `scripts/deploy-monitor-fixes.sh`
- Backend perlu di-restart untuk menerapkan perubahan

