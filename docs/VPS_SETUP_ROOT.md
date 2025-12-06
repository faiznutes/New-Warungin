# 🚀 Setup Warungin di VPS dari Repository Root

Panduan lengkap untuk setup Warungin POS System di VPS menggunakan repository Root.

## 📋 Prerequisites

- VPS dengan Ubuntu 20.04+ atau Debian 11+
- User dengan sudo access (disarankan user: `warungin`)
- SSH access ke VPS
- Domain name (opsional, untuk Cloudflare Tunnel)

## 🎯 Quick Setup (Recommended)

### Option 1: Script Otomatis Lengkap

```bash
# 1. Connect ke VPS
ssh warungin@your-vps-ip

# 2. Download dan jalankan setup script
curl -o vps-setup-root.sh https://raw.githubusercontent.com/faiznutes/Root/main/scripts/vps-setup-root.sh
# ATAU jika sudah ada file di lokal, upload ke VPS:
# scp scripts/vps-setup-root.sh warungin@your-vps-ip:~/

# 3. Jalankan setup
chmod +x vps-setup-root.sh
bash vps-setup-root.sh
```

### Option 2: Quick Setup (Minimal Prompts)

```bash
# Download quick setup script
curl -o vps-setup-root-quick.sh https://raw.githubusercontent.com/faiznutes/Root/main/scripts/vps-setup-root-quick.sh
chmod +x vps-setup-root-quick.sh
bash vps-setup-root-quick.sh
```

## 📝 Manual Setup (Step by Step)

### 1. Connect ke VPS

```bash
ssh warungin@your-vps-ip
```

### 2. Install Prerequisites

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git (jika belum)
sudo apt-get install -y git

# Logout dan login lagi untuk apply docker group
exit
# Login lagi
ssh warungin@your-vps-ip
```

### 3. Clone Repository Root

```bash
# Clone repository
cd /home/warungin
git clone https://YOUR_GITHUB_TOKEN@github.com/faiznutes/Root.git Warungin
cd Warungin
git checkout main
```

### 4. Setup Environment File

```bash
# Copy env.example ke .env
cp env.example .env

# Edit .env file
nano .env
```

**Penting:** Edit variabel berikut di `.env`:

```env
# Database Password (generate secure password)
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgres:5432/warungin?schema=public

# JWT Secrets (generate secure secrets, minimal 32 karakter)
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_min_32_characters

# Frontend & Backend URL (sesuaikan dengan domain/IP Anda)
FRONTEND_URL=https://pos.faiznute.site
BACKEND_URL=https://pos.faiznute.site/api
CORS_ORIGIN=https://pos.faiznute.site,http://localhost:5173

# SMTP Email (untuk email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Warungin POS <noreply@warungin.com>

# Midtrans Payment Gateway
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Cloudflare Tunnel (jika menggunakan)
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_here
```

**Generate Secure Passwords:**

```bash
# Generate JWT Secret
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# Generate Database Password
openssl rand -base64 24 | tr -d "=+/" | cut -c1-24
```

### 5. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
```

### 6. Build Docker Images

```bash
cd /home/warungin/Warungin
docker compose build
```

### 7. Start Docker Containers

```bash
# Start semua services
docker compose up -d

# Cek status
docker compose ps

# Lihat logs
docker compose logs -f
```

### 8. Setup Database & Super Admin

Database migration dan super admin akan dibuat otomatis saat container backend start. Tunggu beberapa detik, lalu:

```bash
# Cek apakah super admin sudah dibuat
docker compose logs backend | grep "Super Admin"

# Atau buat manual jika perlu
docker compose exec backend node scripts/create-super-admin-docker.js
```

### 9. Setup Cloudflare Tunnel (Opsional)

Jika menggunakan Cloudflare Tunnel untuk public access:

