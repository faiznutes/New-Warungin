# 🎯 EXECUTION GUIDE - RUN THIS NOW

**Status:** PHASE 3 - BUILD & DOCKER SETUP  
**Time Now:** December 31, 2025  
**Expected Duration:** 45 minutes - 1.5 hours  
**Expected Outcome:** Docker images ready for staging

---

## STEP-BY-STEP EXECUTION

### STEP 1: Verify Prerequisites (2 minutes)

**Copy and paste these commands in your terminal:**

```bash
# Check Node version
node --version

# Check npm version  
npm --version

# Check git status
git status

# Check Docker
docker --version

# Check Docker is running
docker ps
```

**Expected Output:**
```
v18.x.x (or higher)
9.x.x (or higher)
On branch main (or staging/audit-fixes)
Docker version 20.x.x (or higher)
CONTAINER ID... (empty list OK)
```

✅ **If all commands work without errors:** Continue to Step 2

❌ **If any command fails:** Stop and fix the issue

---

### STEP 2: Backend Build (15-20 minutes)

**Run these commands ONE AT A TIME in your project root:**

```bash
# Move to backend directory (if not already there)
pwd  # Should show: /path/to/New-Warungin

# Install dependencies
npm install
```

**⏳ Wait for npm install to complete. Expected: 2-5 minutes**

```bash
# Build TypeScript
npm run build
```

**⏳ Wait for TypeScript compilation. Expected: 1-2 minutes**

**Check output for:**
- ✅ "Successfully compiled" or similar
- ❌ "error TS" or red text = PROBLEM

```bash
# Run linter
npm run lint
```

**Check output:**
- ✅ "0 errors" or no error messages
- ⚠️ Warnings are OK
- ❌ "error" messages = PROBLEM

**Verify build artifacts created:**

```bash
# Check if dist/ folder created
ls -la dist/ | head -10
```

**Expected:** Should show compiled .js files

✅ **If all 3 commands succeed:** Continue to Step 3

❌ **If any command fails:** 
- Check the error message
- Look in BUILD_VERIFICATION.md for that error
- Ask for help

---

### STEP 3: Frontend Build (10-15 minutes)

**Run these commands:**

```bash
# Move to client directory
cd client

# Install dependencies
npm install
```

**⏳ Wait for npm install. Expected: 2-5 minutes**

```bash
# Build with Vite
npm run build
```

**⏳ Wait for Vite build. Expected: 1-2 minutes**

**Check output for:**
- ✅ "built in X ms" or similar
- ✅ Should mention dist/ folder size
- ❌ "error" or red text = PROBLEM

```bash
# Run linter
npm run lint
```

**Check output:**
- ✅ No "error" messages (warnings OK)

**Verify build artifacts:**

```bash
# Check if dist/ folder created with files
ls -la dist/ | head -10
```

**Expected:** Should show index.html and bundled files

```bash
# Go back to root
cd ..
```

✅ **If both build and lint succeed:** Continue to Step 4

❌ **If any command fails:** Stop and debug

---

### STEP 4: Build Backend Docker Image (5-10 minutes)

**Run this command:**

```bash
# Build backend image
docker build -f Dockerfile.backend -t warungin-backend:staging .
```

**⏳ This takes 5-10 minutes. Watch the output for:**
- ✅ "Successfully built" or "Successfully tagged"
- ❌ "error" or "failed" = PROBLEM

**Verify image created:**

```bash
# List Docker images
docker images | grep warungin-backend

# Should show: warungin-backend    staging    <image-id>
```

✅ **If image created successfully:** Continue to Step 5

❌ **If Docker build failed:**
- Check error message
- Verify Dockerfile.backend exists
- Try: `docker system prune` and rebuild

---

### STEP 5: Build Frontend Docker Image (5-10 minutes)

**Run these commands:**

```bash
# Move to client directory
cd client

# Build frontend image
docker build -f Dockerfile.dev -t warungin-client:staging .
```

**⏳ This takes 5-10 minutes. Watch for:**
- ✅ "Successfully tagged"
- ❌ "error" or "failed" = PROBLEM

**Verify image created:**

```bash
# Go back to root
cd ..

# List Docker images
docker images | grep warungin-client

# Should show: warungin-client     staging    <image-id>
```

✅ **If image created:** Continue to Step 6

❌ **If Docker build failed:**
- Check client/Dockerfile.dev exists
- Verify npm run build worked in Step 3

---

### STEP 6: Verify Both Images Ready

**Run this command:**

```bash
# List both images together
docker images | grep staging
```

**Expected output:**
```
warungin-backend    staging    abc123...
warungin-client     staging    def456...
```

