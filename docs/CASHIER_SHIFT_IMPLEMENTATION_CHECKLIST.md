# ✅ CASHIER SHIFT FLOW - IMPLEMENTATION CHECKLIST

**Status**: 🟢 READY FOR DEV TEAM  
**Scope**: Sprint 1 Week 1 (3-4 hari kerja)  
**Estimated Effort**: 16-20 jam per developer  
**Team Required**: 1-2 frontend dev + 1 backend dev

---

## 📋 PRE-IMPLEMENTATION CHECKLIST

### Code Inventory Check

- [ ] **Router file exists**: `src/router/index.ts`
- [ ] **Routes folder exists**: `src/router/routes/`
- [ ] **Guards folder exists**: `src/router/guards/`
- [ ] **Stores folder exists**: `src/stores/`
- [ ] **Views folder exists**: `src/views/`
- [ ] **Layouts folder exists**: `src/layouts/`

### Dependencies Check

- [ ] **Pinia installed**: `npm list pinia`
- [ ] **Vue Router v4+**: `npm list vue-router`
- [ ] **TypeScript configured**: `tsconfig.json` exists
- [ ] **Vite build configured**: `vite.config.ts` exists

### Backend API Check

- [ ] Backend ready for `/api/v1/shift/open` endpoint
- [ ] Backend ready for `/api/v1/shift/{id}/close` endpoint
- [ ] Database migrations for shift table prepared
- [ ] Auth middleware for CASHIER role working

---

## 🎯 FRONTEND IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Day 1 - 2 hours)

#### 1.1 Create Shift Store
- [ ] Create file: `src/stores/shiftStore.ts`
- [ ] Copy code from CASHIER_SHIFT_CODE_IMPLEMENTATION.md
- [ ] Test store can be imported: `import { useShiftStore } from '@/stores/shiftStore'`
- [ ] Verify TypeScript compilation: `npm run type-check`

**Command:**
```bash
# Test store
npm run type-check
```

#### 1.2 Create Shift Guard
- [ ] Create file: `src/router/guards/cashierShiftGuard.ts`
- [ ] Copy code from documentation
- [ ] Verify TypeScript compilation
- [ ] Review guard logic with team

**Command:**
```bash
npm run type-check
```

#### 1.3 Update Router Main File
- [ ] Open `src/router/index.ts`
- [ ] Add import: `import { setupCashierShiftGuard } from '@/router/guards/cashierShiftGuard'`
- [ ] Add call: `setupCashierShiftGuard(router)` after route definition
- [ ] Verify compilation

**Code to add:**
```typescript
import { setupCashierShiftGuard } from '@/router/guards/cashierShiftGuard'

// After routes definition
setupCashierShiftGuard(router)
```

---

### Phase 2: Components (Day 1-2 - 4 hours)

#### 2.1 Create OpenShift Component
- [ ] Create file: `src/views/shift/OpenShift.vue`
- [ ] Copy Vue template from documentation
- [ ] Test component renders
- [ ] Test form validation
- [ ] Test API call to backend

**Manual test:**
```
1. Navigate to /open-shift
2. See fullscreen form
3. Enter balance 100000
4. Click "Buka Shift"
5. Should navigate to /pos
```

#### 2.2 Create CloseShift Component (Template)
- [ ] Create file: `src/views/shift/CloseShift.vue`
- [ ] Create basic template (fullscreen, summary display)
- [ ] Wire to shift store for display data
- [ ] Add close shift button
- [ ] Handle back button prevention

**Minimal template:**
```vue
<template>
  <div class="shift-close-container">
    <h1>Tutup Shift</h1>
    <div class="summary">
      <p>Saldo Awal: {{ formatCurrency(shiftStore.initialBalance) }}</p>
      <p>Total Penjualan: {{ formatCurrency(shiftStore.totalSales) }}</p>
      <p>Total Pembayaran: {{ formatCurrency(shiftStore.totalPayment) }}</p>
      <p>Saldo Akhir: {{ formatCurrency(shiftStore.currentBalance) }}</p>
    </div>
    <button @click="handleCloseShift">Konfirmasi Tutup Shift</button>
  </div>
</template>
```

#### 2.3 Add Cashier Routes to Router
- [ ] Update `src/router/routes/operational.routes.ts`
- [ ] Add OpenShift route
- [ ] Add POSFullscreen route
- [ ] Add CloseShift route
- [ ] Add order/product/customer routes (already exist, mark as requiresShift: true)
- [ ] Verify routes compile

**Routes to add:**
```typescript
const cashierRoutes = [
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
  // ...
]
```

---

### Phase 3: Integration Testing (Day 2 - 3 hours)

#### 3.1 Test: Blocked Without Shift
- [ ] Login as CASHIER
- [ ] Try to access `/pos` directly
- [ ] Verify redirect to `/open-shift`
- [ ] Try to access `/app/orders` directly
- [ ] Verify redirect to `/open-shift`

**Test steps:**
```
1. Open DevTools (F12)
2. Logout
3. Login as cashier1@test.com
4. Browser URL bar: type http://localhost:5173/pos
5. Press Enter
6. Should redirect to /open-shift ✅
```

