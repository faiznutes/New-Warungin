# Troubleshooting Error 502 Bad Gateway

Error 502 Bad Gateway terjadi ketika Cloudflare tidak bisa terhubung ke server backend melalui Cloudflare Tunnel.

## Penyebab Umum

1. **Backend service tidak running atau tidak healthy**
2. **Nginx tidak bisa connect ke backend**
3. **Cloudflared tidak bisa connect ke nginx**
4. **Database connection error**
5. **Backend crash atau timeout**

## Langkah Troubleshooting

### 1. Cek Status Docker Containers

```bash
docker compose ps
```

Pastikan semua service berstatus `Up` dan `healthy`:
- `warungin-backend` - harus `Up` dan `healthy`
- `warungin-nginx` - harus `Up` dan `healthy`
- `warungin-cloudflared` - harus `Up` (bisa `unhealthy` tapi masih berfungsi)
- `warungin-postgres` - harus `Up` dan `healthy`

### 2. Cek Logs Backend

```bash
docker compose logs backend --tail=100
```

Cari error seperti:
- Database connection errors
- Prisma errors (P1001, P1002)
- Application crashes
- Memory errors

### 3. Cek Logs Nginx

```bash
docker compose logs nginx --tail=50
```

Cari error seperti:
- `upstream timed out`
- `connect() failed`
- `Connection refused`

### 4. Cek Logs Cloudflared

```bash
docker compose logs cloudflared --tail=50
```

Cari error seperti:
- Connection errors
- Tunnel errors
- Error 1033

### 5. Test Backend Health Endpoint

```bash
# Dari dalam container backend
docker compose exec backend wget -qO- http://localhost:3000/health

# Atau dari host (jika port exposed)
curl http://localhost:3000/health
```

Harus return JSON dengan status `ok`.

### 6. Test Nginx ke Backend

```bash
# Dari dalam container nginx
docker compose exec nginx wget -qO- http://backend:3000/health
```

Harus return JSON dengan status `ok`.

### 7. Test Cloudflared ke Nginx

```bash
# Dari dalam container cloudflared
docker compose exec cloudflared wget -qO- http://nginx:80/health
```

Harus return `healthy`.

## Solusi Umum

### Backend Tidak Healthy

1. **Restart backend:**
```bash
docker compose restart backend
```

2. **Cek database connection:**
```bash
docker compose exec backend node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('DB OK')).catch(e => console.error('DB Error:', e)).finally(() => prisma.\$disconnect());"
```

3. **Cek environment variables:**
```bash
docker compose exec backend env | grep -E 'DATABASE_URL|JWT_SECRET|NODE_ENV'
```

### Nginx Tidak Bisa Connect ke Backend

1. **Cek network connectivity:**
```bash
docker compose exec nginx ping -c 3 backend
```

2. **Cek nginx configuration:**
```bash
docker compose exec nginx nginx -t
```

3. **Reload nginx:**
```bash
docker compose exec nginx nginx -s reload
```

### Cloudflared Tidak Bisa Connect ke Nginx

1. **Cek tunnel token:**
```bash
docker compose exec cloudflared env | grep TUNNEL_TOKEN
```

2. **Restart cloudflared:**
```bash
docker compose restart cloudflared
```

3. **Cek Cloudflare Dashboard:**
   - Login ke Cloudflare Dashboard
   - Go to Zero Trust > Networks > Tunnels
   - Cek status tunnel
   - Cek Public Hostname configuration

### Database Connection Error

1. **Cek postgres status:**
```bash
docker compose ps postgres
```

2. **Cek postgres logs:**
```bash
docker compose logs postgres --tail=50
```

3. **Test database connection:**
```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT 1;"
```

4. **Restart postgres (jika perlu):**
```bash
docker compose restart postgres
```

## Quick Fix Commands

```bash
# Restart semua services
docker compose restart

# Rebuild dan restart backend
docker compose build backend
docker compose up -d backend

# Restart nginx
docker compose restart nginx

# Restart cloudflared
docker compose restart cloudflared

# View all logs
docker compose logs --tail=100 -f
```

## Monitoring

### Health Check Endpoints

- Backend: `http://backend:3000/health` (internal)
- Nginx: `http://nginx:80/health` (internal)
- Public: `https://pos.faiznute.site/health` (via Cloudflare)

### Expected Responses

**Backend Health:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T08:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

**Nginx Health:**
```
healthy
```

## Prevention

1. **Monitor health checks** - Set up monitoring untuk health endpoints
2. **Set resource limits** - Pastikan containers punya cukup memory/CPU
3. **Database connection pooling** - Configure Prisma connection pool dengan benar
4. **Error handling** - Pastikan semua routes menggunakan `handleRouteError`
5. **Logging** - Monitor logs untuk early detection

## Emergency Recovery

Jika semua service down:

```bash
# Stop semua
docker compose down

# Start semua
docker compose up -d

# Monitor startup
docker compose logs -f
```

## Contact Support

Jika masalah masih terjadi setelah mencoba semua langkah di atas:
1. Collect logs: `docker compose logs > logs.txt`
2. Collect status: `docker compose ps > status.txt`
3. Screenshot Cloudflare Dashboard tunnel status
4. Contact administrator dengan informasi tersebut

