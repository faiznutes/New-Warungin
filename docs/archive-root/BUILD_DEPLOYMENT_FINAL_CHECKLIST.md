# ✅ BUILD & DEPLOYMENT FINAL CHECKLIST
## Super Admin System - Complete Build & Deploy
### Date: January 21, 2026 | Status: READY TO EXECUTE

---

## 🎯 MISSION: Build Backend & Deploy to Docker

**Timeline**: ~30 minutes  
**Risk**: LOW (Green)  
**Rollback**: 2 minutes  

---

## 📋 PRE-BUILD VERIFICATION

Before starting, confirm:

- [ ] SSH access to server verified
- [ ] Local files ready (support-tickets.routes.ts, schema.prisma updated)
- [ ] Docker services running (docker ps shows 10 services)
- [ ] Database connectivity confirmed
- [ ] Team notified of deployment

---

## 🚀 PHASE 1: SSH & DATABASE MIGRATION (5 minutes)

### Step 1.1: Connect to Server
```bash
ssh root@192.168.1.101
# Password: 123
```

**Verify**:
- [ ] SSH connection successful
- [ ] Prompt shows `root@...`

### Step 1.2: Navigate to Project
```bash
cd /root/New-Warungin
pwd
# Should show: /root/New-Warungin
```

**Verify**:
- [ ] Current directory: /root/New-Warungin
- [ ] Files visible: src/, prisma/, package.json, docker-compose.yml

### Step 1.3: Generate Prisma Client
```bash
npm run prisma:generate
```

**Expected Output**:
```
✔ Generated Prisma Client (v5.x.x) to ./node_modules/.prisma/client
```

**Verify**:
- [ ] No errors
- [ ] Prisma client generated
- [ ] Command completed successfully

### Step 1.4: Run Database Migration
```bash
npm run prisma:migrate
```

**Expected Output**:
```
Prisma Migrate

1 migration found in prisma/migrations

✔ Done with 1 migration in XXms
```

**Verify**:
- [ ] Migration completed
- [ ] SupportTicket and TicketNote models created
- [ ] No rollback errors

**Check Database**:
```bash
psql -U postgres -d warungin_db -c "\dt SupportTicket"
# Should show the SupportTicket table

psql -U postgres -d warungin_db -c "\dt TicketNote"
# Should show the TicketNote table
```

**Verify**:
- [ ] SupportTicket table exists
- [ ] TicketNote table exists
- [ ] Relationships established

---

## 🔨 PHASE 2: BUILD BACKEND (10 minutes)

### Step 2.1: Install Dependencies
```bash
npm install
```

**Expected Output**:
```
up to date, ...
```

**Verify**:
- [ ] No installation errors
- [ ] Dependencies resolved
- [ ] node_modules updated

### Step 2.2: Build Project
```bash
npm run build
```

**Expected Output**:
```
> backend@1.0.0 build
> tsc && next build

✔ Compiled successfully
✔ Generated build output
```

**Verify**:
- [ ] TypeScript compilation successful
- [ ] No build errors
- [ ] Build artifacts generated
- [ ] `dist/` directory created

**Check Build Output**:
```bash
ls -lh dist/ | head -10
```

**Verify**:
- [ ] Output files present
- [ ] Timestamps recent
- [ ] Support tickets routes compiled

---

## 🐳 PHASE 3: DOCKER RESTART (3 minutes)

### Step 3.1: Stop Backend Container
```bash
docker compose stop warungin-backend
```

**Expected Output**:
```
Stopping warungin-backend ... done
```

**Verify**:
- [ ] Container stopped
- [ ] No error messages

### Step 3.2: Wait for Graceful Shutdown
```bash
sleep 3
```

**Verify**:
- [ ] Waited 3 seconds
- [ ] Container fully stopped

### Step 3.3: Start Backend Container
```bash
docker compose up -d warungin-backend
```

**Expected Output**:
```
Creating warungin-backend ... done
```

**Verify**:
- [ ] Container created/started
- [ ] No error messages

### Step 3.4: Wait for Container Ready
```bash
sleep 5
```

**Verify**:
- [ ] Waited 5 seconds
- [ ] Container time to initialize

### Step 3.5: Check Container Status
```bash
docker ps | grep warungin-backend
```

**Expected Output**:
```
warungin-backend  node:20-alpine  Up 5 seconds    0.0.0.0:3000->3000/tcp
```

**Verify**:
- [ ] Status: "Up X seconds"
- [ ] Port: 3000 mapped correctly
- [ ] Container healthy

---

## ✅ PHASE 4: API VERIFICATION (5 minutes)

### Step 4.1: Test Support Tickets Endpoint
```bash
curl http://localhost:3000/api/support/tickets
```

**Expected Output**:
```json
{"success": true, "data": [], "total": 0}
```

**Verify**:
- [ ] HTTP 200 OK
- [ ] Response contains "success": true
- [ ] Data array present (empty initially)

### Step 4.2: Test Create Endpoint
```bash
curl -X POST http://localhost:3000/api/support/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Ticket",
    "description": "Testing support tickets API"
  }'
```

**Expected Output**:
```json
{"success": true, "data": {"id": 1, ...}}
```

**Verify**:
- [ ] HTTP 201 Created or 200 OK
- [ ] Ticket created successfully
- [ ] ID assigned

### Step 4.3: Test Get Endpoint
```bash
curl http://localhost:3000/api/support/tickets/1
```

