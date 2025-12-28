# Build Error Troubleshooting Guide

## How to Capture Build Errors

If you're seeing build errors, run this command dan share the FULL output:

```bash
cd ~/New-Warungin
npm run build 2>&1 | tee build-error.log

# Then share the build-error.log file
cat build-error.log
```

## Common Build Errors & Fixes

### Error 1: Module Not Found
**Error message**: `Cannot find module 'X'` or `Module not found: Can't resolve '@/X'`

**Fix**:
```bash
npm install --legacy-peer-deps
npm run prisma:generate
npm run build
```

### Error 2: TypeScript Compilation Errors
**Error message**: `error TS2339: Property 'X' does not exist on type 'Y'`

**Possible causes**:
- Prisma client not generated
- Type definitions missing
- Missing middleware imports

**Fix**:
```bash
npx prisma generate
npm run build
```

### Error 3: Port Already in Use
**Error message**: `EADDRINUSE: address already in use :::3000`

**Fix**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or kill all node processes
killall node

# Try again
npm start
```

### Error 4: Database Connection Error
**Error message**: `connect ECONNREFUSED 127.0.0.1:5432` or `Database connection error`

**Fix**:
```bash
# Ensure postgres is running
docker compose up -d postgres

# Wait 10 seconds for DB to start
sleep 10

# Test connection
npm run test:connection

# Then build
npm run build
```

## Step-by-Step Build Process

### 1. Clean Install
```bash
cd ~/New-Warungin

# Remove old builds
rm -rf dist node_modules

# Fresh install
npm install --legacy-peer-deps --no-save

# Generate Prisma
npm run prisma:generate

# Try build
npm run build
```

### 2. Check Dependencies
```bash
# Check for conflicting versions
npm ls express
npm ls typescript
npm ls ts-node

# Should see specific versions, not red "unmet dependency" errors
```

### 3. Docker Build
```bash
# If local build works but Docker fails, try:
docker compose down
docker rmi new-warungin-backend:latest
docker compose build backend --no-cache

# Check build output
docker compose build backend 2>&1 | tail -100
```

## Debugging Commands

```bash
# Check TypeScript version
npm ls typescript

# Check Node version
node --version

# Check if prisma client exists
ls node_modules/.prisma/client/

# Check for syntax errors in file
npx tsc --noEmit src/routes/superadmin-backup.routes.ts

# Verbose build
npm run build -- --listFiles
```

## If All Else Fails

### Option 1: Reset Everything
```bash
cd ~/New-Warungin

# Stop services
docker compose down

# Clean slate
rm -rf dist .next node_modules package-lock.json

# Reinstall
npm install --legacy-peer-deps

# Migrate fresh
npx prisma generate
npx prisma migrate dev --name init

# Build
npm run build

# Start
docker compose up -d --build
```

### Option 2: Check Git Status
```bash
git status
git diff src/routes/superadmin-backup.routes.ts | head -100

# If file is in weird state, reset it
git checkout HEAD -- src/routes/superadmin-backup.routes.ts

# Then manually re-apply the fix (move /critical route to top)
```

### Option 3: Compare with Backup
```bash
# If you have a backup of working version
diff ~/New-Warungin/src/routes/superadmin-backup.routes.ts ~/backup-working-version.ts

# Find what changed
# Then revert breaking changes
```

## Capture Full Error Output

To help diagnose, share:

```bash
# 1. Full build output
npm run build 2>&1

# 2. Node/npm versions
node --version && npm --version && tsc --version

# 3. Package versions
npm ls | grep -E "express|typescript|ts-node"

# 4. Prisma status
ls -la node_modules/.prisma/client/

# 5. If Docker: check Dockerfile
cat Dockerfile.backend | head -50
```

## Please Share:

When you get the error, please provide:
1. **Full error message** - copy everything from the error
2. **Command you ran** - `npm run build` or something else?
3. **Where it failed** - on server in Docker or locally?
4. **Last successful state** - when did build last work?

This will help diagnose the exact issue!
