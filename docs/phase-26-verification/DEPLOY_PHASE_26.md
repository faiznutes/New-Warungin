# Phase 26 Production Deployment Guide

## 🚀 Quick Deployment (5-10 minutes)

### Prerequisites
- Server: 192.168.1.101
- User: faiz (with sudo/su privileges)
- Root password: 123
- Docker running on server

### Step 1: Connect to Server via SSH
```bash
ssh faiz@192.168.1.101
# When prompted for password, enter faiz's password
```

### Step 2: Switch to Root
```bash
su - root
# When prompted for password, enter: 123
```

### Step 3: Navigate to Project
```bash
cd /root/New-Warungin
```

### Step 4: Pull Latest Changes
```bash
git pull origin main
# Should show Phase 26 fixes committed with hash 0891b51
```

### Step 5: Rebuild Docker Images
```bash
# Build with no cache for fresh build
docker-compose build --no-cache

# This will:
# - Rebuild frontend with fixed code
# - Rebuild backend (no changes but fresh build)
# - Rebuild nginx configuration
```

### Step 6: Deploy
```bash
# Stop old containers
docker-compose down

# Start fresh containers
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30

# Check all services are running
docker-compose ps

# Should show:
# - warungin-frontend: Up
# - warungin-backend: Up  
# - warungin-postgres: Up
# - warungin-redis: Up
# - nginx: Up
# - (+ other monitoring services)
```

### Step 7: Verify Health
```bash
# Check backend health
curl -s http://localhost:3001/api/health | jq .

# Check frontend is served
curl -s http://localhost:80/index.html | head -10

# Check no errors in logs
docker-compose logs backend | tail -20
docker-compose logs frontend | tail -20
```

### Step 8: Smoke Test (Manual)
1. Open browser: http://192.168.1.101
2. Login as SUPER_ADMIN (email: admin@warungin.com)
3. Navigate to Tenants page
4. Click on a tenant
5. **VERIFY THESE FIXES:**
   - ✅ "Daftar Toko" (Stores) tab exists
   - ✅ "Addons" tab exists
   - ❌ "Poin" (Points) tab should NOT exist
   - ✅ Click "Tambah Toko" - modal shows form with 3 fields (name, address, phone)
   - ✅ Create a new store - should succeed with success message
   - ✅ Click "Tambah Addon" - form should be functional

---

## 📋 What Changed in Phase 26

### Critical Bugs Fixed
1. **auth.ts syntax error** - Missing closing brace in fetchMe() function
2. **Addon endpoints** - Changed from `/tenants/{id}/addons` to `/addons/subscribe`
3. **Store endpoints** - Verified `/outlets` endpoints work correctly
4. **Points removal** - Removed non-functional Points tab (no backend support)

### Files Modified
- `client/src/views/tenants/TenantDetail.vue` - All tab and form fixes
- `client/src/stores/auth.ts` - Fixed syntax error
- Frontend built successfully with 1568 modules transformed

### Build Validation
✅ All 1568 modules compiled successfully
✅ No compilation errors
✅ No runtime syntax errors
✅ Changes are backward compatible

---

## 🆘 Troubleshooting

### If Docker Build Fails
```bash
# Clean up and try again
docker system prune -a --force
docker-compose build --no-cache
```

### If Backend Won't Start
```bash
# Check backend logs
docker-compose logs backend -f

# Common issues:
# - Database not ready: wait 10 seconds and try again
# - Port 3001 already in use: docker-compose down && docker-compose up -d
```

### If Frontend Shows Old Code
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a --force
docker-compose build --no-cache
docker-compose up -d
```

### Quick Rollback (if needed)
```bash
git reset --hard HEAD~1
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## ✅ Deployment Checklist

- [ ] Connected to server as root
- [ ] Pulled latest code (git pull origin main)
- [ ] Built Docker images (docker-compose build --no-cache)
- [ ] Started containers (docker-compose up -d)
- [ ] All services running (docker-compose ps shows all Up)
- [ ] Backend health check passed (curl /api/health)
- [ ] Frontend loads (curl /index.html)
- [ ] No errors in logs
- [ ] Logged in to app as SUPER_ADMIN
- [ ] Verified Tenants page loads
- [ ] Verified Store creation works
- [ ] Verified Addon tab exists
- [ ] Verified Points tab does NOT exist
- [ ] All UI changes working correctly

---

## 🎯 Expected Results After Deployment

### ✅ Working Features
- Store creation modal shows form (not placeholder)
- Addon management functional
- All store CRUD operations use correct `/outlets` endpoint
- User management works
- Subscription management works

### ✅ Removed Features
- Points tab completely removed from UI
- All points-related code removed
- Points functionality disabled to prevent errors

### ✅ Performance
- No degradation from Phase 6.1
- Same 8 Docker services running
- Same response times
- All health checks passing

---

## 📞 Support

If any issues arise during deployment:
1. Check logs: `docker-compose logs -f`
2. Verify git: `git log --oneline | head -5`
3. Check Docker: `docker-compose ps`
4. Test endpoints: `curl http://localhost:3001/api/health`

Commit hash: **0891b51**
Date: December 31, 2025
Phase: **26 - Bug Fixes & Production Ready**
