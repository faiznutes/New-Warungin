## 🚀 QUICK START - SETUP TUNNEL DI DOCKER

**Tunnel ID**: `dadba309-669b-4163-b903-59ef4302c3cb`

---

## STEP 1: Download Credentials dari CloudFlare

1. **Go to**: https://dash.cloudflare.com/
2. **Navigate**: Account → Zero Trust → Tunnels → warungin-pos
3. **Click**: Download config / Download credentials
4. **Save** file ke Windows desktop (nama: `dadba309-669b-4163-b903-59ef4302c3cb.json`)

---

## STEP 2: Transfer Credentials ke Server (Linux)

### Option A: Menggunakan SCP (dari Windows PowerShell)

```powershell
scp "C:\Users\[USERNAME]\Desktop\dadba309-669b-4163-b903-59ef4302c3cb.json" root@192.168.1.101:/root/New-Warungin/credentials/
```

**Password**: `123`

### Option B: Menggunakan WinSCP (GUI)

1. **Open WinSCP**
2. **Host name**: 192.168.1.101
3. **User name**: root
4. **Password**: 123
5. **Drag-drop** credentials file ke: `/root/New-Warungin/credentials/`

---

## STEP 3: Verifikasi Directory & File

SSH ke server:

```bash
ssh root@192.168.1.101
# Password: 123

# Check directory
ls -la /root/New-Warungin/credentials/

# Expected output:
# -rw-r--r-- 1 root root 1234 Jan 21 15:00 dadba309-669b-4163-b903-59ef4302c3cb.json

# Verify JSON format
cat /root/New-Warungin/credentials/dadba309-669b-4163-b903-59ef4302c3cb.json
```

Output harus JSON valid (bukan corrupted)

---

## STEP 4: Run Setup Script

Di server:

```bash
cd /root/New-Warungin

# Make script executable
chmod +x setup-tunnel.sh

# Run setup
bash setup-tunnel.sh
```

**Script akan:**
1. ✅ Create credentials directory
2. ✅ Verify credentials file
3. ✅ Stop existing containers
4. ✅ Pull latest Docker images
5. ✅ Start all 9 services (termasuk CloudFlared tunnel)
6. ✅ Wait for services healthy
7. ✅ Display service status
8. ✅ Verify tunnel connected
9. ✅ Test local endpoints

---

## STEP 5: Wait & Monitor

Script akan show tunnel status. Expected output:

```
⏳ STEP 8: Verifying tunnel connection

✅ Tunnel CONNECTED!

📋 Recent tunnel logs:
2026-01-21 15:00:00 INF Connection registered. connIndex=0 ip=1.2.3.4
2026-01-21 15:00:01 INF Tunnel running at full capacity. connIndex=0
```

✅ **Jika ada "Connection registered"** → Tunnel connected!

---

## STEP 6: Verify All Services Healthy

```bash
# Check all containers
docker-compose -f docker-compose.yml ps

# Expected: All services "Up" and "(healthy)"
```

---

## STEP 7: Test External Access

Dari Windows/laptop:

```cmd
# Test website
curl -k https://pos.faiznute.site/

# Test API
curl -k https://api.pos.faiznute.site/

# Test monitoring
curl -k https://monitoring.pos.faiznute.site/
```

**Note**: Mungkin perlu DNS propagation (5-60 menit)

---

## 🧪 TESTING CHECKLIST

```
[ ] 1. Credentials file exists in /root/New-Warungin/credentials/
[ ] 2. Setup script ran successfully
[ ] 3. All 9 services started: docker ps
[ ] 4. All services showing "(healthy)"
[ ] 5. Tunnel logs show "Connection registered"
[ ] 6. Local curl tests working (https://192.168.1.101/)
[ ] 7. External curl tests working (https://pos.faiznute.site/)
[ ] 8. DNS resolving: nslookup pos.faiznute.site
```

---

## 📊 SERVICES YANG AKAN RUNNING

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| PostgreSQL | warungin-postgres | 5432 (internal) | Healthy ✅ |
| Redis | warungin-redis | 6379 (internal) | Healthy ✅ |
| Backend API | warungin-backend | 3000 | Healthy ✅ |
| Frontend | warungin-frontend | 80 | Healthy ✅ |
| Nginx | warungin-nginx | 80/443 | Healthy ✅ |
| Prometheus | warungin-prometheus | 9090 | Healthy ✅ |
| Grafana | warungin-grafana | 3001 | Healthy ✅ |
| AlertManager | warungin-alertmanager | 9093 | Healthy ✅ |
| **CloudFlare Tunnel** | **warungin-cloudflared** | **7844** | **Healthy ✅** |

---

## 🔍 USEFUL COMMANDS

```bash
# View all services
docker-compose -f docker-compose.yml ps

# View specific logs
docker logs warungin-cloudflared
docker logs warungin-backend
docker logs warungin-frontend

# Live logs (follow)
docker-compose -f docker-compose.yml logs -f

# Restart services
docker-compose -f docker-compose.yml restart

# Stop all services
docker-compose -f docker-compose.yml down

# Check tunnel status detail
docker inspect warungin-cloudflared | grep -A 5 "Health"

# Test endpoints from server
curl -k https://127.0.0.1/
curl -k https://127.0.0.1/api/
curl -k https://127.0.0.1/grafana/
```

---

## ❌ TROUBLESHOOTING

### Tunnel shows error "failed to decode credentials"

**Fix:**
```bash
# Verify credentials file
cat /root/New-Warungin/credentials/dadba309-669b-4163-b903-59ef4302c3cb.json

# If corrupted, re-download from CloudFlare and retry
```

### Container exits/crashes

**Fix:**
```bash
# Check logs
docker logs warungin-cloudflared

# Restart
docker-compose -f docker-compose.yml restart cloudflared
```

### DNS not resolving

**Wait**: DNS propagation bisa 5-60 menit

**Check**: `nslookup pos.faiznute.site`

**Verify**: CNAME record set correctly in CloudFlare

### External access not working

**Check**:
```bash
# 1. Tunnel running?
docker ps | grep cloudflared

# 2. Tunnel connected?
docker logs warungin-cloudflared | grep "Connection registered"

# 3. DNS resolving?
nslookup pos.faiznute.site

# 4. Local access working?
curl -k https://192.168.1.101/
```

---

## 🎯 AFTER SETUP

1. **Monitor tunnel** (keep logs open):
   ```bash
   docker logs -f warungin-cloudflared
   ```

2. **Wait for DNS propagation** (5-60 minutes)

3. **Test external access**:
   ```bash
   # From Windows
   curl -k https://pos.faiznute.site/
   nslookup pos.faiznute.site
   ```

4. **Access web UI**:
   - Internal: `https://192.168.1.101/`
   - External: `https://pos.faiznute.site/` (after DNS ready)

---

**Status**: Ready to deploy! ✨
