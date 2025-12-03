# 🚀 Deployment Guide - Pull and Compose

Panduan sederhana untuk pull code dan menjalankan aplikasi dengan Docker Compose.

---

## 📥 Quick Start - Pull and Compose

### Linux/Mac
```bash
./scripts/pull-and-compose.sh
```

### Windows
```cmd
scripts\pull-and-compose.bat
```

---

## 📋 Manual Steps

Jika script tidak berfungsi, ikuti langkah manual berikut:

### 1. Pull Latest Code
```bash
git pull origin main
```

### 2. Install Dependencies
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Setup Environment
```bash
# Copy environment file jika belum ada
cp env.example .env

# Edit .env dengan konfigurasi Anda
nano .env  # atau editor lainnya
```

### 4. Generate Prisma Client
```bash
npm run prisma:generate
```

### 5. Validate Prisma Schema
```bash
npx prisma validate
```

### 6. Build Docker Images
```bash
docker compose build
```

### 7. Run Migrations
```bash
docker compose run --rm backend npm run prisma:migrate
```

### 8. Start Services
```bash
docker compose up -d
```

### 9. Check Status
```bash
docker compose ps
```

---

## 🐳 Docker Compose Commands

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart Services
```bash
# All services
docker compose restart

# Specific service
docker compose restart backend
```

### Rebuild and Start
```bash
docker compose up -d --build
```

### View Service Status
```bash
docker compose ps
```

---

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Backend Issues
```bash
# Check backend logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### Frontend Issues
```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend
```

### Port Already in Use
```bash
# Check what's using the port
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80

# Change port in docker-compose.yml or .env
```

---

## 📝 Environment Variables

Pastikan file `.env` sudah dikonfigurasi dengan benar:

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT secret key (min 32 characters)
- `POSTGRES_PASSWORD` - Database password
- `FRONTEND_URL` - Frontend URL
- `BACKEND_URL` - Backend URL
- `CORS_ORIGIN` - CORS allowed origins

### Optional Variables
- `REDIS_HOST` - Redis host (optional)
- `REDIS_PORT` - Redis port (default: 6379)
- `SMTP_HOST` - Email SMTP host
- `MIDTRANS_SERVER_KEY` - Midtrans payment gateway key

Lihat `env.example` untuk daftar lengkap.

---

## ✅ Verification

Setelah deployment, verifikasi:

1. **Backend Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Frontend Access**
   ```
   http://localhost:80
   ```

3. **Database Connection**
   ```bash
   docker compose exec backend npm run check:db
   ```

---

## 🔄 Update Process

Untuk update aplikasi:

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# 3. Run migrations if needed
docker compose run --rm backend npm run prisma:migrate
```

Atau gunakan script:
```bash
./scripts/pull-and-compose.sh  # Linux/Mac
scripts\pull-and-compose.bat   # Windows
```

---

## 📊 Service URLs

Setelah deployment, akses:

- **Frontend:** http://localhost:80 (atau port yang dikonfigurasi)
- **Backend API:** http://localhost:3000/api
- **API Docs (Swagger):** http://localhost:3000/api-docs
- **Prisma Studio:** Run `npm run prisma:studio` locally

---

*Last Updated: 2025-01-29*