```bash
# 1. Setup tunnel di Cloudflare Dashboard
#    - Zero Trust > Networks > Tunnels
#    - Create tunnel
#    - Copy TUNNEL_TOKEN

# 2. Edit .env dan tambahkan token
nano .env
# Tambahkan: CLOUDFLARE_TUNNEL_TOKEN=your_token_here

# 3. Start tunnel
docker compose --profile cloudflare up -d cloudflared

# 4. Configure Public Hostname di Cloudflare Dashboard
#    - Service: http://nginx:80
#    - Public Hostname: pos.faiznute.site
```

## ✅ Verifikasi Setup

### 1. Check Container Status

```bash
docker compose ps
```

Semua container harus status `Up`:
- `warungin-postgres` - Database
- `warungin-backend` - Backend API
- `warungin-frontend` - Frontend
- `warungin-nginx` - Reverse Proxy
- `warungin-cloudflared` - Cloudflare Tunnel (jika enabled)

### 2. Check Health

```bash
# Backend health check
curl http://localhost/api/health

# Frontend
curl http://localhost
```

### 3. Check Logs

```bash
# Semua logs
docker compose logs -f

# Logs service tertentu
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 4. Test Login

Akses aplikasi di browser:
- **URL:** `http://your-vps-ip` atau `https://pos.faiznute.site`
- **Email:** `admin@warungin.com`
- **Password:** `admin123`

⚠️ **PENTING:** Ganti password default setelah login pertama!

## 🔄 Update Application

Setelah ada update di repository:

```bash
cd /home/warungin/Warungin

# Pull latest code
git pull origin main

# Rebuild containers
docker compose down
docker compose up -d --build

# Tunggu beberapa detik
sleep 20

# Cek status
docker compose ps
```

## 🛠️ Management Commands

### Restart Services

```bash
# Restart semua
docker compose restart

# Restart service tertentu
docker compose restart backend
docker compose restart frontend
```

### View Logs

```bash
# Semua services
docker compose logs -f

# Service tertentu
docker compose logs -f backend
docker compose logs -f frontend
```

### Database Management

```bash
# Masuk ke database
docker compose exec postgres psql -U postgres -d warungin

# Backup database
docker compose exec postgres pg_dump -U postgres warungin > backup_$(date +%Y%m%d).sql

# Restore database
docker compose exec -T postgres psql -U postgres -d warungin < backup.sql
```

### Create Super Admin (Manual)

```bash
docker compose exec backend node scripts/create-super-admin-docker.js
```

## 🐛 Troubleshooting

### Container tidak start

```bash
# Cek logs
docker compose logs [service-name]

# Cek status
docker compose ps

# Restart
docker compose restart [service-name]
```

### Database connection error

```bash
# Cek apakah postgres running
docker compose ps postgres

# Cek DATABASE_URL di .env
cat .env | grep DATABASE_URL

# Test connection
docker compose exec backend node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('OK')).catch(e => console.error(e))"
```

### Frontend tidak load

```bash
# Cek frontend container
docker compose ps frontend

# Cek nginx logs
docker compose logs nginx

# Rebuild frontend
docker compose up -d --build frontend
```

### Permission denied

```bash
# Fix permissions
sudo chown -R $USER:$USER /home/warungin/Warungin
```

## 📊 Default Credentials

- **Super Admin Email:** `admin@warungin.com`
- **Super Admin Password:** `admin123`
- **Database User:** `postgres`
- **Database Name:** `warungin`

⚠️ **PENTING:** Ganti semua password default setelah setup!

## 🔐 Security Checklist

- [ ] Ganti `POSTGRES_PASSWORD` di `.env`
- [ ] Ganti `JWT_SECRET` dan `JWT_REFRESH_SECRET` di `.env`
- [ ] Ganti password super admin setelah login pertama
- [ ] Setup firewall (UFW)
- [ ] Setup SSL certificate (jika tidak menggunakan Cloudflare Tunnel)
- [ ] Backup database secara berkala
- [ ] Update Docker images secara berkala

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Made with ❤️ for UMKM Indonesia**

