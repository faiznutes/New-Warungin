# 🚀 CASHIER SHIFT FLOW - QUICK START GUIDE

**For**: Development Team  
**Duration**: 3-4 hari implementation  
**Readiness**: 🟢 Production-Ready Code  

---

## ⚡ 5-MINUTE OVERVIEW

### The Problem
✗ Kasir bisa akses POS tanpa buka shift  
✗ Tidak ada kontrol shift management  
✗ Bisa bypass dengan manual URL  
✗ Operasional tidak aman  

### The Solution
✅ Wajib buka shift sebelum POS  
✅ Fullscreen UI tidak bisa dilewati  
✅ Route guard mencegah semua bypass  
✅ Shift state di Pinia (persistent)  
✅ Close shift mandatory sebelum logout  

### Architecture (3 layers)
```
Layer 1: Route Guard
  → Check if CASHIER has active shift
  → Block access ke /pos, /app/*, etc
  → Redirect ke /open-shift

Layer 2: UI State
  → Fullscreen for open/close (no layout wrapper)
  → Pinia store maintains shift state
  → Back button prevented by guard

Layer 3: Backend
  → POST /api/v1/shift/open → create shift
  → POST /api/v1/shift/{id}/close → close shift
  → Both require CASHIER auth
```

---

## 📁 FILES TO CREATE (Copy-Paste Ready)

### 🔐 Guard (1 file)
**File**: `src/router/guards/cashierShiftGuard.ts`  
**Source**: CASHIER_SHIFT_CODE_IMPLEMENTATION.md → FILE 1  
**Length**: ~250 lines  
**Action**: Copy-paste, no modifications needed  

```bash
# After creating:
npm run type-check  # Verify compiles
```

### 💾 Store (1 file)
**File**: `src/stores/shiftStore.ts`  
**Source**: CASHIER_SHIFT_CODE_IMPLEMENTATION.md → FILE 2  
**Length**: ~300 lines  
**Action**: Copy-paste, adjust API URLs if needed  

```bash
# After creating:
npm run type-check
```

### 🎨 Components (2 files)
**File 1**: `src/views/shift/OpenShift.vue`  
**Source**: CASHIER_SHIFT_CODE_IMPLEMENTATION.md → FILE 4  
**Length**: ~250 lines  
**Action**: Copy-paste, customize colors if needed  

**File 2**: `src/views/shift/CloseShift.vue`  
**Source**: Create from template in CASHIER_SHIFT_CODE_IMPLEMENTATION.md  
**Length**: ~150 lines  
**Action**: Extend the minimal template provided  

---

## 🔧 FILES TO UPDATE (2 files)

### Update 1: Router Main File
**File**: `src/router/index.ts`

**ADD IMPORT:**
```typescript
import { setupCashierShiftGuard } from '@/router/guards/cashierShiftGuard'
```

**ADD CALL (after router creation):**
```typescript
const router = createRouter({...})

// Add this line ↓
setupCashierShiftGuard(router)

export default router
```

### Update 2: Routes
**File**: `src/router/routes/operational.routes.ts`

**ADD ROUTES (copy from FILE 3 in code guide):**
```typescript
// Add cashier routes with proper meta tags
{
  path: '/open-shift',
  name: 'OpenShift',
  component: OpenShift,
  meta: { requiresShift: false, requiresAuth: true, roles: ['CASHIER'] }
},
{
  path: '/pos',
  name: 'POSFullscreen',
  component: POS,
  meta: { requiresShift: true, requiresAuth: true, roles: ['CASHIER'] }
},
{
  path: '/shift/close',
  name: 'CloseShift',
  component: CloseShift,
  meta: { requiresShift: true, requiresAuth: true, roles: ['CASHIER'] }
}
```

---

## ⏰ IMPLEMENTATION TIMELINE

### Day 1 Morning (2 hours)
```
09:00 - 10:00  Create guard file + store file
10:00 - 11:00  Update router main file
11:00 - 11:30  Verify compilation
```

**Commit**: `feat: add cashier shift guard and store`

### Day 1 Afternoon (3 hours)
```
14:00 - 15:30  Create OpenShift.vue
15:30 - 16:00  Create CloseShift.vue template
16:00 - 17:00  Add routes to router
```

**Commit**: `feat: add shift UI components and routes`

### Day 2 Morning (3 hours)
```
09:00 - 10:00  Backend: Create Shift model + migrations
10:00 - 11:30  Backend: Implement POST /api/v1/shift/open
11:30 - 12:00  Backend: Implement POST /api/v1/shift/{id}/close
```

**Commit**: `feat: add shift API endpoints`

### Day 2-3 Afternoon (4 hours)
```
14:00 - 15:00  Test 1: Blocked without shift
15:00 - 16:00  Test 2: Can open shift
16:00 - 16:30  Test 3: Cannot bypass URL
16:30 - 17:00  Test 4: Back button prevention
```

**Commit**: `test: add shift flow integration tests`

### Day 3-4 (4 hours)
```
09:00 - 10:00  E2E testing
10:00 - 11:00  Bug fixes if any
11:00 - 12:00  Final testing + sign-off
```

**Status**: Ready for production ✅

---

## 🧪 QUICK TEST CHECKLIST

### Test 1: URL Bypass Prevention ✅
```bash
# Scenario: Try to access /pos without shift
1. Login as cashier
2. In browser URL bar: http://localhost:5173/pos
3. Press Enter
4. EXPECT: Redirect to /open-shift ✅
```

