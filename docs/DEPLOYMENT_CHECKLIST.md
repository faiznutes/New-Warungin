# Pre-Deployment Checklist & Deployment Guide

**Project**: Warungin POS v1.1.0
**Status**: Ready for Staging
**Last Updated**: 2024

---

## Pre-Staging Verification (Complete Before Deployment)

### Code Quality ✅
- [x] No console.log statements left in production code
- [x] All error handling implemented
- [x] No TypeScript errors
- [x] All middleware properly typed
- [x] No breaking changes to API contracts
- [x] No database schema changes required

### Documentation ✅
- [x] All fixes documented in detail
- [x] Configuration options documented
- [x] Test scenarios defined
- [x] Rollback procedures documented
- [x] README updated with new features
- [x] API changes documented

### Testing Readiness ⏳
- [ ] Unit tests written for new code
- [ ] Integration tests for all roles
- [ ] E2E tests for critical flows
- [ ] Performance benchmarks established
- [ ] Load testing completed
- [ ] Security testing results

### Deployment Files ✅
- [x] PRE_DEPLOYMENT_AUDIT.md - Initial findings
- [x] CRITICAL_FIXES_SUMMARY.md - Phase 1 details
- [x] HIGH_PRIORITY_FIXES.md - Phase 2 details
- [x] MEDIUM_PRIORITY_FIXES.md - Phase 3 details
- [x] PRE_DEPLOYMENT_IMPLEMENTATION_SUMMARY.md - Overall summary
- [x] This file - Deployment guide

---

## Deployment Phases

### Phase 1: Staging Deployment (Recommended Timeline: 1-2 days)

#### Pre-Deployment
```bash
# 1. Code verification
npm run lint                    # Check for style issues
npm run build                   # Build TypeScript
npm run test                    # Run unit tests (if available)

# 2. Backup current state
git tag -a v1.0.0-backup -m "Backup before audit fixes"
git push origin v1.0.0-backup

# 3. Create deployment branch
git checkout -b staging/audit-fixes
```

#### Deployment Steps
1. Deploy backend changes:
   - New middleware: `src/middlewares/supervisor-store-guard.ts`
   - Updated middleware: `src/middlewares/auth.ts`, `src/middlewares/require2fa.ts`
   - Updated routes: `order.routes.ts`, `store-shift.routes.ts`, `report.routes.ts`

2. Deploy frontend changes:
   - Updated stores: `client/src/stores/auth.ts`
   - Updated router: `client/src/router/index.ts`
   - Updated components: `client/src/components/StoreSelectorModal.vue`

3. Verify deployment:
   ```bash
   # Check logs for errors
   tail -f logs/app.log
   
   # Test basic endpoints
   curl http://staging.warungin.local/api/health
   curl http://staging.warungin.local/api/auth/me -H "Authorization: Bearer TOKEN"
   ```

#### Post-Deployment Verification
- [ ] Application starts without errors
- [ ] Login page loads correctly
- [ ] All authentication flows work
- [ ] Dashboard displays for all roles
- [ ] No TypeScript errors in console
- [ ] Network requests succeed

### Phase 2: Testing (2-4 hours per test cycle)

#### User Roles Testing Matrix

**SUPER_ADMIN**
- [ ] Login successful
- [ ] Can access all dashboards
- [ ] 2FA enforcement works
- [ ] Can view all supervisors/stores/users
- [ ] Addon bypass works correctly
- [ ] Shift status displays correctly

**ADMIN_TENANT**
- [ ] Login successful
- [ ] Can access dashboard
- [ ] 2FA enforcement works
- [ ] Store selector shows assigned store
- [ ] Can view team/users
- [ ] Reports and analytics accessible
- [ ] BUSINESS_ANALYTICS addon accessible (bypass)
- [ ] Other addons require purchase

**SUPERVISOR**
- [ ] Login successful
- [ ] Store selector shows assigned stores only
- [ ] Can only access assigned store data
- [ ] Cannot access other store orders/reports
- [ ] Shift status displays correctly
- [ ] Reports filtered by assigned stores

**CASHIER**
- [ ] Login successful
- [ ] Automatically assigned to correct store
- [ ] Can open/close shifts
- [ ] Shift status cached (verify with 5s test)
- [ ] Can view orders for assigned store only
- [ ] Cannot see other store data
- [ ] Page refresh shows correct shift state

