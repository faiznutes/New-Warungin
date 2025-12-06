# Instruksi Deploy Menggunakan Git Push/Pull

## ✅ Status: Code sudah di-push ke GitHub!

Commit hash: `e6562a7`

## Langkah Deployment di SSH Server:

### Metode 1: Manual SSH (RECOMMENDED)

1. **SSH ke server:**
```bash
ssh root@192.168.1.101
```

2. **Masuk ke direktori project:**
```bash
cd /root/New-Warungin
```

3. **Pull latest changes:**
```bash
git pull origin main
```

4. **Stop containers:**
```bash
docker compose down
```

5. **Build Docker containers:**
```bash
docker compose build --no-cache
```

6. **Start containers:**
```bash
docker compose up -d
```

7. **Check status:**
```bash
docker compose ps
docker compose logs --tail=20
```

### Metode 2: Menggunakan Script Otomatis

Jika menggunakan sshpass (atau manual password):

```bash
# Dari local machine (WSL/Git Bash)
ssh root@192.168.1.101 "cd /root/New-Warungin && git pull origin main && docker compose down && docker compose build --no-cache && docker compose up -d && docker compose ps"
```

Atau gunakan script:
```bash
ssh root@192.168.1.101 < scripts/git-pull-and-deploy.sh
```

## File-file yang Di-deploy:

### Backend:
- ✅ `src/middlewares/plan-feature-guard.ts` (NEW)
- ✅ `src/routes/outlet.routes.ts`
- ✅ `src/routes/supplier.routes.ts`
- ✅ `src/routes/purchase-order.routes.ts`
- ✅ `src/routes/stock-transfer.routes.ts`
- ✅ `src/routes/stock-alert.routes.ts`
- ✅ `src/services/plan-features.service.ts`

### Frontend:
- ✅ `client/src/layouts/AppLayout.vue`
- ✅ `client/src/layouts/TenantLayout.vue`
- ✅ `client/src/views/stores/Stores.vue`
- ✅ `client/src/router/index.ts`

## Perbaikan yang Di-deploy:

1. ✅ Menu Inventory - Hanya muncul untuk PRO/ENTERPRISE
2. ✅ Menu Stores - Permission check (ADMIN_TENANT only)
3. ✅ Addon-based menu visibility (Marketing, Business Analytics)
4. ✅ Backend plan feature guard untuk inventory routes
5. ✅ ENTERPRISE plan check fix ('semua' access)

## Verifikasi Setelah Deploy:

1. **Check containers:**
```bash
docker compose ps
```

2. **Check logs:**
```bash
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
```

3. **Test di browser:**
- Login sebagai ADMIN_TENANT dengan BASIC plan - Inventory menu TIDAK muncul
- Login sebagai ADMIN_TENANT dengan PRO plan - Inventory menu MUNCUL
- Test create/edit/delete store - hanya ADMIN_TENANT bisa
- Test inventory routes - BASIC plan return 403

## Troubleshooting:

Jika ada error saat build:
```bash
# Check error logs
docker compose logs backend | grep -i error
docker compose logs frontend | grep -i error

# Rebuild specific service
docker compose build backend --no-cache
docker compose build frontend --no-cache

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

Jika git pull gagal (conflict):
```bash
# Backup current changes
cd /root/New-Warungin
git stash

# Pull fresh
git pull origin main

# Jika perlu restore .env
cp .env.backup .env 2>/dev/null || true
```