**Expected Output**:
```json
{"success": true, "data": {"id": 1, "subject": "Test Ticket", ...}}
```

**Verify**:
- [ ] Ticket retrieved successfully
- [ ] All fields present
- [ ] Data matches

### Step 4.4: Test Dashboard (All 6 Features)
```bash
curl http://localhost:3000/api/dashboard/stats
curl http://localhost:3000/api/addons/available
curl http://localhost:3000/api/users
curl http://localhost:3000/api/outlets
curl http://localhost:3000/api/analytics/predictions
```

**Verify**:
- [ ] All endpoints return 200 OK
- [ ] No 500 errors
- [ ] All features working

---

## 📊 PHASE 5: LOGS & MONITORING (5 minutes)

### Step 5.1: Check Backend Logs
```bash
docker logs warungin-backend --tail=100
```

**Expected Content**:
```
✓ Migrations applied
✓ Database connected
✓ Server listening on port 3000
✓ All modules initialized
```

**Verify**:
- [ ] No ERROR logs
- [ ] No CRITICAL logs
- [ ] Successful initialization
- [ ] Server running

### Step 5.2: Check Database Connection
```bash
docker logs warungin-postgres --tail=20
```

**Expected**:
- [ ] No connection errors
- [ ] Database responsive
- [ ] Migrations applied

### Step 5.3: Monitor Live Logs (5 minutes)
```bash
docker logs warungin-backend --follow
```

**Watch for**:
- [ ] No errors appearing
- [ ] Normal traffic/requests
- [ ] Stable operation
- [ ] No restarts

**Exit**: Press `Ctrl+C`

---

## 🎉 FINAL VERIFICATION

### All Systems Check
```bash
# Docker status
docker ps | grep warungin

# Database check
psql -U postgres -d warungin_db -c "SELECT COUNT(*) FROM \"SupportTicket\";"

# API response
curl http://localhost:3000/api/support/tickets

# All features
curl http://localhost:3000/api/dashboard/stats
```

**Verify**:
- [ ] All containers running
- [ ] Database connected
- [ ] API responding
- [ ] All 6 features functional

---

## ✅ DEPLOYMENT SUCCESS CRITERIA

All of the following must be TRUE:

- [ ] **Database**: SupportTicket table created
- [ ] **Database**: TicketNote table created
- [ ] **Build**: No TypeScript errors
- [ ] **Docker**: Backend container running
- [ ] **API**: Support Tickets GET endpoint returns 200
- [ ] **API**: Dashboard endpoint returns 200
- [ ] **Logs**: No ERROR or CRITICAL messages
- [ ] **Features**: All 6 Super Admin features working
- [ ] **Stability**: No container restarts

**Result**: 🟢 **DEPLOYMENT SUCCESSFUL**

---

## 📈 POST-DEPLOYMENT MONITORING

Monitor for **5-10 minutes** after deployment:

**Watch For**:
- [ ] Consistent API response times (< 500ms)
- [ ] No 5xx errors
- [ ] Normal CPU/Memory usage
- [ ] No database connection errors
- [ ] Smooth user interactions

**If Issues Found**:
1. Check logs: `docker logs warungin-backend`
2. Review errors in detail
3. Execute rollback if critical
4. Document findings

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

**Quick Rollback** (< 2 minutes):
```bash
docker compose restart warungin-backend
```

**Full Rollback** (< 5 minutes):
```bash
npm run prisma:migrate resolve
docker compose down
docker compose up -d
docker logs warungin-backend --tail=50
```

**Never** delete database without backup!

---

## 📞 TROUBLESHOOTING

| Issue | Solution | Status |
|-------|----------|--------|
| Migration fails | Check DB connectivity, review errors | |
| Build errors | Verify Node.js version, npm cache | |
| Container won't start | Check logs, ensure ports available | |
| API 404 errors | Verify routes registered, restart | |
| Database errors | Check credentials, verify tables | |

---

## 📝 DEPLOYMENT NOTES

**Time Started**: ________________  
**Database Migration**: ________________  
**Build Completed**: ________________  
**Docker Restarted**: ________________  
**API Verified**: ________________  
**Time Completed**: ________________  

**Total Time**: ________________ minutes

**Issues Encountered**:
1. ________________
2. ________________
3. ________________

**Resolution Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## ✍️ SIGN-OFF

| Role | Name | Time | Status |
|------|------|------|--------|
| Deployed By | | | [ ] |
| Verified By | | | [ ] |
| Approved By | | | [ ] |

---

## 🎊 DEPLOYMENT COMPLETE!

✅ **All phases completed successfully**

**Status**: 🟢 READY FOR PRODUCTION

**Next Actions**:
1. Notify team of successful deployment
2. Monitor application for 24 hours
3. Document any findings
4. Archive this checklist

---

**Generated**: January 21, 2026  
**System**: Warungin POS v1.0  
**Status**: PRODUCTION READY

**Deploy dengan percaya diri!** 🚀

---

## 📋 QUICK REFERENCE COMMANDS

```bash
# Copy & paste these into server terminal:

# SSH
ssh root@192.168.1.101

# Migration
cd /root/New-Warungin
npm run prisma:generate
npm run prisma:migrate

# Build
npm run build

# Docker
docker compose stop warungin-backend
sleep 3
docker compose up -d warungin-backend
sleep 5

# Verify
curl http://localhost:3000/api/support/tickets
docker logs warungin-backend --tail=50
```

---

*Use this checklist to track every step of the deployment process.*

*Keep for reference and record-keeping.*