**KITCHEN**
- [ ] Login successful
- [ ] Automatically assigned to correct store
- [ ] Can view orders for assigned store only
- [ ] Cannot see other store data
- [ ] Shift status displays correctly

#### Error Scenario Testing

**Authentication Errors**
- [ ] Invalid email/password → Clear error message
- [ ] Rate limited (429) → Shows retry countdown
- [ ] User inactive → Shows "Account inactive"
- [ ] 2FA required but not enabled → Shows setup prompt
- [ ] Store not assigned → Shows clear message

**Network/Timeout Errors**
- [ ] Slow network (>5s) → "Connection timeout" message
- [ ] API down → Shows service unavailable message
- [ ] Network reconnect → fetchMe doesn't duplicate
- [ ] Tab regains focus → Shift status reloads

**Store Selection**
- [ ] No stores assigned → Shows "No stores available"
- [ ] One store → Auto-selects
- [ ] Multiple stores → Shows selector
- [ ] Backdrop click when required → Doesn't dismiss
- [ ] Cancel button when required → Hidden

#### Performance Testing

**Shift Status Caching**
```bash
# Monitor DevTools Network tab
# 1. First route change → /cash-shift/current API call (200-500ms)
# 2. Immediate second change → Cached response (<1ms)
# 3. After 5s → New API call triggered
# Expected: ~90% reduction in shift API calls
```

**Request Deduplication**
```bash
# Simulate rapid reconnect
# 1. Open DevTools Network tab
# 2. Browser offline
# 3. Browser online (rapid reconnect)
# 4. Monitor /auth/me calls
# Expected: Single /auth/me request, no duplicates
```

**Multi-Tab Testing**
- [ ] Login in tab 1 → Tab 2 shows login state
- [ ] Logout in tab 1 → Tab 2 redirected to login
- [ ] Close shift in tab 1 → Tab 2 shows shift closed
- [ ] Change store in tab 1 → Tab 2 shows new store

### Phase 3: Production Deployment (1-2 weeks after staging approval)

#### Pre-Production Checklist
- [ ] Staging testing completed and approved
- [ ] All issues resolved
- [ ] Performance benchmarks verified
- [ ] Security audit passed
- [ ] User acceptance testing completed
- [ ] Rollback plan verified
- [ ] Maintenance window scheduled

#### Production Deployment
1. Schedule maintenance window (off-peak hours)
2. Notify users of maintenance
3. Deploy to production using same process as staging
4. Verify all functionality post-deployment
5. Monitor logs and error rates
6. Gradually enable features if using feature flags

#### Post-Production Monitoring
- [ ] Error rate normal (<1%)
- [ ] API response times normal
- [ ] No increase in 401/403 errors
- [ ] Supervisor access controls working
- [ ] 2FA enforcement working
- [ ] Caching effective (monitor API call counts)

---

## Rollback Procedures

### If Critical Issue Discovered During Staging

#### Immediate Actions
1. Stop routing traffic to broken deployment
2. Keep previous version running
3. Investigate issue
4. Document findings

#### Rollback Steps
```bash
# Option 1: Rollback to previous commit
git revert HEAD
git push origin

# Option 2: Rollback to tagged version
git checkout v1.0.0-backup
git push origin HEAD:main --force-with-lease

# Option 3: Manual rollback (if git not available)
# Restore files from backup:
git checkout v1.0.0-backup -- src/
git checkout v1.0.0-backup -- client/src/
```

#### Estimated Rollback Time
- **Database rollback**: None needed (no schema changes)
- **Code rollback**: 5-10 minutes
- **Verification**: 5-10 minutes
- **Total**: 15-30 minutes

#### Post-Rollback
1. Verify previous version works
2. Gather error logs from failed deployment
3. Root cause analysis
4. Fix and retest before next attempt

---

## Configuration & Environment Variables

### No Configuration Changes Required
All fixes use existing configuration and environment variables. No new environment variables need to be set.

### Optional Monitoring Configuration
```javascript
// Enable request logging to monitor deduplication
process.env.MONITOR_REQUEST_DEDUP = 'true';  // Logs fetchMe dedup activity
process.env.MONITOR_SHIFT_CACHE = 'true';    // Logs shift cache hits/misses
```

---

## File Checklist for Deployment