#### 3.2 Test: Can Open Shift
- [ ] At `/open-shift`
- [ ] Enter balance 50000
- [ ] Click "Buka Shift"
- [ ] Verify navigates to `/pos`
- [ ] Verify shift store has `isActive = true`
- [ ] Verify header/footer NOT visible (fullscreen mode)

**Test steps:**
```
1. At /open-shift
2. Enter balance: 50000
3. Click "Buka Shift"
4. Check console: [SHIFT] Opened successfully
5. Should see POS fullscreen (no header/sidebar)
```

#### 3.3 Test: Cannot URL Bypass
- [ ] After opening shift at `/pos`
- [ ] Change URL to `/open-shift`
- [ ] Should show normal POS, NOT redirect
- [ ] Change URL to `/app/orders`
- [ ] Should show orders page with shift still active

**Test steps:**
```
1. At /pos (shift open)
2. URL bar: change to /open-shift
3. Should show /pos, NOT /open-shift (already open)
4. URL bar: change to /app/orders
5. Should show orders page normally
```

#### 3.4 Test: Back Button Prevention
- [ ] At `/pos` with active shift
- [ ] Try browser back button
- [ ] Should NOT go back to `/open-shift`
- [ ] At `/shift/close`
- [ ] Try browser back button
- [ ] Should NOT go to previous page

**Test steps:**
```
1. At /pos (shift open)
2. Click browser back button
3. Should stay at /pos (prevented by guard)
4. Check console: [SHIFT GUARD] Back button prevented
```

#### 3.5 Test: Shift Closing
- [ ] At `/pos` with active shift
- [ ] Click "Tutup Shift" button
- [ ] Should navigate to `/shift/close`
- [ ] Show summary (balance, sales, etc)
- [ ] Click "Konfirmasi Tutup Shift"
- [ ] Should close and redirect to `/open-shift`

**Test steps:**
```
1. At /pos
2. Find and click "Tutup Shift" button
3. Should show /shift/close with summary
4. Click "Konfirmasi Tutup Shift"
5. Check console: [SHIFT] Closed successfully
6. Should redirect to /open-shift
```

---

## 🔌 BACKEND IMPLEMENTATION CHECKLIST

### Backend Phase 1: API Endpoints (Day 1 - 3 hours)

#### 1.1 Create Shift Model
- [ ] Create/update Prisma schema for `Shift`
- [ ] Fields: id, storeId, cashierId, initialBalance, totalSales, totalPayment, openedAt, closedAt, status
- [ ] Run migration: `npx prisma migrate dev`

**Prisma schema:**
```prisma
model Shift {
  id            String    @id @default(cuid())
  store         Store     @relation(fields: [storeId], references: [id])
  storeId       String
  cashier       User      @relation(fields: [cashierId], references: [id])
  cashierId     String
  initialBalance Decimal   @default(0)
  totalSales    Decimal   @default(0)
  totalPayment  Decimal   @default(0)
  status        String    @default("open")  // "open" | "closed"
  openedAt      DateTime  @default(now())
  closedAt      DateTime?
  
  @@index([storeId])
  @@index([cashierId])
  @@index([openedAt])
}
```

#### 1.2 Create Shift Routes
- [ ] Create file: `src/routes/shift.routes.ts`
- [ ] Implement POST `/api/v1/shift/open`
- [ ] Implement POST `/api/v1/shift/{id}/close`
- [ ] Both routes require CASHIER role

**Route handlers:**

```typescript
// POST /api/v1/shift/open
router.post('/shift/open', async (req, res) => {
  const { initialBalance } = req.body
  const userId = req.user.id

  try {
    const shift = await prisma.shift.create({
      data: {
        cashierId: userId,
        storeId: req.user.storeId,
        initialBalance: BigInt(initialBalance),
        status: 'open'
      }
    })

    res.json({
      shiftId: shift.id,
      message: 'Shift opened successfully'
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to open shift' })
  }
})

// POST /api/v1/shift/{id}/close
router.post('/shift/:id/close', async (req, res) => {
  const { id } = req.params
  const { initialBalance, totalSales, totalPayment, closingBalance } = req.body

  try {
    const shift = await prisma.shift.update({
      where: { id },
      data: {
        status: 'closed',
        totalSales: BigInt(totalSales),
        totalPayment: BigInt(totalPayment),
        closedAt: new Date()
      }
    })

    res.json({
      message: 'Shift closed successfully',
      shiftSummary: {
        shiftId: shift.id,
        initialBalance: shift.initialBalance.toString(),
        totalSales: shift.totalSales.toString(),
        totalPayment: shift.totalPayment.toString()
      }
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to close shift' })
  }
})
```

#### 1.3 Add Shift Routes to Main Router
- [ ] Open `src/routes/index.ts`
- [ ] Import shift routes
- [ ] Register: `app.use('/api/v1', shiftRoutes)`

---

### Backend Phase 2: Integration Testing (Day 2 - 2 hours)

#### 2.1 Test: Open Shift API
- [ ] Call POST `/api/v1/shift/open` with balance 100000
- [ ] Verify returns shiftId
- [ ] Verify shift created in database
- [ ] Verify cashierId is correct

