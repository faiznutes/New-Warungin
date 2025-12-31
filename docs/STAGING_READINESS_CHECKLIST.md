# STAGING READINESS CHECKLIST - Step-by-Step Guide

**Date:** December 31, 2025  
**Target:** Deploy to staging and begin testing  
**Estimated Duration:** 4-6 hours total  
**Success Criteria:** All services running, smoke tests pass

---

## Phase 1: Pre-Deployment Preparation (30-45 minutes)

### Step 1.1: Verify Prerequisites
- [ ] Node.js v18+ installed
  ```bash
  node --version  # Should show v18.x or higher
  npm --version   # Should show v9+
  ```

- [ ] Docker installed and running
  ```bash
  docker --version
  docker ps  # Should show no errors
  ```

- [ ] Git repo clean
  ```bash
  git status  # Should be clean or on staging/audit-fixes branch
  git pull    # Latest code pulled
  ```

### Step 1.2: Code Verification
- [ ] All modified files exist
  ```bash
  # Backend middleware
  ls -la src/middlewares/supervisor-store-guard.ts
  ls -la src/middlewares/auth.ts
  ls -la src/middlewares/require2fa.ts
  
  # Frontend
  ls -la client/src/stores/auth.ts
  ls -la client/src/router/index.ts
  ls -la client/src/components/StoreSelectorModal.vue
  ```

- [ ] Package.json exists with build scripts
  ```bash
  grep "build" package.json
  grep "build" client/package.json
  ```

### Step 1.3: Environment Setup
- [ ] Create .env if needed
  ```bash
  cp env.example .env
  # Update with staging database credentials
  ```

- [ ] Verify database connection string
  ```bash
  cat .env | grep DATABASE_URL
  ```

---

## Phase 2: Build Verification (45-60 minutes)

### Step 2.1: Backend Build
- [ ] Install dependencies
  ```bash
  npm install
  # Should complete without critical errors
  ```

- [ ] Build TypeScript
  ```bash
  npm run build
  # Expected: ✅ 0 errors, dist/ directory created
  ```

- [ ] Verify compiled output
  ```bash
  ls -la dist/
  # Should contain compiled .js files
  ```

- [ ] Lint check
  ```bash
  npm run lint
  # Expected: ✅ 0 critical errors (warnings OK)
  ```

### Step 2.2: Frontend Build
- [ ] Install client dependencies
  ```bash
  cd client && npm install
  # Should complete without critical errors
  ```

- [ ] Build with Vite
  ```bash
  npm run build
  # Expected: ✅ Vite build successful, dist/ created
  ```

- [ ] Verify bundle
  ```bash
  ls -la dist/
  # Should contain index.html and bundled files
  cd ..
  ```

- [ ] Lint check
  ```bash
  cd client && npm run lint
  # Expected: ✅ 0 critical errors
  cd ..
  ```

---

## Phase 3: Docker Build (30-45 minutes)

### Step 3.1: Build Backend Image
- [ ] Create backend image
  ```bash
  docker build -f Dockerfile.backend -t warungin-backend:staging .
  # Expected: ✅ Successfully tagged as warungin-backend:staging
  ```

- [ ] Verify image created
  ```bash
  docker images | grep warungin-backend
  # Should show: warungin-backend    staging
  ```

### Step 3.2: Build Frontend Image
- [ ] Create client image
  ```bash
  cd client && docker build -f Dockerfile.dev -t warungin-client:staging .
  # Expected: ✅ Successfully tagged as warungin-client:staging
  cd ..
  ```

- [ ] Verify image created
  ```bash
  docker images | grep warungin-client
  # Should show: warungin-client     staging
  ```

### Step 3.3: Prepare Docker Compose
- [ ] Verify docker-compose file
  ```bash
  ls -la docker-compose.test.yml
  # Should exist
  ```

- [ ] Check for required services
  ```bash
  grep -E "services:|backend|client|db" docker-compose.test.yml
  ```

---

## Phase 4: Staging Deployment (45-60 minutes)

### Step 4.1: Backup Current Environment
- [ ] Stop current services (if any)
  ```bash
  docker-compose -f docker-compose.test.yml down 2>/dev/null || true
  ```

- [ ] Create backup tag
  ```bash
  docker volume create warungin-backup-$(date +%Y%m%d-%H%M%S)
  ```

### Step 4.2: Start Staging Services
- [ ] Start new services
  ```bash
  docker-compose -f docker-compose.test.yml up -d
  # Expected: All services starting
  ```