### Backend Files to Deploy
- [ ] `src/middlewares/require2fa.ts` - Modified
- [ ] `src/middlewares/auth.ts` - Modified
- [ ] `src/middlewares/supervisor-store-guard.ts` - NEW FILE
- [ ] `src/routes/order.routes.ts` - Modified
- [ ] `src/routes/store-shift.routes.ts` - Modified
- [ ] `src/routes/report.routes.ts` - Modified
- [ ] All other source files (verify no unintended changes)

### Frontend Files to Deploy
- [ ] `client/src/stores/auth.ts` - Modified
- [ ] `client/src/router/index.ts` - Modified
- [ ] `client/src/components/StoreSelectorModal.vue` - Modified
- [ ] Built assets in `client/dist/` - Rebuild required
- [ ] All other source files (verify no unintended changes)

### Configuration Files
- [ ] `package.json` - No changes (verify versions)
- [ ] `tsconfig.json` - No changes
- [ ] `.env*` files - No changes required

### Documentation (for reference)
- [ ] PRE_DEPLOYMENT_AUDIT.md - Reference
- [ ] CRITICAL_FIXES_SUMMARY.md - Reference
- [ ] HIGH_PRIORITY_FIXES.md - Reference
- [ ] MEDIUM_PRIORITY_FIXES.md - Reference
- [ ] PRE_DEPLOYMENT_IMPLEMENTATION_SUMMARY.md - Reference

---

## Post-Deployment Validation

### Automated Checks
```bash
# 1. Syntax validation
npm run lint                    # ESLint
npm run type-check              # TypeScript
npm run build                   # Build validation

# 2. API endpoint checks
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 3. Log analysis
grep -i error logs/app.log      # Check for errors
grep -i warning logs/app.log    # Check for warnings
```

### Manual Validation Checklist

**Authentication Flow**
- [ ] Valid login works
- [ ] Invalid login shows error
- [ ] 2FA required for admin
- [ ] Token stored correctly
- [ ] Logout clears session
- [ ] Page refresh maintains session

**Store Access**
- [ ] CASHIER assigned to store
- [ ] SUPERVISOR sees only assigned stores
- [ ] Cannot access unauthorized stores
- [ ] API returns 403 for unauthorized access

**Shift Status**
- [ ] Open shift displayed correctly
- [ ] Close shift updates immediately
- [ ] Page refresh shows correct state
- [ ] Cached for 5 seconds (monitor network tab)

**Error Handling**
- [ ] Network errors show appropriate message
- [ ] Timeout errors distinct from API errors
- [ ] Store selector timeout handled gracefully
- [ ] fetchMe dedup working (check console logs)

---

## Monitoring After Deployment

### Key Metrics to Monitor
1. **Error Rate**: Should remain <1%
2. **API Call Count**: Should decrease ~10-15% (shift cache)
3. **Response Time**: Should remain <200ms (p95)
4. **401/403 Errors**: Should not spike
5. **User Session Duration**: Should remain normal

### Logs to Watch
```bash
# Watch for errors
tail -f logs/app.log | grep ERROR

# Monitor auth attempts
tail -f logs/app.log | grep auth

# Monitor middleware execution
tail -f logs/app.log | grep supervisor-store-guard

# Monitor shift cache
tail -f logs/app.log | grep "SHIFT_CACHE"
```

### Alert Triggers
- Error rate > 5%
- Auth middleware 403 errors spike
- API response time > 500ms
- Memory usage > 80%
- Database connection errors

---

## SSH Server Local Deployment

### SSH Connection & Environment Setup

#### Connection Details
- **Host**: 192.168.1.101
- **User**: faiz
- **Password**: 123
- **Root Password**: 123
- **OS**: Debian 13
- **Target Directory**: /root/New-Warungin

#### Step 1: SSH Connection
```bash
# SSH ke server local
ssh faiz@192.168.1.101

# Ketika diminta password, masukkan: 123
```

#### Step 2: Switch to Root
```bash
# Perintah su - untuk masuk ke root
su -

# Ketika diminta password, masukkan: 123
# Anda sekarang di /root dengan akses root
```

#### Step 3: Navigate to Project
```bash
# Masuk ke directory project
cd /root/New-Warungin

# Verifikasi Anda di directory yang benar
pwd  # Output: /root/New-Warungin
ls -la  # Verifikasi file project ada
```

### Docker Verification & Setup

#### Step 4: Check Docker Installation
```bash
# Cek apakah Docker terinstall
docker --version

# Expected output: Docker version 20.10.X atau lebih tinggi
# Jika command not found, Docker belum terinstall
```

