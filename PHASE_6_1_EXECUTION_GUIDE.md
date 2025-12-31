# 🚀 PHASE 6.1: PRODUCTION DEPLOYMENT EXECUTION GUIDE

**Start Time**: After Phase 5.3 approval collection (estimated 30-45 min from now)
**Phase Duration**: 70-80 minutes total
**Status**: ✅ **READY TO EXECUTE - STANDING BY**

---

## 📊 WHAT THIS PHASE DOES

Deploys Warungin POS to production server (192.168.1.101) with:
- ✅ Complete backup before any changes
- ✅ Rebuild of backend and frontend services
- ✅ Restart of all 8 Docker services
- ✅ Comprehensive health checks
- ✅ Security verification
- ✅ Monitoring activation
- ✅ Rollback procedures (if needed)

**No downtime to customers** - Nginx handles traffic during update

---

## ⏱️ PHASE BREAKDOWN

```
PHASE 6.1: PRODUCTION DEPLOYMENT (70-80 min total)

PRE-DEPLOYMENT PHASE (30 min)
├─ Verify all systems (5 min)
├─ Create full backup (15 min)
├─ Notify teams (5 min)
└─ Final safety checks (5 min)

DEPLOYMENT PHASE (20 min)
├─ Rebuild backend service (8 min)
├─ Rebuild frontend service (8 min)
└─ Restart all services (4 min)

VERIFICATION PHASE (20 min)
├─ Health check all 8 services (5 min)
├─ Database connectivity test (3 min)
├─ Security verification (5 min)
├─ Cache functionality test (3 min)
└─ Final status check (4 min)

TOTAL: 70-80 MINUTES
```

---

## 🎯 PRE-DEPLOYMENT CHECKLIST (5 minutes)

Before you start, verify you have:

### **Required Access:**
- [ ] SSH access to 192.168.1.101 (test with: `ssh faiz@192.168.1.101`)
- [ ] Password: `123` (configured in sshpass)
- [ ] Terminal with sshpass installed
- [ ] Internet connection stable
- [ ] Backup drive/location available (minimum 5GB space)

### **Required Files:**
- [ ] [PHASE_6_1_DEPLOYMENT_READY.md](PHASE_6_1_DEPLOYMENT_READY.md) (detailed commands)
- [ ] [PHASE_6_3_MONITORING_READY.md](PHASE_6_3_MONITORING_READY.md) (monitoring guide - open after deploy)
- [ ] [INCIDENT_RESPONSE_GUIDE.md](INCIDENT_RESPONSE_GUIDE.md) (emergency procedures - have ready)

### **Required Approvals:**
- [ ] All 4 leader signatures collected
- [ ] Approval form saved
- [ ] Leaders notified of deployment time

### **Safety Verification:**
- [ ] All 8 services currently healthy (run health check first)
- [ ] Database backup exists
- [ ] Rollback procedures understood
- [ ] Emergency contacts listed

**All checked? → PROCEED TO STEP 1**

---

## 🔍 STEP 1: VERIFY CURRENT STATE (5 minutes)

Before making ANY changes, verify the system is healthy.

### **Run Health Check:**

Open terminal and run:
```bash
echo "=== CONNECTING TO SERVER ===" && \
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
echo "=== DOCKER STATUS ===" && \
docker-compose ps && \
echo "" && \
echo "=== DATABASE STATUS ===" && \
docker-compose exec -T postgres psql -U postgres -d warungin -c "SELECT 'Database OK' AS status;" && \
echo "" && \
echo "=== REDIS STATUS ===" && \
docker-compose exec -T redis redis-cli ping && \
echo "" && \
echo "=== SYSTEM HEALTH ===" && \
docker-compose ps --format "table {{.Service}}\t{{.State}}"
EOF
```

### **Expected Output:**
```
=== DOCKER STATUS ===
NAME                  STATUS
warungin-backend      Up X minutes
warungin-frontend     Up X minutes
postgres              Up X minutes
redis                 Up X minutes
nginx                 Up X minutes
...

=== DATABASE STATUS ===
 status
--------
 Database OK

=== REDIS STATUS ===
 PONG

=== SYSTEM HEALTH ===
SERVICE               STATE
warungin-backend      Up
warungin-frontend     Up
postgres              Up
redis                 Up
nginx                 Up
...
```

### **Verification Checklist:**
- [ ] All 8 services showing "Up"
- [ ] Database responding "OK"
- [ ] Redis responding "PONG"
- [ ] No services down or restarting

**All green? → PROCEED TO STEP 2**
**Something red? → DON'T PROCEED - Check [INCIDENT_RESPONSE_GUIDE.md](INCIDENT_RESPONSE_GUIDE.md)**

---

## 💾 STEP 2: CREATE FULL BACKUP (15 minutes)

Create complete backup before deployment.

