# Docker-Compose tmpfs Fix - Server Deployment Instructions

## Summary of Changes

The docker-compose.yml has been updated to fix nginx permission denied errors by correcting tmpfs mount permissions:

### Changes Made:
1. **Backend service tmpfs** (lines 102-104):
   - Added `mode=1777` to `/tmp` mount
   - Added `mode=0755,uid=1001,gid=1001` to `/app/storage/backups` mount

2. **Frontend service tmpfs** (lines 139-141):
   - Added `mode=1777` to `/tmp` mount
   - Corrected `/var/cache/nginx` to use `1002:1002` (frontend nginx-user)
   - Fixed `/var/run` to use `1002:1002` (was incorrectly duplicating `101:101`)

3. **Nginx reverse proxy tmpfs** (lines 180-183):
   - Added `mode=1777` to `/tmp` mount
   - Corrected `/var/cache/nginx` to use `101:101` (nginx user)
   - Fixed `/var/run` to use `101:101` (removed duplicate mode specification)
   - Added `/var/log/nginx` with proper permissions `mode=0755,uid=101,gid=101`

## Server Deployment Steps

Execute these commands on the production server (192.168.1.101):

```bash
# 1. SSH to server
ssh faiz@192.168.1.101

# 2. Navigate to project directory
cd ~/New-Warungin

# 3. Pull the latest changes
git pull origin main

# 4. Stop running containers
docker compose down

# 5. Remove old images to force rebuild (optional, but recommended)
docker rmi warungin-nginx new-warungin-frontend new-warungin-backend 2>/dev/null || true

# 6. Start services with the fixed docker-compose.yml
docker compose up -d

# 7. Verify services are running
docker compose ps

# 8. Check nginx logs to confirm no permission errors
docker compose logs nginx | head -50

# 9. Verify health check
docker compose ps | grep nginx
```

## Expected Result

After deploying these changes:
- ✅ nginx should start successfully and become healthy
- ✅ No more "Permission denied" errors on `/var/cache/nginx/client_temp` or `/var/log/nginx/error.log`
- ✅ All 11 services should be running and healthy
- ✅ https://pos.faiznute.site/ should resolve without 502 Bad Gateway

## Troubleshooting

If issues persist:

1. Check if tmpfs mounts are properly applied:
   ```bash
   docker compose exec nginx ls -la /var/cache/nginx/
   docker compose exec nginx ls -la /var/run/
   docker compose exec nginx ls -la /var/log/nginx/
   ```

2. Verify nginx user permissions:
   ```bash
   docker compose exec nginx id
   ```
   Should show: `uid=101(nginx) gid=101(nginx) groups=101(nginx)`

3. Check nginx error logs directly:
   ```bash
   docker compose logs nginx -f
   ```

4. If permission errors still occur, check Docker version:
   ```bash
   docker --version
   docker compose version
   ```
   Ensure Docker Compose v2+ is being used (tmpfs uid/gid support was added in v2)

## Git Commit Reference

- Commit: `b41eaa615c1917976ccf0b46fc5dc0b300f30b87`
- Message: "Fix: Add proper tmpfs mount permissions (uid/gid/mode) for nginx user to fix permission denied errors"
- Changes file: `docker-compose.yml`
- Repository: https://github.com/faiznutes/New-Warungin.git (main branch)