✅ **If you see BOTH images with "staging" tag:** SUCCESS! 🎉

❌ **If one or both missing:**
- Check Step 4 and Step 5 output
- Rebuild the missing image

---

## STEP 7: Pre-Staging Check (3 minutes)

**Before deploying to staging, verify:**

```bash
# Check docker-compose.test.yml exists
ls -la docker-compose.test.yml

# Check .env exists or create one
ls -la .env || cp env.example .env

# Verify database variables in .env
cat .env | grep DATABASE_URL
# Should show database connection string
```

---

## 🎉 ALL BUILD STEPS COMPLETE!

### What You've Done:
- ✅ Installed backend dependencies
- ✅ Compiled TypeScript backend
- ✅ Linted backend code
- ✅ Installed frontend dependencies  
- ✅ Built Vite frontend
- ✅ Linted frontend code
- ✅ Created backend Docker image
- ✅ Created frontend Docker image

### Current Status:
```
✅ Backend Code: Compiled & Ready
✅ Frontend Code: Bundled & Ready  
✅ Docker Images: Built & Ready
✅ Next Step: Staging Deployment
```

---

## NEXT PHASE: STAGING DEPLOYMENT (1-2 hours)

**You are NOW ready for:**

1. Stop any running containers
2. Start new staging environment
3. Run database migrations
4. Run smoke tests
5. Run full test suite

**Instructions in:** `STAGING_READINESS_CHECKLIST.md` Phase 4

---

## IF SOMETHING WENT WRONG 🔧

### Build Error - Check These:
```bash
# Clean and rebuild
rm -rf dist/
rm -rf client/dist/
npm install && npm run build
cd client && npm install && npm run build && cd ..
```

### Docker Error - Try This:
```bash
# Clean Docker
docker system prune -a

# Rebuild images
docker build -f Dockerfile.backend -t warungin-backend:staging .
cd client && docker build -f Dockerfile.dev -t warungin-client:staging . && cd ..
```

### Still Stuck?
1. Check BUILD_VERIFICATION.md for your error
2. Check STAGING_READINESS_CHECKLIST.md Troubleshooting section
3. Contact technical lead with error message

---

## QUICK REFERENCE - All Commands

**One-liner (copy & paste to run all builds):**
```bash
npm install && npm run build && npm run lint && cd client && npm install && npm run build && npm run lint && cd .. && docker build -f Dockerfile.backend -t warungin-backend:staging . && cd client && docker build -f Dockerfile.dev -t warungin-client:staging . && cd .. && docker images | grep staging
```

**Or run in phases:**

**Phase 1 - Backend:**
```bash
npm install && npm run build && npm run lint
```

**Phase 2 - Frontend:**
```bash
cd client && npm install && npm run build && npm run lint && cd ..
```

**Phase 3 - Docker Backend:**
```bash
docker build -f Dockerfile.backend -t warungin-backend:staging .
```

**Phase 4 - Docker Frontend:**
```bash
cd client && docker build -f Dockerfile.dev -t warungin-client:staging . && cd ..
```

**Verify:**
```bash
docker images | grep staging
```

---

## TIME ESTIMATE

| Phase | Time | What Happens |
|-------|------|-------------|
| Prerequisites | 2 min | Verify tools installed |
| Backend Build | 15-20 min | TypeScript compilation |
| Frontend Build | 10-15 min | Vite bundling |
| Docker Backend | 5-10 min | Image creation |
| Docker Frontend | 5-10 min | Image creation |
| Verification | 3 min | Confirm images exist |
| **Total** | **40-60 min** | Ready for staging |

---

## SUCCESS CRITERIA ✅

**Build is successful when:**

1. ✅ `npm run build` completes with no "error" messages
2. ✅ `npm run lint` completes with no "error" messages  
3. ✅ `dist/` folder exists with compiled files
4. ✅ `client/dist/` folder exists with bundled files
5. ✅ `docker images | grep staging` shows 2 images
6. ✅ Both images have tag "staging"

---

## READY FOR NEXT PHASE?

After all steps complete successfully:

1. ✅ Read: `STAGING_READINESS_CHECKLIST.md` Phase 4-5
2. ✅ Run: `docker-compose -f docker-compose.test.yml up -d`
3. ✅ Test: Smoke tests (30 min)
4. ✅ Test: Full test suite (2-4 hours)
5. ✅ Approve: Get sign-offs
6. ✅ Deploy: Production deployment

---

**Status:** PHASE 3 - EXECUTING  
**Next:** Staging deployment when build completes  
**Support:** Check BUILD_VERIFICATION.md if stuck

👉 **Start with:** Copy first command and run it in terminal NOW!

Good luck! 🚀
