# 🐳 CLOUDFLARE TUNNEL - DOCKER SETUP GUIDE

Tunnel ID: **dadba309-669b-4163-b903-59ef4302c3cb**

---

## 📋 STEP 1: Copy Credentials ke Server

1. **Download credentials file dari CloudFlare Zero Trust:**
   - Go to: https://dash.cloudflare.com/
   - Navigate: Account → Zero Trust → Tunnels
   - Find tunnel: `warungin-pos`
   - Click: Download credentials
   - Save file ke desktop

2. **Transfer ke server:**
   
   Dari Windows PowerShell (SSH):
   ```cmd
   scp "C:\Users\[username]\Downloads\dadba309-669b-4163-b903-59ef4302c3cb.json" root@192.168.1.101:/root/New-Warungin/credentials/
   ```

   Atau gunakan WinSCP untuk copy file.

---

## 📝 STEP 2: Create Docker Compose Update

File: `/root/New-Warungin/docker-compose.simple.yml`

**Tambahkan service baru di bawah AlertManager:**

```yaml
  # ========== CLOUDFLARE TUNNEL ==========
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: warungin-cloudflared
    restart: unless-stopped
    networks:
      - warungin-network
    volumes:
      - ./credentials/dadba309-669b-4163-b903-59ef4302c3cb.json:/etc/cloudflared/config.json:ro
    command: tunnel --config /etc/cloudflared/config.json run
    depends_on:
      - postgres
      - redis
      - backend
      - frontend
    environment:
      - LOG_LEVEL=debug
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7844/ready"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 5s
```

---

## 🗂️ STEP 3: Create Tunnel Config File

1. **Create directory:**
   ```bash
   ssh root@192.168.1.101
   mkdir -p /root/New-Warungin/credentials
   cd /root/New-Warungin/credentials
   ```

2. **Create tunnel config file:**
   ```bash
   nano config.json
   ```

   **Paste content (ganti TUNNEL-ID):**
   ```json
   {
     "tunnel": "dadba309-669b-4163-b903-59ef4302c3cb",
     "credentials-file": "/etc/cloudflared/config.json",
     "ingress": [
       {
         "hostname": "pos.faiznute.site",
         "service": "http://frontend:80"
       },
       {
         "hostname": "api.pos.faiznute.site",
         "service": "http://backend:3000"
       },
       {
         "hostname": "monitoring.pos.faiznute.site",
         "service": "http://grafana:3000"
       },
       {
         "service": "http_status:404"
       }
     ]
   }
   ```

   Save: `Ctrl+X` → `Y` → `Enter`

3. **Verify file created:**
   ```bash
   ls -la credentials/
   cat credentials/config.json
   ```

---

## 🚀 STEP 4: Start All Services

Di server (`/root/New-Warungin`):

```bash
# 1. Stop running services
docker-compose -f docker-compose.simple.yml down

# 2. Verify stopped
docker ps

# 3. Start all services (including tunnel)
docker-compose -f docker-compose.simple.yml up -d

# 4. Show all containers
docker ps -a
```

---

## ✅ STEP 5: Verify All Services Healthy

```bash
# Check status semua container
docker-compose -f docker-compose.simple.yml ps

# Expected output:
#
# CONTAINER ID   IMAGE          COMMAND                  CREATED              STATUS                        PORTS                                         NAMES
# xxx            cloudflare/... "cloudflared tunnel..."  About a minute ago   Up About a minute (healthy)   7844/tcp                                      warungin-cloudflared
# xxx            postgres:15    "docker-entrypoint..."   About 2 minutes ago  Up About 2 minutes (healthy)  5432/tcp                                      warungin-postgres
# xxx            redis:7        "redis-server"           About 2 minutes ago  Up About 2 minutes (healthy)  6379/tcp                                      warungin-redis
# xxx            node:20        "docker-entrypoint..."   About 2 minutes ago  Up About 2 minutes (healthy)  3000/tcp                                      warungin-backend
# xxx            node:20        "docker-entrypoint..."   About 2 minutes ago  Up About 2 minutes (healthy)  80/tcp                                        warungin-frontend
# xxx            nginx:latest   "nginx -g 'daemon off..." About 2 minutes ago  Up About 2 minutes (healthy)  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp    warungin-nginx
# xxx            prom/prom...   "/bin/prometheus"        About 2 minutes ago  Up About 2 minutes (healthy)  9090/tcp                                      warungin-prometheus
# xxx            grafana/graf... "/run.sh"                About 2 minutes ago  Up About 2 minutes (healthy)  3000/tcp                                      warungin-grafana
# xxx            prom/alert...  "/bin/alertmanager"      About 2 minutes ago  Up About 2 minutes (healthy)  9093/tcp                                      warungin-alertmanager
```

