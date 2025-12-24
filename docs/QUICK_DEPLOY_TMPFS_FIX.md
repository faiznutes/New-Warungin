# Deploy tmpfs Fix to Production Server

## Quick Deployment (Copy & Paste)

Run these commands on the server (192.168.1.101) as the `faiz` user:

```bash
cd ~/New-Warungin && \
git pull origin main && \
docker compose down && \
docker compose up -d && \
sleep 3 && \
docker compose ps && \
echo "---" && \
docker compose logs nginx 2>&1 | head -30
```

## Step-by-Step (If needed)

### Step 1: Connect to Server
```bash
ssh faiz@192.168.1.101
```

### Step 2: Navigate and Pull Changes
```bash
cd ~/New-Warungin
git pull origin main
```

Expected output:
```
From https://github.com/faiznutes/New-Warungin
   ...existing commits...
   b41eaa615c1 Fix: Add proper tmpfs mount permissions...
Already up to date.
(or: Fast-forward ... files changed)
```

### Step 3: Stop Current Services
```bash
docker compose down
```

### Step 4: Start Services with Fixed Config
```bash
docker compose up -d
```

### Step 5: Monitor nginx Health
```bash
# Check status immediately
docker compose ps

# Should show: nginx  ...  Up (or Up 2 seconds with health: starting)
# NOT "Restarting (1)"

# Check logs for permission errors
docker compose logs nginx

# If healthy, you'll see:
# "2025/12/23 ... [notice] ... nginx/... started"
# NO "Permission denied" errors
```

### Step 6: Verify Services
```bash
# All 11 services should be healthy
docker compose ps

# Test connectivity
curl -I http://localhost/
# Should return: HTTP/1.1 200 OK (or proxy response from backend)
```

## What to Expect After Fix

✅ **Before (Current):**
```
warungin-nginx   nginx:alpine   Restarting (1) 51 seconds ago
```

✅ **After (Expected):**
```
warungin-nginx   nginx:alpine   Up 2 minutes (health: healthy)
```

## If nginx Still Fails

Run this diagnostic:
```bash
# Check tmpfs mounts
docker compose exec nginx ls -la /var/cache/nginx/
docker compose exec nginx ls -la /var/log/nginx/
docker compose exec nginx ls -la /var/run/

# Check permissions
docker compose exec nginx stat /var/cache/nginx/

# Check nginx user
docker compose exec nginx id
# Should show: uid=101(nginx) gid=101(nginx)
```

## Git Commit Reference

**Commit:** `b41eaa615c1917976ccf0b46fc5dc0b300f30b87`
**Changes:** Corrected tmpfs mount permissions in docker-compose.yml
**Repository:** https://github.com/faiznutes/New-Warungin.git

## Support

If issues persist after deployment:
1. Verify Docker version: `docker --version` (should be 20.10+)
2. Verify Docker Compose version: `docker compose version` (should be 2.0+)
3. Check logs: `docker compose logs nginx -f` (follow mode)
4. Check kernel: `uname -a` (should support tmpfs uid/gid)
