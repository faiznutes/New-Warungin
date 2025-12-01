# Tutorial Pull dan Update Docker

Panduan lengkap untuk pull perubahan terbaru dari Git dan update Docker containers.

## Prasyarat

- Git sudah terinstall
- Docker dan Docker Compose sudah terinstall
- Akses ke repository Git (sudah di-clone)
- File `.env` sudah dikonfigurasi dengan benar

## Langkah 1: Backup (Opsional tapi Disarankan)

Sebelum pull, disarankan untuk backup database dan file penting:

```bash
# Backup database
docker compose exec postgres pg_dump -U postgres warungin > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau backup semua data Docker volumes
docker compose down
docker run --rm -v warungin_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

## Langkah 2: Pull Perubahan dari Git

```bash
# Pastikan Anda di root directory project
cd /path/to/New-Warungin

# Cek status git (opsional)
git status

# Pull perubahan terbaru dari branch main
git pull origin main

# Atau jika ingin pull dari branch tertentu
# git pull origin <branch-name>
```

## Langkah 3: Stop Containers (Jika Sedang Berjalan)

```bash
# Stop semua containers
docker compose down

# Atau stop containers tertentu saja
# docker compose stop backend frontend
```

## Langkah 4: Rebuild Containers

Karena ada perubahan code, kita perlu rebuild containers:

```bash
# Rebuild semua services (backend dan frontend)
docker compose build --no-cache

# Atau rebuild service tertentu saja
# docker compose build --no-cache backend
# docker compose build --no-cache frontend
```

**Catatan:**
- `--no-cache` memastikan semua layer di-rebuild dari awal (disarankan setelah pull)
- Tanpa `--no-cache` akan lebih cepat tapi mungkin tidak mengambil perubahan terbaru

## Langkah 5: Jalankan Database Migration (Jika Ada)

Jika ada perubahan schema database:

```bash
# Jalankan migration di dalam container backend
docker compose run --rm backend npm run prisma:migrate:safe

# Atau jika menggunakan Prisma langsung
# docker compose run --rm backend npx prisma migrate deploy
```

## Langkah 6: Start Containers

```bash
# Start semua services
docker compose up -d

# Atau start dengan logs untuk monitoring
# docker compose up -d && docker compose logs -f
```

## Langkah 7: Verifikasi Services

```bash
# Cek status semua containers
docker compose ps

# Cek logs untuk memastikan tidak ada error
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs nginx --tail=50

# Cek health check
docker compose ps | grep -E "(healthy|unhealthy)"
```

## Langkah 8: Restart Cloudflared (Jika Menggunakan)

Jika menggunakan Cloudflare Tunnel:

```bash
# Restart cloudflared
docker compose --profile cloudflare restart cloudflared

# Atau start ulang dengan profile
# docker compose --profile cloudflare up -d cloudflared

# Cek status
docker compose --profile cloudflare ps cloudflared
docker compose --profile cloudflare logs cloudflared --tail=50
```

## Langkah 9: Verifikasi Aplikasi

1. **Cek Backend Health:**
   ```bash
   curl http://localhost:3000/health
   # Atau jika menggunakan domain
   curl https://pos.faiznute.site/api/health
   ```

2. **Cek Frontend:**
   - Buka browser dan akses `https://pos.faiznute.site`
   - Pastikan halaman bisa diakses
   - Test login dan fitur utama

3. **Cek Logs untuk Error:**
   ```bash
   # Monitor logs real-time
   docker compose logs -f
   
   # Cek error khusus
   docker compose logs backend | grep -i error
   docker compose logs frontend | grep -i error
   ```

## Troubleshooting

### Error: Port Already in Use

```bash
# Cek port yang digunakan
sudo lsof -i :80
sudo lsof -i :3000

# Stop service yang menggunakan port
# Atau ubah port di docker-compose.yml
```

### Error: Container Tidak Start

```bash
# Cek logs detail
docker compose logs <service-name>

# Cek konfigurasi
docker compose config

# Restart service tertentu
docker compose restart <service-name>
```

### Error: Database Connection

```bash
# Cek database container
docker compose ps postgres

# Test koneksi database
docker compose exec postgres psql -U postgres -d warungin -c "SELECT 1;"

# Cek environment variables
docker compose exec backend env | grep DATABASE
```

### Error: Build Failed

```bash
# Clean build
docker compose down
docker system prune -f
docker compose build --no-cache

# Atau rebuild service tertentu
docker compose build --no-cache backend
```

### Frontend Tidak Update

```bash
# Force rebuild frontend
docker compose build --no-cache frontend
docker compose up -d frontend

# Clear browser cache atau hard refresh (Ctrl+Shift+R)
```

## Script Otomatis (Opsional)

Buat script untuk memudahkan proses:

```bash
#!/bin/bash
# File: update-docker.sh

echo "🔄 Pulling latest changes..."
git pull origin main

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Rebuilding containers..."
docker compose build --no-cache

echo "🗄️ Running migrations..."
docker compose run --rm backend npm run prisma:migrate:safe

echo "🚀 Starting containers..."
docker compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "✅ Checking services status..."
docker compose ps

echo "📋 Recent logs:"
docker compose logs --tail=20

echo "✨ Update complete!"
```

Gunakan script:
```bash
chmod +x update-docker.sh
./update-docker.sh
```

## Quick Update (Tanpa Rebuild)

Jika hanya perubahan kecil dan tidak perlu rebuild:

```bash
# Pull changes
git pull origin main

# Restart containers (menggunakan image yang sudah ada)
docker compose restart backend frontend

# Atau reload nginx config saja
docker compose exec nginx nginx -s reload
```

## Checklist Update

- [ ] Backup database (opsional)
- [ ] Pull perubahan dari Git
- [ ] Stop containers
- [ ] Rebuild containers (jika ada perubahan code)
- [ ] Run migrations (jika ada perubahan schema)
- [ ] Start containers
- [ ] Verifikasi health check
- [ ] Test aplikasi di browser
- [ ] Cek logs untuk error
- [ ] Restart Cloudflared (jika perlu)

## Tips

1. **Selalu pull di waktu maintenance** untuk menghindari downtime
2. **Monitor logs** setelah update untuk memastikan tidak ada error
3. **Test fitur penting** setelah update
4. **Backup database** sebelum update besar
5. **Gunakan `--no-cache`** saat rebuild untuk memastikan perubahan terbaru terambil

## Perintah Cepat

```bash
# Full update (pull + rebuild + restart)
git pull && docker compose down && docker compose build --no-cache && docker compose up -d

# Quick restart (tanpa rebuild)
docker compose restart

# View logs
docker compose logs -f

# Check status
docker compose ps

# Clean up (hati-hati!)
docker compose down -v  # Hapus volumes juga
docker system prune -a  # Hapus semua unused images
```