**Check status:**

```bash
# Setiap service harus "Up" dan "(healthy)"
# Jika ada yang "Exited" atau tidak healthy → lihat logs

# Check logs specific service
docker logs warungin-cloudflared

docker logs warungin-backend

docker logs warungin-frontend
```

---

## 🔍 STEP 6: Verify Tunnel Connected

Di server:

```bash
# Check tunnel logs
docker logs warungin-cloudflared

# Expected output (final lines):
# 2026-01-21 15:00:00 INF Connection registered. connIndex=0 ip=1.2.3.4
# 2026-01-21 15:00:01 INF Registered warp routing rules.
# 2026-01-21 15:00:02 INF Tunnel running at full capacity. connIndex=0
```

✅ **Jika ada "Connection registered"** → Tunnel connected!

❌ **Jika ada error** → Lihat TROUBLESHOOTING di bawah

---

## 📊 STEP 7: Test Local Access

Di server:

```bash
# Test frontend
curl -k https://127.0.0.1/

# Test API
curl -k https://127.0.0.1/api/health

# Test Grafana
curl -k https://127.0.0.1/grafana/

# Test tunnel status
curl http://127.0.0.1:7844/ready
```

✅ **Expected: HTTP 200 atau 302 (redirect)**

---

## 🌍 STEP 8: Test External Access

Dari Windows/laptop (setelah tunnel connected):

```cmd
# Test website
curl -k https://pos.faiznute.site/

# Test API
curl -k https://api.pos.faiznute.site/

# Test monitoring
curl -k https://monitoring.pos.faiznute.site/
```

✅ **Expected: Response dari server**

---

## 🐛 TROUBLESHOOTING

### Error: "failed to decode credentials"

**Penyebab:** Credentials file format salah atau path wrong

**Fix:**
```bash
# 1. Cek file ada
ls -la /root/New-Warungin/credentials/dadba309-669b-4163-b903-59ef4302c3cb.json

# 2. Cek content valid (harus JSON)
cat /root/New-Warungin/credentials/dadba309-669b-4163-b903-59ef4302c3cb.json

# 3. Re-download dari CloudFlare dan copy ulang
```

### Error: "Tunnel not found"

**Penyebab:** Tunnel ID salah atau tunnel deleted

**Fix:**
```bash
# Cek dari Windows Power Shell
cloudflared tunnel list

# Pastikan output punya:
# dadba309-669b-4163-b903-59ef4302c3cb  warungin-pos  ...
```

### Container not starting (Exited)

**Fix:**
```bash
# Check logs
docker logs warungin-cloudflared

# Rebuild image
docker-compose -f docker-compose.simple.yml down
docker pull cloudflare/cloudflared:latest
docker-compose -f docker-compose.simple.yml up -d
```

### DNS not resolving

**Fix:**
```bash
# Ensure CNAME record set correctly
nslookup pos.faiznute.site

# Should return CloudFlare IP
# If not, wait 5-60 minutes for DNS propagation
```

---

## 📋 FINAL CHECKLIST

```
[ ] 1. Credentials file downloaded from CloudFlare
[ ] 2. Credentials file copied to server: /root/New-Warungin/credentials/
[ ] 3. Config files created (config.json in credentials/)
[ ] 4. docker-compose.simple.yml updated with cloudflared service
[ ] 5. All services started: docker-compose up -d
[ ] 6. All containers showing (healthy): docker ps
[ ] 7. Tunnel logs show "Connection registered": docker logs warungin-cloudflared
[ ] 8. Local access working: curl -k https://127.0.0.1/
[ ] 9. External access working: https://pos.faiznute.site/
[ ] 10. Both primary and backup hostnames accessible
```

---

## 🎯 NEXT STEPS

1. **Download credentials** from CloudFlare
2. **Copy to server** via SCP
3. **Create config files** in /root/New-Warungin/credentials/
4. **Update docker-compose.yml** (atau saya buatkan file updated-nya)
5. **Run: docker-compose up -d**
6. **Verify: docker ps & docker logs**
7. **Test:** Internal curl + external curl

---

**Ready to setup? Send me:**
- Credentials file (atau I can generate it)
- Confirmation: tunnel ID is `dadba309-669b-4163-b903-59ef4302c3cb` ✓