**cURL test:**
```bash
curl -X POST http://localhost:3000/api/v1/shift/open \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"initialBalance": 100000}'

# Expected response:
# {"shiftId": "clz...", "message": "Shift opened successfully"}
```

#### 2.2 Test: Close Shift API
- [ ] Call POST `/api/v1/shift/{id}/close` with summary
- [ ] Verify returns success
- [ ] Verify shift marked as closed in database
- [ ] Verify totalSales and totalPayment saved

**cURL test:**
```bash
curl -X POST http://localhost:3000/api/v1/shift/clz123/close \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "initialBalance": 100000,
    "totalSales": 250000,
    "totalPayment": 250000,
    "closingBalance": 350000
  }'

# Expected response:
# {"message": "Shift closed successfully", "shiftSummary": {...}}
```

#### 2.3 Test: Cannot Close Without Permission
- [ ] Call as non-CASHIER user
- [ ] Verify forbidden (403)
- [ ] Call without authorization
- [ ] Verify unauthorized (401)

---

## 🧪 E2E TESTING CHECKLIST

### Scenario 1: Complete Happy Path
```
1. ✅ Cashier login
2. ✅ Navigate to /pos → redirects to /open-shift
3. ✅ Enter balance 50000
4. ✅ Click "Buka Shift"
5. ✅ See POS fullscreen
6. ✅ Process some orders
7. ✅ Click "Tutup Shift"
8. ✅ See summary with balance, sales, payment
9. ✅ Click "Konfirmasi Tutup Shift"
10. ✅ Redirected to /open-shift
```

### Scenario 2: Bypass Attempts (All Should Fail)
```
1. ✅ Login cashier
2. ✅ Try /pos → blocked, redirect to /open-shift
3. ✅ Try /app/orders → blocked, redirect to /open-shift
4. ✅ Try /customers → blocked, redirect to /open-shift
5. ✅ Try back button from /open-shift → stays
6. ✅ Try refresh page at /pos → stays in shift flow
```

### Scenario 3: Error Handling
```
1. ✅ Try open shift with negative balance → error message
2. ✅ Try open shift with 0 balance → error message
3. ✅ Backend returns error → show error message and retry button
4. ✅ Close shift while transactions pending → show warning
```

### Scenario 4: Multiple Shifts
```
1. ✅ Cashier 1 opens shift A
2. ✅ Cashier 1 closes shift A
3. ✅ Cashier 1 opens shift B
4. ✅ Verify shift B is separate from A
5. ✅ Check database has both shifts
```

---

## 📊 VERIFICATION MATRIX

| Test Case | Expected | Status |
|-----------|----------|--------|
| CASHIER cannot access /pos without shift | Redirect to /open-shift | ⬜ |
| CASHIER can open shift | Navigate to /pos, shift.isActive=true | ⬜ |
| Cannot bypass with manual URL | Guard blocks it | ⬜ |
| Cannot go back from /shift/close | Back button prevented | ⬜ |
| Page refresh keeps state | Shift still active | ⬜ |
| Cannot access /app/orders without shift | Redirect to /open-shift | ⬜ |
| Shift closes and locks POS | No /pos access, redirect to /open-shift | ⬜ |
| Cannot close shift with pending transactions | Show warning | ⬜ |
| Multiple shifts per day work | Each shift is separate | ⬜ |
| Browser back button from close | Stays on close screen | ⬜ |

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment (Day 3-4)

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Code review approved
- [ ] QA sign-off
- [ ] Documentation updated

### Deployment Steps

- [ ] Merge to main branch
- [ ] Build production: `npm run build`
- [ ] Verify build has no errors
- [ ] Deploy to staging
- [ ] E2E test on staging
- [ ] Deploy to production
- [ ] Monitor production logs

### Post-Deployment

- [ ] Monitor shift flow usage
- [ ] Check for bypass attempts in logs
- [ ] Verify no error spikes
- [ ] Cashiers trained on new flow
- [ ] Document any issues

---

## 📞 SUPPORT CONTACTS

- **Frontend Lead**: _______________
- **Backend Lead**: _______________
- **QA Lead**: _______________
- **Project Manager**: _______________

---

## 📝 SIGN-OFF

- [ ] Frontend Development: _____________ Date: _______
- [ ] Backend Development: _____________ Date: _______
- [ ] QA Testing: _____________ Date: _______
- [ ] Project Manager: _____________ Date: _______

---

## 🎯 SUCCESS CRITERIA

✅ All above checkboxes completed  
✅ Cashier shift flow impossible to bypass  
✅ No manual URL access to /pos without shift  
✅ Fullscreen mode working (no header/sidebar)  
✅ All tests passing  
✅ Zero critical bugs  
✅ Documentation complete  
✅ Team trained  
✅ Deployed to production  

---

**Status: 🟢 READY FOR SPRINT 1 WEEK 1**

Estimated Timeline: 3-4 days  
Estimated Effort: 24-30 hours total (1.5 developers)  
Dependencies: Backend API endpoints ready  

