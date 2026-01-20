# 🚀 DEPLOYMENT CHECKLIST & SETUP GUIDE

## ⚠️ CRITICAL: PRE-DEPLOYMENT STATUS

**Current Deployment Readiness: ❌ NOT READY**

See `_archive/documentation/PERFECT_VERIFICATION_AUDIT.md` for full details.

### 🔴 Critical Blockers (MUST FIX BEFORE DEPLOY)

| # | Issue | File | Fix Status |
|---|-------|------|-----------|
| 1 | `console.error()` → should use logger | `src/utils/encryption.ts:61` | ❌ PENDING |
| 2 | Missing `roleGuard` on GET /api/orders | `src/routes/order.routes.ts` | ❌ PENDING |
| 3 | Orders not linked to `storeShiftId` | `src/services/order.service.ts` | ❌ PENDING |
| 4 | TODO migrations incomplete | `src/utils/encryption.ts:82,112` | ❌ PENDING |
| 5 | Bulk order update missing auth checks | `src/routes/order.routes.ts` | ❌ PENDING |
| 6 | Shift-guard silent error failure | `src/middlewares/shift-guard.ts` | ❌ PENDING |

---

## 📋 PRE-DEPLOYMENT SETUP

### 1. Environment Configuration
```bash
# Copy and customize
cp env.example .env

# Required vars:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (authentication key)
# - REDIS_URL (job queue)
# - MIDTRANS_KEY (payment gateway)
```

### 2. Dependencies Installation
```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### 3. Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 4. Build & Test
```bash
# Build
npm run build

# Run tests (recommended)
npm run test

# Run frontend build
cd client && npm run build && cd ..
```

---

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.yml up -d
docker-compose -f docker-compose.test.yml up -d  # Optional: run tests
```

### Monitoring Stack (Optional)
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Production Build
```bash
docker build -f Dockerfile.backend -t warungin-api:latest .
cd client && docker build -f Dockerfile -t warungin-client:latest . && cd ..
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Fix all 6 CRITICAL issues from audit report
- [ ] Run full test suite: `npm run test`
- [ ] Check all routes are protected with proper roleGuard
- [ ] Verify database migrations are applied
- [ ] Confirm env variables are set correctly
- [ ] Run production build successfully
- [ ] Execute smoke tests on staging
- [ ] Verify monitoring stack is operational
- [ ] Backup production database
- [ ] Deploy!

---

## 📖 DOCUMENTATION

For comprehensive details, see:
- System Architecture: `_archive/documentation/SYSTEM_BLUEPRINT.md`
- Full Audit Report: `_archive/documentation/PERFECT_VERIFICATION_AUDIT.md`
- Phase 36 Status: `_archive/documentation/PHASE36_HEALTH_CHECK_FINAL.md`

---

## 🔧 Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Start client | `cd client && npm run dev` |
| Run tests | `npm run test` |
| Lint code | `npm run lint` |
| Format code | `npm run format` |
| Build for prod | `npm run build` |

---

**Last Updated**: [Auto-generated - File Organization Complete]
**Status**: Ready for code fixes and deployment preparation
