# Instruksi Deploy Permission Fixes ke SSH Server

## Metode 1: Menggunakan Script Quick Deploy (RECOMMENDED)

1. **Buka WSL atau Git Bash**

2. **Jalankan script:**
```bash
cd "f:/Backup W11/Project/New-Warungin"
bash QUICK_DEPLOY.sh
```

Script akan otomatis:
- Membuat archive file yang diubah
- Transfer ke server
- Extract dan rebuild Docker containers

## Metode 2: Manual dengan WSL atau Git Bash

1. **Buka WSL atau Git Bash**

2. **Masuk ke direktori project:**
```bash
cd "/mnt/f/Backup W11/Project/New-Warungin"
# atau di Git Bash Windows:
cd "/f/Backup W11/Project/New-Warungin"
```

3. **Buat archive hanya file yang diubah:**
```bash
tar -czf /tmp/warungin-permission-fix.tar.gz \
    src/middlewares/plan-feature-guard.ts \
    src/routes/outlet.routes.ts \
    src/routes/supplier.routes.ts \
    src/routes/purchase-order.routes.ts \
    src/routes/stock-transfer.routes.ts \
    src/routes/stock-alert.routes.ts \
    src/services/plan-features.service.ts \
    client/src/layouts/AppLayout.vue \
    client/src/layouts/TenantLayout.vue \
    client/src/views/stores/Stores.vue \
    client/src/router/index.ts \
    docker-compose.yml
```

4. **Transfer ke server (masukkan password: 123):**
```bash
scp -o StrictHostKeyChecking=no /tmp/warungin-permission-fix.tar.gz root@192.168.1.101:/tmp/
```

5. **SSH ke server dan deploy:**
```bash
ssh root@192.168.1.101
cd /root/New-Warungin
tar -xzf /tmp/warungin-permission-fix.tar.gz
rm /tmp/warungin-permission-fix.tar.gz
docker compose down
docker compose build --no-cache
docker compose up -d
sleep 5
docker compose ps
```

## Metode 2: Menggunakan rsync (jika tersedia)

```bash
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' \
    "f:/Backup W11/Project/New-Warungin/" root@192.168.1.101:/root/New-Warungin/
```

## Metode 3: Manual Copy dengan SFTP Client

1. Gunakan WinSCP, FileZilla, atau SFTP client lainnya
2. Connect ke: `root@192.168.1.101` (password: 123)
3. Navigate ke `/root/New-Warungin`
4. Upload semua file yang telah diubah (kecuali node_modules, .git, dist, build)
5. SSH ke server dan rebuild:
```bash
ssh root@192.168.1.101
cd /root/New-Warungin
docker compose down
docker compose build --no-cache
docker compose up -d
```

## File-file yang penting untuk di-deploy:

### Frontend (client/):
- `client/src/layouts/AppLayout.vue` - Menu stores & addon check
- `client/src/layouts/TenantLayout.vue` - Inventory menu check & subscription load
- `client/src/views/stores/Stores.vue` - Permission check
- `client/src/router/index.ts` - Route permissions

### Backend (src/):
- `src/middlewares/plan-feature-guard.ts` - **NEW FILE** - Plan feature check
- `src/routes/outlet.routes.ts` - Role guard
- `src/routes/supplier.routes.ts` - Plan feature guard
- `src/routes/purchase-order.routes.ts` - Plan feature guard
- `src/routes/stock-transfer.routes.ts` - Plan feature guard
- `src/routes/stock-alert.routes.ts` - Plan feature guard
- `src/services/plan-features.service.ts` - ENTERPRISE plan fix

Setelah deploy, pastikan semua container running:
```bash
docker compose ps
```

Check logs jika ada error:
```bash
docker compose logs backend
docker compose logs frontend
```