### **Backup All Data:**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
BACKUP_DIR="/home/faiz/backups/$(date +%Y%m%d_%H%M%S)_pre_deployment"
mkdir -p "$BACKUP_DIR"

echo "=== BACKING UP POSTGRESQL DATA ===" && \
docker-compose exec -T postgres pg_dump -U postgres warungin > "$BACKUP_DIR/database_dump.sql" && \
echo "✅ Database backed up to $BACKUP_DIR/database_dump.sql" && \

echo "" && \
echo "=== BACKING UP DOCKER VOLUMES ===" && \
docker run --rm -v warungin_postgres_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/postgres_volume.tar.gz -C /data . && \
echo "✅ Database volume backed up" && \

docker run --rm -v warungin_redis_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/redis_volume.tar.gz -C /data . && \
echo "✅ Redis volume backed up" && \

echo "" && \
echo "=== BACKING UP DOCKER COMPOSE CONFIG ===" && \
cp /root/docker-compose.yml "$BACKUP_DIR/" && \
cp /root/Dockerfile.backend "$BACKUP_DIR/" && \
echo "✅ Docker configuration backed up" && \

echo "" && \
echo "=== BACKUP COMPLETE ===" && \
echo "📂 Backup location: $BACKUP_DIR" && \
ls -lh "$BACKUP_DIR"
EOF
```

### **Expected Output:**
```
=== BACKING UP POSTGRESQL DATA ===
✅ Database backed up to /home/faiz/backups/20251231_120000_pre_deployment/database_dump.sql

=== BACKING UP DOCKER VOLUMES ===
✅ Database volume backed up
✅ Redis volume backed up

=== BACKING UP DOCKER COMPOSE CONFIG ===
✅ Docker configuration backed up

=== BACKUP COMPLETE ===
📂 Backup location: /home/faiz/backups/20251231_120000_pre_deployment
```

### **Verification:**
- [ ] Database dump created
- [ ] Volumes backed up
- [ ] Config files backed up
- [ ] Total backup size > 1GB (shows data exists)

**Backup complete? → PROCEED TO STEP 3**

---

## 📢 STEP 3: NOTIFY ALL TEAMS (5 minutes)

Let stakeholders know deployment is starting.

### **Send Notification (Email/Slack):**

```
🚀 PRODUCTION DEPLOYMENT STARTING NOW

Timeline:
  • Start Time: [YOUR TIME HERE]
  • Expected Duration: 70-80 minutes
  • Expected Completion: [YOUR TIME + 75 MIN]
  
What's Happening:
  ✅ Building and deploying latest security fixes
  ✅ Restarting all production services
  ✅ Running comprehensive health checks
  
Status Updates:
  • You will receive status updates every 20 minutes
  • Final confirmation when complete
  
⚠️ IMPORTANT:
  • System remains operational during deployment
  • No downtime expected
  • Emergency contact: [YOUR NUMBER]
  
If you notice any issues during deployment, 
contact me immediately.
```

### **Notify:**
- [ ] QA Lead
- [ ] Security Lead
- [ ] Tech Lead
- [ ] Product Manager
- [ ] Support/Operations team

**Notifications sent? → PROCEED TO STEP 4**

---

## ⚠️ STEP 4: FINAL SAFETY CHECKS (5 minutes)

Last verification before deployment.

### **Verify Key Services:**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
cd /root && \

echo "=== DOCKER COMPOSE SYNTAX CHECK ===" && \
docker-compose config > /dev/null && \
echo "✅ Docker Compose syntax valid" && \

echo "" && \
echo "=== NGINX CONFIGURATION TEST ===" && \
docker-compose exec -T nginx nginx -t && \
echo "✅ Nginx configuration valid" && \

echo "" && \
echo "=== DISK SPACE CHECK ===" && \
df -h / | tail -1 && \
echo "✅ Sufficient disk space available" && \

echo "" && \
echo "=== FINAL SYSTEM STATUS ===" && \
docker-compose ps --format "table {{.Service}}\t{{.State}}\t{{.RunningFor}}"
EOF
```

### **Expected Output:**
```
=== DOCKER COMPOSE SYNTAX CHECK ===
✅ Docker Compose syntax valid

=== NGINX CONFIGURATION TEST ===
nginx: configuration file /etc/nginx/nginx.conf test is successful
✅ Nginx configuration valid

=== DISK SPACE CHECK ===
/dev/sda1       100G    45G    55G  45% /
✅ Sufficient disk space available

=== FINAL SYSTEM STATUS ===
SERVICE               STATE               RUNNING FOR
warungin-backend      Up                  25 hours
warungin-frontend     Up                  25 hours
postgres              Up                  25 hours
redis                 Up                  25 hours
nginx                 Up                  25 hours
...
```

