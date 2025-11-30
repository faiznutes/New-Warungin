# 🔧 Fix Cloudflared Restart Loop

## ❌ Gejala
```
STATUS: Restarting (0) Less than a second ago
```

## 🔍 Diagnosis

### 1. Check Tunnel Token
```bash
# Pastikan token ada di .env
grep CLOUDFLARE_TUNNEL_TOKEN .env

# Jika kosong atau tidak ada, tambahkan:
nano .env
# Tambahkan: CLOUDFLARE_TUNNEL_TOKEN=your_token_here
```

### 2. Check Logs
```bash
# Check logs untuk melihat error
docker compose logs cloudflared --tail=100

# Cari error seperti:
# - "Tunnel token invalid"
# - "Unable to reach the origin service"
# - "Connection refused"
```

### 3. Check Nginx Connectivity
```bash
# Pastikan nginx running dan healthy
docker compose ps nginx

# Test connectivity dari cloudflared ke nginx
docker compose exec cloudflared wget -O- http://nginx:80
```

## ✅ Solusi

### Solusi 1: Update Tunnel Token

Jika token kosong atau invalid:

1. **Buka Cloudflare Dashboard:**
   - https://one.dash.cloudflare.com/
   - Zero Trust > Networks > Tunnels
   - Pilih tunnel Anda

2. **Copy Token:**
   - Klik "Configure"
   - Copy tunnel token

3. **Update .env:**
   ```bash
   nano .env
   # Update: CLOUDFLARE_TUNNEL_TOKEN=your_new_token_here
   ```

4. **Restart Cloudflared:**
   ```bash
   docker compose --profile cloudflare stop cloudflared
   docker compose --profile cloudflare up -d cloudflared
   ```

### Solusi 2: Check Cloudflare Dashboard Configuration

Pastikan Service URL benar:

1. **Buka Cloudflare Dashboard:**
   - Zero Trust > Networks > Tunnels
   - Pilih tunnel > Configure > Public Hostname

2. **Service URL HARUS:**
   - ✅ `http://nginx:80` (jika cloudflared di Docker network)
   - ❌ JANGAN gunakan `http://localhost:80`

3. **Save dan restart:**
   ```bash
   docker compose --profile cloudflare restart cloudflared
   ```

### Solusi 3: Restart dengan Urutan yang Benar

```bash
# Stop cloudflared
docker compose --profile cloudflare stop cloudflared

# Pastikan nginx ready
docker compose ps nginx  # Harus "healthy"

# Start cloudflared
docker compose --profile cloudflare up -d cloudflared

# Check logs
docker compose --profile cloudflare logs -f cloudflared
```

### Solusi 4: Recreate Container

Jika masih restart loop:

```bash
# Stop dan remove
docker compose --profile cloudflare stop cloudflared
docker compose --profile cloudflare rm -f cloudflared

# Recreate
docker compose --profile cloudflare up -d cloudflared

# Check status
docker compose --profile cloudflare ps cloudflared
```

## ⚠️ Catatan Penting

1. **Tunnel Token:**
   - Harus ada di `.env` file
   - Harus valid dan tidak expired
   - Format: `eyJhIjoi...` (panjang string)

2. **Service URL:**
   - Jika cloudflared di Docker: `http://nginx:80`
   - Jika cloudflared di host: `http://localhost:80`

3. **Network:**
   - Cloudflared dan nginx harus di network yang sama
   - Check: `docker network inspect new-warungin_warungin-network`

4. **Restart Policy:**
   - Sudah di-set ke `on-failure:5` untuk mencegah restart loop
   - Healthcheck delay: 90s untuk memberi waktu startup