#### Step 5: Check Docker Status
```bash
# Cek apakah Docker daemon running
systemctl status docker

# Expected output: active (running)

# Jika Docker tidak running, jalankan:
systemctl start docker

# Verifikasi Docker running
docker ps  # Seharusnya tidak ada error
```

#### Step 6: Check Docker Compose
```bash
# Cek Docker Compose version
docker-compose --version

# Expected: Docker Compose version 1.29.X atau lebih tinggi
# Atau untuk Docker Compose v2:
docker compose --version
```

#### Step 7: Verify Docker Permissions
```bash
# Cek apakah root bisa menjalankan Docker
docker run hello-world

# Ini akan pull hello-world image dan menjalankannya
# Expected: "Hello from Docker!" message
```

### Full Deployment Procedure

#### Step 8: Pull Latest Code
```bash
# Jika ini repository git baru
git clone https://github.com/your-repo/New-Warungin.git /root/New-Warungin

# ATAU Jika sudah ada repository, update:
cd /root/New-Warungin
git pull origin main
```

#### Step 9: Install Dependencies (Backend)
```bash
cd /root/New-Warungin

# Install dependencies
npm install

# Atau jika menggunakan yarn:
yarn install

# Verifikasi berhasil
npm list | head -20  # Lihat beberapa dependencies
```

#### Step 10: Install Dependencies (Frontend)
```bash
# Masuk ke client directory
cd /root/New-Warungin/client

# Install dependencies
npm install

# Atau jika menggunakan yarn:
yarn install

# Kembali ke root project
cd /root/New-Warungin
```

#### Step 11: Build Backend
```bash
# Build TypeScript backend
npm run build

# Expected output:
# - ✔ Successfully compiled X files
# - No errors

# Verifikasi build artifacts
ls -la dist/  # Seharusnya ada folder ini dengan compiled files
```

#### Step 12: Build Frontend
```bash
# Masuk ke client directory
cd /root/New-Warungin/client

# Build dengan Vite
npm run build

# Expected output:
# - ✔ built in Xs
# - dist/index.html (main file)
# - dist/assets/* (JS, CSS files)

# Verifikasi build artifacts
ls -la dist/  # Seharusnya ada index.html dan assets folder

# Kembali ke root
cd /root/New-Warungin
```

#### Step 13: Build Docker Images
```bash
# Build backend Docker image
docker build -f Dockerfile.backend -t warungin-backend:staging .

# Expected output:
# - Successfully tagged warungin-backend:staging
# - No build errors

# Build client Docker image
docker build -f client/Dockerfile -t warungin-client:staging ./client

# Expected output:
# - Successfully tagged warungin-client:staging
# - No build errors

# Verifikasi images
docker images | grep warungin
# Output: 
# warungin-backend  staging  XXXXX  XXX  MB
# warungin-client   staging  XXXXX  XXX  MB
```

#### Step 14: Configure Environment
```bash
# Copy environment example
cp env.example .env

# Edit .env dengan nano atau vi
nano .env

# Ubah konfigurasi sesuai kebutuhan:
# DATABASE_URL="..."
# JWT_SECRET="..."
# API_URL="http://localhost:3000"
# CLIENT_URL="http://localhost:5173"

# Tekan Ctrl+X, Y, Enter untuk save (jika menggunakan nano)
```

#### Step 15: Start Docker Compose
```bash
# Pastikan di root New-Warungin directory
cd /root/New-Warungin

# Start services dengan docker-compose
docker-compose up -d

# Verifikasi services running
docker-compose ps

# Expected output:
# NAME              SERVICE    STATUS
# warungin-db       postgres   Up X seconds
# warungin-api      api        Up X seconds
# warungin-web      web        Up X seconds
# warungin-nginx    nginx      Up X seconds
```

#### Step 16: Verify Deployment
```bash
# Check logs untuk errors
docker-compose logs api      # Backend logs
docker-compose logs web      # Frontend logs
docker-compose logs nginx    # Nginx logs

# Test API endpoint
curl http://localhost:3000/api/health

# Expected: {"status":"ok"} atau similar

# Test Frontend
curl http://localhost/  # Seharusnya return HTML (jika nginx proxy)

# Atau buka di browser: http://192.168.1.101
```

### Docker Troubleshooting

#### Issue: Docker daemon not running
```bash
# Start Docker
systemctl start docker

# Enable auto-start
systemctl enable docker

# Verifikasi
systemctl status docker
```