### Test 2: Can Open Shift ✅
```bash
# Scenario: Normal shift opening
1. At /open-shift
2. Enter balance: 50000
3. Click "Buka Shift"
4. EXPECT: Navigate to /pos ✅
5. Console shows: [SHIFT] Opened successfully ✅
```

### Test 3: Back Button Prevention ✅
```bash
# Scenario: Try back button from POS
1. At /pos (shift open)
2. Click browser back button
3. EXPECT: Stay at /pos (not go back) ✅
```

### Test 4: Shift Close Flow ✅
```bash
# Scenario: Complete closing
1. At /pos
2. Click "Tutup Shift"
3. EXPECT: Show /shift/close with summary ✅
4. Click "Konfirmasi"
5. EXPECT: Redirect to /open-shift, shift closed ✅
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "Cannot find module 'shiftStore'"
**Cause**: File not created or wrong path  
**Fix**:
```bash
# Verify file exists
ls -la src/stores/shiftStore.ts

# Check import path
cat src/router/index.ts | grep useShiftStore
```

### Issue 2: "Guard not being applied"
**Cause**: setupCashierShiftGuard() not called  
**Fix**:
```typescript
// In src/router/index.ts, add this AFTER router creation:
setupCashierShiftGuard(router)
```

### Issue 3: "Redirect loop to /open-shift"
**Cause**: Guard thinks shift is not active  
**Fix**:
```typescript
// In store, verify openShift action sets:
status.value = 'open'
isActive.value = true
```

### Issue 4: "Fullscreen not working"
**Cause**: Layout wrapper still shown  
**Fix**:
```vue
<!-- In OpenShift.vue and CloseShift.vue -->
<!-- Should NOT have layout wrapper -->
<!-- Just standalone <div class="shift-open-container"> -->
```

### Issue 5: "API returns 401 Unauthorized"
**Cause**: Backend shift routes not added  
**Fix**:
```bash
# Verify in backend
grep -r "POST /shift/open" src/routes/

# If not found, add to backend routes
```

---

## 📚 DOCUMENTATION REFERENCE

| Question | Document | Section |
|----------|----------|---------|
| How guard works? | CASHIER_SHIFT_CODE_IMPLEMENTATION.md | FILE 1 |
| How store works? | CASHIER_SHIFT_CODE_IMPLEMENTATION.md | FILE 2 |
| How to implement? | CASHIER_SHIFT_IMPLEMENTATION_CHECKLIST.md | All phases |
| Full code examples? | CASHIER_SHIFT_CODE_IMPLEMENTATION.md | All files |
| UI design? | CASHIER_SHIFT_FLOW_LOCKED.md | Component structure |
| Test cases? | CASHIER_SHIFT_IMPLEMENTATION_CHECKLIST.md | Testing section |

---

## 👥 WHO DOES WHAT

### Frontend Developer
```
✅ Create guard file (cashierShiftGuard.ts)
✅ Create store file (shiftStore.ts)
✅ Create component files (OpenShift.vue, CloseShift.vue)
✅ Update router configuration
✅ Test UI and guards
✅ E2E testing
```

### Backend Developer
```
✅ Create Shift model in Prisma
✅ Create Shift database migration
✅ Implement POST /api/v1/shift/open
✅ Implement POST /api/v1/shift/{id}/close
✅ Add auth middleware for shift routes
✅ Test API endpoints
```

### QA / Tester
```
✅ Test URL bypass prevention
✅ Test shift opening/closing
✅ Test back button behavior
✅ Test error scenarios
✅ Test multiple shifts per day
✅ E2E testing
✅ Sign-off
```

---

## ✅ READY TO START?

### Checklist Before Starting
- [ ] Read this guide (5 minutes)
- [ ] Review CASHIER_SHIFT_CODE_IMPLEMENTATION.md (15 minutes)
- [ ] Review CASHIER_SHIFT_IMPLEMENTATION_CHECKLIST.md (10 minutes)
- [ ] Understand the architecture (5 minutes)
- [ ] Have all docs open for reference
- [ ] Have backend team ready for API endpoints

### Command to Start
```bash
# Frontend
mkdir -p src/router/guards
mkdir -p src/views/shift
mkdir -p src/stores

# Create files (copy from docs)
# Then run:
npm run type-check
npm run dev

# Test in browser
# http://localhost:5173
# Try to access /pos without shift
# Should redirect to /open-shift ✅
```

### Success = When
```
✅ URL /pos → redirect to /open-shift (no shift)
✅ Open shift → navigate to /pos
✅ Back button → prevented
✅ Close shift → redirect to /open-shift
✅ No console errors
✅ No TypeScript errors
✅ Tests passing
✅ Code reviewed
✅ Deployed to production
```

---

## 🎯 THIS IS NOT OPTIONAL

> "Mengunci FLOW SHIFT KASIR agar jelas, tidak bisa dilewati, tidak membingungkan, aman secara operasional"

This implementation makes it **IMPOSSIBLE** to:
- Access /pos without shift
- Bypass guard with manual URL
- Go back from shift close
- Leave fullscreen shift opening
- Access operations without active shift

**Status: 🟢 READY FOR IMMEDIATE IMPLEMENTATION**

---

## 📞 QUESTIONS?

Refer to:
1. CASHIER_SHIFT_CODE_IMPLEMENTATION.md - Full code + comments
2. CASHIER_SHIFT_IMPLEMENTATION_CHECKLIST.md - Step-by-step guide
3. CASHIER_SHIFT_FLOW_LOCKED.md - Architecture & design
4. This document - Quick answers

**Next Step**: Start with Day 1 Morning tasks above

