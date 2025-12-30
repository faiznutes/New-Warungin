# 🚀 DEPLOYMENT PHASE 6.1 - DIRECT EXECUTION GUIDE

**Status**: Ready to deploy
**Server**: 192.168.1.101
**User**: faiz (home: /home/faiz)
**Docker Setup**: /root (requires sudo access)

---

## ⚠️ PERMISSIONS ISSUE FOUND

**Current situation**:
- ✅ Server accessible via SSH
- ✅ Docker services running (25+ hours uptime from earlier)
- ❌ Faiz user cannot access /root directory
- ❌ Docker commands require sudo which needs password

---

## 🔧 SOLUTION: Two Options

### **Option A: SSH As Root (Recommended for deployment)**

If you have root SSH access:
```bash
# SSH as root directly
ssh root@192.168.1.101
# Then deploy from /root
```

### **Option B: Faiz User with Sudo Passwordless**

Setup passwordless sudo for faiz:
```bash
# As root, add to sudoers:
echo "faiz ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Then faiz can:
sudo docker-compose -f /root/docker-compose.yml ps
```

### **Option C: Faiz Can Do Deployment From Local Backup**

Create Docker build locally on Windows:
- Pull latest code from GitHub
- Build Docker images locally
- Push to Docker registry or server via SCP

---

## 🎯 WHAT YOU NEED TO DO

**Answer these questions:**

1. **Do you have ROOT access to 192.168.1.101?**
   - YES → We use root SSH for deployment
   - NO → We need to setup passwordless sudo or alternative

2. **Can you access server terminal directly (not SSH)?**
   - YES → Can manually setup permissions
   - NO → Limited to current faiz SSH access

3. **What's the docker-compose.yml location?**
   - /root/docker-compose.yml (from earlier logs)?
   - /home/faiz/docker-compose.yml?
   - Other location?

---

## 📋 DEPLOYMENT STEPS (Once permissions resolved)

Once you clarify above, here's exact deployment:

### **Step 1: Pull Latest Code**
```bash
cd /root  # or your project directory
git remote set-url origin https://github.com/faiznutes/New-Warungin
git pull origin main
```

### **Step 2: Create Backup**
```bash
# Backup database
docker-compose exec -T postgres pg_dump -U postgres warungin > backup_$(date +%s).sql

# Backup volumes
docker run --rm -v warungin_postgres_data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_volume.tar.gz -C /data .
```

### **Step 3: Build Docker Images**
```bash
# Build backend
docker-compose build --no-cache warungin-backend

# Build frontend
docker-compose build --no-cache warungin-frontend
```

### **Step 4: Restart Services**
```bash
docker-compose down
docker-compose up -d
docker-compose ps
```

### **Step 5: Verify Deployment**
```bash
# Check services
docker-compose ps

# Check database
docker-compose exec -T postgres psql -U postgres warungin -c "SELECT 'OK';"

# Check Redis
docker-compose exec -T redis redis-cli ping

# Check logs
docker-compose logs --tail=50
```

---

## 🆘 NEXT STEPS

**Please tell me:**

```
1. Root access: YES / NO
2. Direct terminal access: YES / NO
3. Docker location: /root / other
4. Your preference: Option A / B / C
```

**Then I will:**
- Guide exact deployment commands
- Monitor real-time progress
- Handle any errors
- Complete Phase 6.1 and 6.3

---

**Reply with the 4 items above and I'll proceed with deployment.** 🚀

