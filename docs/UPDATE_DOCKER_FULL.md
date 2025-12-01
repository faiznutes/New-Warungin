# Instruksi Update Docker Full

## Ringkasan Update

Update ini mencakup perbaikan komprehensif error handling di semua route files backend untuk mencegah error 502 dan meningkatkan konsistensi error responses.

## Langkah-langkah Update

### 1. Backup (Opsional tapi Disarankan)

```bash
# Backup database (jika diperlukan)
docker compose exec postgres pg_dump -U postgres warungin > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau backup volume
docker compose stop postgres
docker run --rm -v warungin_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data
docker compose start postgres
```

### 2. Pull Changes dari Git

```bash
# Masuk ke direktori project
cd /path/to/New-Warungin

# Pull latest changes
git pull origin main

# Verifikasi changes
git log --oneline -5
```

### 3. Rebuild Backend Container

```bash
# Rebuild backend dengan no-cache untuk memastikan semua perubahan ter-apply
docker compose build --no-cache backend

# Verifikasi build berhasil
docker compose images backend
```

### 4. Stop Services (Graceful Shutdown)

```bash
# Stop semua services dengan graceful shutdown
docker compose stop backend nginx

# Atau stop semua services
docker compose stop
```

### 5. Run Database Migrations (Jika Ada)

```bash
# Run migrations dengan safe mode
docker compose run --rm backend npm run prisma:migrate:safe

# Atau jika menggunakan migrate deploy
docker compose run --rm backend npx prisma migrate deploy
```

### 6. Start Services

```bash
# Start semua services
docker compose up -d

# Atau start specific services
docker compose up -d backend nginx
```

### 7. Verifikasi Services

```bash
# Check status semua containers
docker compose ps

# Check health status
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Check logs untuk memastikan tidak ada error
docker compose logs backend --tail=50
docker compose logs nginx --tail=50
```

### 8. Test Health Endpoints

```bash
# Test backend health
curl http://localhost:3000/health

# Test nginx health
curl http://localhost:80/health

# Test API endpoint
curl http://localhost:80/api/health
```

### 9. Monitor Logs

```bash
# Monitor backend logs
docker compose logs -f backend

# Monitor nginx logs
docker compose logs -f nginx

# Monitor semua services
docker compose logs -f
```

## Troubleshooting

### Jika Backend Tidak Start

```bash
# Check logs
docker compose logs backend --tail=100

# Check container status
docker compose ps backend

# Restart backend
docker compose restart backend

# Jika masih error, rebuild
docker compose build --no-cache backend
docker compose up -d backend
```

### Jika Error 502 Masih Terjadi

1. **Check Backend Status**
   ```bash
   docker compose ps backend
   docker compose logs backend --tail=100
   ```

2. **Check Nginx Status**
   ```bash
   docker compose ps nginx
   docker compose logs nginx --tail=100
   ```

3. **Check Database Connection**
   ```bash
   docker compose exec backend npm run prisma:status
   ```

4. **Restart Services**
   ```bash
   docker compose restart backend nginx
   ```

5. **Check Network**
   ```bash
   # Test backend dari nginx container
   docker compose exec nginx wget -O- http://backend:3000/health
   ```

### Jika Database Migration Error

```bash
# Check database connection
docker compose exec postgres psql -U postgres -c "SELECT version();"

# Check Prisma status
docker compose exec backend npx prisma migrate status

# Reset database (HATI-HATI: ini akan menghapus semua data)
# docker compose exec backend npx prisma migrate reset
```

### Rollback (Jika Diperlukan)

```bash
# Rollback ke commit sebelumnya
git log --oneline -10  # Cari commit hash sebelumnya
git checkout <commit-hash>

# Rebuild dan restart
docker compose build --no-cache backend
docker compose up -d
```

## Quick Update Script

Untuk update cepat, gunakan script berikut:

```bash
#!/bin/bash
# update-docker-full.sh

set -e

echo "🔄 Starting Docker update..."

# Pull changes
echo "📥 Pulling changes from git..."
git pull origin main

# Rebuild backend
echo "🔨 Rebuilding backend..."
docker compose build --no-cache backend

# Stop services
echo "⏹️  Stopping services..."
docker compose stop backend nginx

# Run migrations
echo "🗄️  Running database migrations..."
docker compose run --rm backend npm run prisma:migrate:safe || true

# Start services
echo "▶️  Starting services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking health..."
curl -f http://localhost:3000/health && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
curl -f http://localhost:80/health && echo "✅ Nginx healthy" || echo "❌ Nginx unhealthy"

echo "✅ Update completed!"
```

Simpan sebagai `update-docker-full.sh` dan jalankan:
```bash
chmod +x update-docker-full.sh
./update-docker-full.sh
```

## Verifikasi Update Berhasil

Setelah update, verifikasi hal berikut:

1. **Backend Health Check**
   ```bash
   curl http://localhost:3000/health
   # Harus return: {"status":"ok",...}
   ```

2. **API Endpoint Test**
   ```bash
   # Test dengan invalid request untuk verify error handling
   curl -X POST http://localhost:80/api/users \
     -H "Content-Type: application/json" \
     -d '{"invalid": "data"}'
   # Harus return error dengan format JSON yang konsisten
   ```

3. **Check Error Logs**
   ```bash
   # Pastikan tidak ada error di logs
   docker compose logs backend | grep -i error | tail -20
   ```

4. **Check Container Status**
   ```bash
   docker compose ps
   # Semua containers harus "Up" dan "healthy"
   ```

## Catatan Penting

1. **Downtime**: Update ini memerlukan downtime singkat (sekitar 1-2 menit)
2. **Database**: Tidak ada perubahan schema, migration hanya untuk safety
3. **Backward Compatible**: Semua perubahan backward compatible
4. **No Breaking Changes**: Frontend tidak perlu perubahan

## Support

Jika mengalami masalah:
1. Check logs: `docker compose logs -f`
2. Check health: `curl http://localhost:3000/health`
3. Check container status: `docker compose ps`
4. Review dokumentasi: `docs/PERBAIKAN_ERROR_HANDLING.md`