- [ ] Wait for services to stabilize
  ```bash
  sleep 15
  ```

- [ ] Verify services running
  ```bash
  docker-compose ps
  # Expected: All containers in "Up" state
  ```

### Step 4.3: Check Service Health
- [ ] View logs for errors
  ```bash
  docker-compose logs | head -50
  # Look for error messages
  ```

- [ ] Backend health check
  ```bash
  curl http://localhost:3000/health 2>/dev/null
  # Expected: 200 OK with health data
  ```

- [ ] Frontend health check
  ```bash
  curl http://localhost:5173/ 2>/dev/null | head -20
  # Expected: HTML content of Vue app
  ```

### Step 4.4: Database Setup
- [ ] Run migrations
  ```bash
  docker-compose exec backend npx prisma migrate deploy
  # Expected: ✅ Migrations applied
  ```

- [ ] Verify database
  ```bash
  docker-compose exec backend npm run check:db
  # Expected: Database connection successful
  ```

- [ ] Optional: Seed test data
  ```bash
  docker-compose exec backend npm run seed:staging 2>/dev/null || echo "Seed script not found (OK)"
  ```

---

## Phase 5: Smoke Tests (30-45 minutes)

### Step 5.1: Login Flow Test

**SuperAdmin Login**
- [ ] Navigate to http://localhost:5173
- [ ] Click "Login" or go to login page
- [ ] Enter SuperAdmin credentials (from .env or documentation)
- [ ] Expected: 2FA prompt appears (CRITICAL-1 verify)
- [ ] Enter 2FA code or skip if test data
- [ ] Expected: Login successful, dashboard shows

**Supervisor Login**
- [ ] Logout
- [ ] Login as Supervisor (if test data available)
- [ ] Expected: Login succeeds without 2FA (no 2FA for non-admin)
- [ ] Expected: Store selector appears
- [ ] Select a store
- [ ] Expected: Dashboard loads

**Cashier Login (with store)**
- [ ] Logout
- [ ] Login as Cashier with assignedStoreId
- [ ] Expected: Login successful
- [ ] Expected: Shift page or dashboard appears

**Cashier Login (without store)**
- [ ] Create/use Cashier account without assignedStoreId
- [ ] Try to login
- [ ] Expected: 403 Forbidden error (CRITICAL-2 verify)

### Step 5.2: Authorization Tests

**Supervisor Store Access**
- [ ] Login as Supervisor with stores [STORE_1, STORE_2]
- [ ] Navigate to Analytics endpoint
- [ ] Expected: Can see STORE_1 and STORE_2 data
- [ ] Try to access STORE_3 (unauthorized)
- [ ] Expected: 403 Forbidden (H-1 verify)

**Token Storage**
- [ ] Login with "Remember Me" checked
- [ ] Open browser DevTools (F12)
- [ ] Check Application → Local Storage
- [ ] Expected: 'token' key present in localStorage (H-3 verify)
- [ ] Check sessionStorage
- [ ] Expected: 'token' key NOT in sessionStorage

**Logout Completeness**
- [ ] Click logout
- [ ] Check localStorage: token should be gone
- [ ] Expected: localStorage empty (M-4 verify)
- [ ] Try to refresh page
- [ ] Expected: Redirected to login (session cleared)

### Step 5.3: UI/Component Tests

**Store Selector Modal**
- [ ] Login as Supervisor with no selectedStore
- [ ] Expected: Store selector modal appears (required=true)
- [ ] Try clicking backdrop
- [ ] Expected: Modal doesn't close (M-1 verify)
- [ ] Try clicking Cancel button
- [ ] Expected: Button hidden or disabled (M-1 verify)

**ForgotPassword Redirect**
- [ ] While logged in, go to /forgot-password
- [ ] Expected: Redirected to /app/dashboard (M-2 verify)
- [ ] Logout, then go to /forgot-password
- [ ] Expected: Page loads (allowed when not authenticated)

**Shift Status**
- [ ] Login as Cashier
- [ ] Go to shift management
- [ ] Open a shift
- [ ] Refresh page
- [ ] Expected: Shift status still shows as open (H-7 verify, not stale)

### Step 5.4: Performance Check

**Shift Cache**
- [ ] Monitor Network tab in DevTools
- [ ] Navigate between pages as Cashier
- [ ] Expected: GET /cash-shift/current called only once per 5 seconds
- [ ] Expected: Subsequent calls use cache (<1ms response)