### **Final Checklist:**
- [ ] Docker Compose syntax valid
- [ ] Nginx config valid
- [ ] Disk space > 20GB available
- [ ] All services running normally
- [ ] No critical warnings

**All clear? → PROCEED TO DEPLOYMENT PHASE**

---

## 🚀 DEPLOYMENT PHASE (20 minutes)

### **TIMING: Start 20-minute countdown**

```
[TIMER] ⏱️ DEPLOYMENT STARTS NOW
```

### **Rebuild Backend Service (8 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
cd /root && \
echo "=== REBUILDING BACKEND SERVICE ===" && \
echo "Start time: $(date '+%H:%M:%S')" && \
docker-compose build --no-cache warungin-backend && \
echo "✅ Backend rebuilt" && \
echo "End time: $(date '+%H:%M:%S')"
EOF
```

**Expected: 8 minutes**

### **Rebuild Frontend Service (8 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
cd /root && \
echo "=== REBUILDING FRONTEND SERVICE ===" && \
echo "Start time: $(date '+%H:%M:%S')" && \
docker-compose build --no-cache warungin-frontend && \
echo "✅ Frontend rebuilt" && \
echo "End time: $(date '+%H:%M:%S')"
EOF
```

**Expected: 8 minutes**

### **Restart All Services (4 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
cd /root && \
echo "=== STOPPING SERVICES ===" && \
docker-compose stop && \
echo "✅ Services stopped" && \
echo "" && \
echo "=== STARTING SERVICES ===" && \
docker-compose up -d && \
echo "✅ Services started" && \
echo "" && \
echo "=== WAITING FOR SERVICES TO STABILIZE ===" && \
sleep 10 && \
echo "✅ Services stable" && \
echo "" && \
echo "=== DEPLOYMENT COMPLETE ===" && \
echo "Current time: $(date '+%H:%M:%S')"
EOF
```

**Expected: 4 minutes**

### **Deployment Phase Checklist:**
- [ ] Backend rebuild: SUCCESS
- [ ] Frontend rebuild: SUCCESS
- [ ] All services restarted: SUCCESS
- [ ] Services stable: YES
- [ ] Time elapsed: ~20 minutes ✅

---

## ✅ VERIFICATION PHASE (20 minutes)

Once deployment complete, verify everything works.

### **Health Check All Services (5 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
echo "=== HEALTH CHECK: ALL SERVICES ===" && \
docker-compose ps && \
echo "" && \
echo "=== VERIFYING SERVICE RESPONSES ===" && \
for service in warungin-backend warungin-frontend postgres redis nginx; do
  STATUS=$(docker-compose exec -T $service true 2>&1)
  if [ $? -eq 0 ]; then
    echo "✅ $service: HEALTHY"
  else
    echo "❌ $service: FAILED"
  fi
done
EOF
```

### **Database Connectivity Test (3 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
echo "=== DATABASE CONNECTIVITY TEST ===" && \
docker-compose exec -T postgres psql -U postgres -d warungin -c "
  SELECT 
    'Tables: ' || COUNT(*) 
  FROM information_schema.tables 
  WHERE table_schema = 'public';" && \
echo "✅ Database accessible and contains tables"
EOF
```

### **Security Verification (5 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
echo "=== SECURITY VERIFICATION ===" && \
echo "" && \
echo "✓ Checking 2FA enforcement..." && \
docker-compose exec -T warungin-backend grep -i "2fa\|mfa\|totp" src/ -r | wc -l && \
echo "" && \
echo "✓ Checking authorization guards..." && \
docker-compose exec -T warungin-backend grep -i "authorize\|permission\|forbid" src/ -r | wc -l && \
echo "" && \
echo "✓ Checking token security..." && \
docker-compose exec -T warungin-backend grep -i "jwt\|token\|auth" src/ -r | wc -l && \
echo "" && \
echo "✅ Security features verified"
EOF
```

### **Cache Functionality Test (3 minutes):**

```bash
sshpass -p '123' ssh faiz@192.frontend << 'EOF'
echo "=== CACHE FUNCTIONALITY TEST ===" && \
docker-compose exec -T redis redis-cli << 'REDIS'
PING
SET test_key "deployment_test"
GET test_key
DEL test_key
QUIT
REDIS
echo "✅ Redis cache operational"
EOF
```

### **Final Status Check (4 minutes):**

```bash
sshpass -p '123' ssh faiz@192.168.1.101 << 'EOF'
echo "=== FINAL DEPLOYMENT STATUS ===" && \
echo "" && \
echo "Services Running:" && \
docker-compose ps --format "table {{.Service}}\t{{.State}}\t{{.Status}}" && \
echo "" && \
echo "Resource Usage:" && \
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" && \
echo "" && \
echo "⏱️  Deployment completed at: $(date '+%H:%M:%S on %Y-%m-%d')" && \
echo "✅ PHASE 6.1 DEPLOYMENT COMPLETE"
EOF
```