#### Issue: Permission denied error
```bash
# Anda sudah di root (su -), tidak ada issue permission
# Tapi jika ada issue, restart Docker:
systemctl restart docker
```

#### Issue: Image build failed
```bash
# Clear Docker cache
docker system prune -a

# Retry build
docker build -f Dockerfile.backend -t warungin-backend:staging .

# Jika masih gagal, cek:
# 1. Dockerfile syntax (docker build -f Dockerfile.backend --progress=plain .)
# 2. Missing dependencies (npm install sebelum build)
# 3. Disk space (df -h)
```

#### Issue: Container tidak start
```bash
# Check logs
docker-compose logs api

# Verifikasi port tidak ada yang conflict
netstat -tlnp | grep 3000
netstat -tlnp | grep 80

# Kill existing container jika perlu
docker-compose down

# Start lagi
docker-compose up -d
```

#### Issue: Database connection error
```bash
# Verify database container running
docker-compose logs postgres

# Check database connection
docker-compose exec api npm run db:migrate

# Reset database jika perlu
docker-compose exec postgres psql -U postgres -c "DROP DATABASE warungin; CREATE DATABASE warungin;"
```

### Maintenance Commands

#### View Logs
```bash
# Real-time logs
docker-compose logs -f api     # Follow backend logs
docker-compose logs -f web     # Follow frontend logs

# Last 50 lines
docker-compose logs --tail=50 api

# Specific time range
docker-compose logs --since 10m api  # Last 10 minutes
```

#### Stop/Start Services
```bash
# Stop services
docker-compose stop

# Start services
docker-compose start

# Restart services
docker-compose restart

# Stop and remove containers
docker-compose down
```

#### Update Code & Rebuild
```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose down
npm install
npm run build
cd client && npm install && npm run build
cd ..
docker build -f Dockerfile.backend -t warungin-backend:staging .
docker build -f client/Dockerfile -t warungin-client:staging ./client

# Start again
docker-compose up -d
```

---

## Support & Troubleshooting

### Common Issues & Solutions

**Issue**: "Access Denied" for supervisor accessing store data
- **Cause**: Supervisor permissions not in database
- **Solution**: Check `supervisorPermissions` table for `allowedStoreIds`
- **Verification**: `SELECT * FROM supervisor_permissions WHERE userId = ?`

**Issue**: Shift status not loading after page refresh
- **Cause**: Network timeout or API failure
- **Solution**: Check `/cash-shift/current` endpoint, verify token valid
- **Logs**: Look for "[Auth] Could not load shift status" in logs

**Issue**: Store selector timeout (>5 seconds)
- **Cause**: Slow network or overloaded API
- **Solution**: Check API performance, verify database queries
- **User Impact**: User sees "Connection timeout" message

**Issue**: Multiple `/auth/me` calls instead of deduplicated
- **Cause**: Concurrent requests not properly deduplicated
- **Solution**: Verify `pendingFetchMePromise` is set correctly
- **Logs**: Should see "[Auth] FetchMe already in progress"

**Issue**: 2FA bypass still possible
- **Cause**: require2fa middleware not applied
- **Solution**: Verify middleware in `order.routes.ts` or appropriate routes
- **Verification**: SUPER_ADMIN login should prompt for 2FA

### Getting Help
1. Check logs: `logs/app.log` and `logs/error.log`
2. Review documentation: `HIGH_PRIORITY_FIXES.md`, etc.
3. Verify file changes: `git diff v1.0.0 HEAD`
4. Run tests: `npm run test`
5. Check browser console: DevTools → Console tab

---

## Sign-Off

### Deployment Team
- [ ] Code review completed by: _______________
- [ ] Testing completed by: _______________
- [ ] Deployment approved by: _______________
- [ ] Date: _______________

### Production Sign-Off
- [ ] Staging testing passed
- [ ] Performance verified
- [ ] Security audit passed
- [ ] User acceptance testing approved
- [ ] Production deployment approved by: _______________
- [ ] Date: _______________

---

## Version Information

| Component | Version | Status |
|-----------|---------|--------|
| Warungin POS | 1.1.0 | Ready |
| Node.js | 16+ | Required |
| Vue | 3.3+ | Required |
| Pinia | 2.1+ | Required |
| TypeScript | 5.0+ | Required |

---

**Document Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Use
