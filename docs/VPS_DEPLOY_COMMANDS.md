# 🚀 Command untuk Deploy di VPS

Setelah code sudah di-push ke GitHub, jalankan command berikut di VPS Anda:

## 📋 Command Lengkap (Copy-Paste)

```bash
# 1. Connect ke VPS
ssh warungin@192.168.0.102

# 2. Masuk ke directory project
cd /home/warungin/Warungin

# 3. Pull latest code dari GitHub
git pull origin main

# 4. Stop container yang berjalan (jika ada)
docker compose down

# 5. Build dan start semua services
docker compose up -d --build

# 6. Tunggu beberapa detik untuk services start
sleep 20

# 7. Cek status services
docker compose ps

# 8. Setup firewall (jika belum)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# 9. Start Cloudflare tunnel (jika dikonfigurasi)
# Pastikan CLOUDFLARE_TUNNEL_TOKEN sudah di-set di .env
docker compose --profile cloudflare up -d cloudflared

# 10. Cek logs (opsional)
docker compose logs -f
```

## 🔧 Command Satu Baris (Quick Deploy)

```bash
ssh warungin@192.168.0.102 'cd /home/warungin/Warungin && git pull origin main && docker compose down && docker compose up -d --build && sleep 20 && docker compose ps'
```

## 📝 Command dengan Password (jika menggunakan sshpass)

```bash
sshpass -p "123" ssh -o StrictHostKeyChecking=no warungin@192.168.0.102 'cd /home/warungin/Warungin && git pull origin main && docker compose down && docker compose up -d --build && sleep 20 && docker compose ps'
```

## 🌐 Setup Public Access

### Option 1: Port Forwarding di Router
```bash
# Di router, forward port:
# - Port 80 → 192.168.0.102:80
# - Port 443 → 192.168.0.102:443
```

### Option 2: Cloudflare Tunnel (Recommended)
```bash
# 1. Setup tunnel di Cloudflare Dashboard
# 2. Copy TUNNEL_TOKEN
# 3. Edit .env di VPS:
nano /home/warungin/Warungin/.env

# 4. Tambahkan:
CLOUDFLARE_TUNNEL_TOKEN=your_token_here

# 5. Start tunnel:
cd /home/warungin/Warungin
docker compose --profile cloudflare up -d cloudflared
```

## 🔍 Troubleshooting

### Cek Logs
```bash
# Semua services
docker compose logs -f

# Service tertentu
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Restart Services
```bash
# Restart semua
docker compose restart

# Restart service tertentu
docker compose restart backend
docker compose restart frontend
```

### Rebuild Service Tertentu
```bash
# Rebuild backend
docker compose up -d --build backend

# Rebuild frontend
docker compose up -d --build frontend
```

### Cek Health
```bash
# Health check
curl http://192.168.0.102/api/health

# Frontend
curl http://192.168.0.102

# Backend API
curl http://192.168.0.102/api
```

## 📊 Informasi Akses

Setelah deployment selesai, aplikasi dapat diakses di:

- **Frontend:** http://192.168.0.102
- **Backend API:** http://192.168.0.102/api
- **Health Check:** http://192.168.0.102/api/health

## 🔐 Default Credentials

- **Super Admin Email:** admin@warungin.com
- **Super Admin Password:** admin123

⚠️ **PENTING:** Ganti password default setelah login pertama!