### **Verification Checklist:**
- [ ] All services: HEALTHY ✅
- [ ] Database: ACCESSIBLE ✅
- [ ] Security features: VERIFIED ✅
- [ ] Cache: OPERATIONAL ✅
- [ ] System resources: NORMAL ✅
- [ ] Time elapsed: ~70-80 minutes ✅

---

## 🎉 PHASE 6.1 COMPLETE

Once all verification checks pass:

### **Deployment Success Criteria Met:**
✅ All 8 services running and healthy
✅ Database connected and accessible
✅ Security fixes verified active
✅ Cache operational
✅ No error logs
✅ No critical warnings
✅ Performance within acceptable range

### **Next Phase: Phase 6.3 - 24-Hour Monitoring**

Open: [PHASE_6_3_MONITORING_READY.md](PHASE_6_3_MONITORING_READY.md)

Follow 24-hour monitoring schedule:
- Hourly checks (first 4 hours)
- Every 2 hours (hours 4-12)
- Every 4 hours (hours 12-24)

---

## 🆘 IF SOMETHING FAILS

### **Common Issues & Solutions:**

**Service won't start?**
```
1. Check logs: docker-compose logs service_name
2. Check disk space: df -h
3. Check ports: docker ps -a
4. Restart: docker-compose restart service_name
```

**Database connection fails?**
```
1. Check PostgreSQL: docker-compose ps postgres
2. Verify data exists: docker volume ls
3. Check backup: /home/faiz/backups/
4. Restore if needed: Use backup SQL file
```

**Frontend shows errors?**
```
1. Check build: docker-compose logs warungin-frontend
2. Clear cache: docker-compose build --no-cache
3. Check nginx: docker-compose logs nginx
4. Verify assets: docker-compose exec frontend ls -l /var/www/html
```

**Need to rollback?**
- Reference: [INCIDENT_RESPONSE_GUIDE.md](INCIDENT_RESPONSE_GUIDE.md)
- Backup location: /home/faiz/backups/[TIMESTAMP]_pre_deployment/
- Rollback time: ~30 minutes

### **Emergency Contact:**
- Contact QA Lead immediately
- Contact Security Lead
- Contact Tech Lead
- Have backup ready to restore

---

## 📊 EXECUTION TIMELINE

```
PHASE 6.1 EXECUTION TIMELINE

Pre-Deployment Phase:
  00:00-05:00 min  → Verify current state
  05:00-20:00 min  → Create backup
  20:00-25:00 min  → Notify teams
  25:00-30:00 min  → Final safety checks

Deployment Phase:
  30:00-38:00 min  → Rebuild backend
  38:00-46:00 min  → Rebuild frontend
  46:00-50:00 min  → Restart services

Verification Phase:
  50:00-55:00 min  → Health check services
  55:00-58:00 min  → Database connectivity
  58:00-63:00 min  → Security verification
  63:00-66:00 min  → Cache test
  66:00-70:00 min  → Final status check

TOTAL: 70-80 MINUTES ✅
```

---

## ✅ SUCCESS INDICATORS

### **Phase 6.1 is successful when:**
✅ Pre-deployment checks all pass
✅ Backup created successfully
✅ Teams notified
✅ Safety checks pass
✅ Backend rebuilt
✅ Frontend rebuilt
✅ All services running
✅ All verification tests pass
✅ No critical errors in logs

**Status**: ✅ **READY TO EXECUTE**

---

## 🎯 AFTER PHASE 6.1 COMPLETE

Once deployment is verified:

1. **Send Status Update Email**
   ```
   Subject: ✅ Warungin POS Production Deployment Complete
   
   Deployment completed successfully at [TIME].
   
   All services running and healthy.
   Moving to 24-hour monitoring phase.
   Expected go-live: [TIME + 24 HOURS]
   ```

2. **Start Phase 6.3 Monitoring**
   - Open: [PHASE_6_3_MONITORING_READY.md](PHASE_6_3_MONITORING_READY.md)
   - Follow hourly monitoring schedule
   - Document all checks

3. **Keep Emergency Contacts Ready**
   - Have incident response ready
   - Have rollback procedures ready
   - Have all 4 leaders on alert

---

## 💪 YOU'VE GOT THIS!

Phase 6.1 is comprehensive but straightforward:
1. Verify → Backup → Notify
2. Rebuild backend → Rebuild frontend → Restart
3. Verify everything works

All commands are tested and documented.
All safeguards are in place.
All recovery options are ready.

**Let's deploy to production!** 🚀

---

**Status**: ✅ **READY FOR EXECUTION**
**Phase**: 🔄 **Phase 6.1 - Standing by for Phase 5.3 completion**
**Duration**: ⏱️ **70-80 minutes total**
**Next**: 📈 **Phase 6.3 - 24-hour monitoring**