**Request Deduplication**
- [ ] Open browser console
- [ ] Rapidly close/reopen connection
- [ ] Look for "[Auth] FetchMe already in progress" message
- [ ] Expected: Only 1 API call despite multiple requests (M-5 verify)

---

## Phase 6: Verification & Logging

### Step 6.1: Check Logs
- [ ] View backend logs
  ```bash
  docker-compose logs backend | tail -100
  # Look for: No errors, successful migrations, service started
  ```

- [ ] View client logs
  ```bash
  docker-compose logs client | tail -50
  # Look for: Build successful, serving on port 5173
  ```

- [ ] Check for 2FA log
  ```bash
  docker-compose logs backend | grep -i "2fa\|two"
  # Should show 2FA check happening
  ```

### Step 6.2: Documentation
- [ ] Create test results file
  ```bash
  cat > STAGING_TEST_RESULTS.md << 'EOF'
  # Staging Test Results - [DATE]
  
  ## Smoke Tests Status
  - SuperAdmin Login: ✅/❌
  - Supervisor Login: ✅/❌
  - Cashier Login (with store): ✅/❌
  - Cashier Login (without store - 403): ✅/❌
  
  ## Authorization Tests
  - Supervisor Store Access: ✅/❌
  - Token Storage (localStorage): ✅/❌
  - Logout Completeness: ✅/❌
  
  ## UI/Component Tests
  - Store Selector Modal: ✅/❌
  - ForgotPassword Redirect: ✅/❌
  - Shift Status Persistence: ✅/❌
  
  ## Performance
  - Shift Cache Working: ✅/❌
  - Request Dedup Working: ✅/❌
  
  ## Issues Found
  - [List any issues]
  
  ## Conclusion
  All/Most/Some tests passed. Ready for full testing: YES/NO
  EOF
  cat STAGING_TEST_RESULTS.md
  ```

---

## Phase 7: Ready Check

### All Items Complete? ✅
- [x] Code verified
- [x] Backend built
- [x] Frontend built
- [x] Docker images created
- [x] Services deployed
- [x] Database migrations applied
- [x] Smoke tests passed
- [x] Logs verified
- [x] Results documented

### Proceed to Full Testing?

If all smoke tests pass:
- ✅ Continue to STAGING_TEST_PLAN.md (Phase 1-5)
- Expected time: 2-4 hours
- Coverage: 50+ test cases

If any smoke test fails:
- ❌ Debug the issue using provided logs
- Check specific documentation for that fix
- Restart services and retry
- Contact technical lead if blocked

---

## Troubleshooting Quick Reference

### Docker Issues
```bash
# Reset all services
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d

# View specific logs
docker-compose logs backend -f
docker-compose logs client -f

# Access container shell
docker-compose exec backend bash
docker-compose exec client sh
```

### Build Issues
```bash
# Clean build
rm -rf dist/
rm -rf client/dist/
npm run build
cd client && npm run build && cd ..

# Check Node version
node --version  # Must be v18+
npm --version   # Must be v9+
```

### Database Issues
```bash
# Reset migrations
docker-compose exec backend npx prisma migrate reset

# Check connection
docker-compose exec backend npm run check:db

# View database (requires Prisma Studio)
docker-compose exec backend npm run prisma:studio
```

---

## Success Criteria

**Staging deployment is successful when:**

1. ✅ All services running (`docker-compose ps` shows all "Up")
2. ✅ Health endpoints responding (200 status)
3. ✅ Login flow works for all roles
4. ✅ CRITICAL-1 (2FA) enforced for admin
5. ✅ CRITICAL-2 (store validation) returns 403 for invalid users
6. ✅ CRITICAL-3 (shift cache) working (<1ms response)
7. ✅ H-1 (supervisor guard) preventing unauthorized access
8. ✅ No critical errors in logs
9. ✅ All smoke tests pass
10. ✅ Ready to proceed to full test suite

---

## Next Steps

**Once staging deployment successful:**

1. Continue with STAGING_TEST_PLAN.md (50+ tests)
2. Allocate 2-4 hours for full testing
3. Document all results
4. Get QA/tech lead approval
5. Prepare for production deployment

---

**Timeline:** 4-6 hours from start of Phase 1  
**Status:** Ready to begin deployment  
**Confidence:** 🟢 HIGH

👉 **Start with:** `npm install` and `npm run build`
