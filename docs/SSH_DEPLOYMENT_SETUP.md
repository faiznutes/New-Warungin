# SSH Deployment Setup Guide

**Status**: ✅ Complete & Verified
**WSL**: ✅ Installed
**sshpass**: ✅ Installed  
**SSH Connection**: ✅ Working
**Server**: ✅ Debian 13 (192.168.1.101)
**Docker**: ✅ Running

---

## Setup Summary

✅ **WSL 2 (Ubuntu) Installed**
✅ **sshpass Tool Installed**
✅ **SSH Connection Verified**
✅ **Server Accessible**
✅ **Docker Running on Server**
✅ **Project Folder Exists**: /root/New-Warungin

---

## Connection Details

| Item | Value |
|------|-------|
| **Host** | 192.168.1.101 |
| **User** | faiz |
| **Password** | 123 |
| **Root Password** | 123 |
| **OS** | Debian 13 |
| **Project Path** | /root/New-Warungin |
| **Docker Status** | ✅ Active (running) |

---

## Verified Services

### Docker Containers Running
```
✅ warungin-frontend     - Frontend app (port 80)
✅ warungin-backend      - Backend API (port 3000)
✅ warungin-postgres     - PostgreSQL database
✅ warungin-redis        - Redis cache
✅ warungin-nginx        - Nginx reverse proxy (port 80, 443)
✅ warungin-loki         - Log aggregation (port 3100)
✅ warungin-promtail     - Log shipper
✅ warungin-cloudflared  - Cloudflare tunnel
```

### Docker System Status
```
- Docker Daemon: Active & Running
- Memory Usage: 965.9M
- Running Containers: 8
- Active Services: All Healthy
```

---

## Quick Commands (Copy-Paste Ready)

### 1. Test SSH Connection
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo SSH Connected; hostname; date'"
```

### 2. Check Docker Containers
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker ps'"
```

### 3. Check Project Directory
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S ls -la /root/New-Warungin | head -20'"
```

### 4. View Docker Logs
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker logs warungin-backend -n 20'"
```

### 5. Navigate to Project & List Files
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S bash -c \"cd /root/New-Warungin && ls -la\"'"
```

---

## Deployment Workflow (Step by Step)

### Step 1: Connect to Server
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101"
```
Expected: Login to faiz user

### Step 2: Become Root
```bash
su - 
# Password: 123
```
Expected: Prompt becomes `root@debian:~#`

### Step 3: Navigate to Project
```bash
cd /root/New-Warungin
pwd
ls -la
```
Expected: Should show project files

### Step 4: Check Docker
```bash
docker --version
docker ps
docker-compose ps
```
Expected: Docker commands work, containers listed

### Step 5: Pull Latest Code
```bash
git status
git pull origin main
```
Expected: Code updated from git

### Step 6: Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```
Expected: node_modules folder created

### Step 7: Build Backend
```bash
npm run build
ls -la dist/
```
Expected: Compiled files in dist/ folder

### Step 8: Build Frontend
```bash
cd client
npm run build
ls -la dist/
cd ..
```
Expected: Built files in client/dist/

### Step 9: Build Docker Images
```bash
docker build -f Dockerfile.backend -t warungin-backend:staging .
docker build -f client/Dockerfile -t warungin-client:staging ./client
docker images | grep warungin
```
Expected: 2 new images: warungin-backend:staging, warungin-client:staging

### Step 10: Start Services
```bash
docker-compose up -d
docker-compose ps
```
Expected: All services running (Status = Up)

### Step 11: Verify Deployment
```bash
docker-compose logs -f api
curl http://localhost:3000/api/health
```
Expected: API responding with health status

---

## Remote Execution Scripts

### Script 1: Full Automated Deployment
```bash
# Run entire deployment in one command
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S bash -c \"
cd /root/New-Warungin
git pull origin main
npm install
cd client && npm install && cd ..
npm run build
cd client && npm run build && cd ..
docker build -f Dockerfile.backend -t warungin-backend:staging .
docker build -f client/Dockerfile -t warungin-client:staging ./client
docker-compose up -d
docker-compose ps
echo 'Deployment Complete!'
\"'"
```

### Script 2: Quick Status Check
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S bash -c \"
echo '=== Project Status ===' 
cd /root/New-Warungin && pwd && ls -la | head -10
echo 
echo '=== Docker Services ===' 
docker ps --format 'table {{.Names}}\t{{.Status}}'
echo 
echo '=== Disk Usage ===' 
df -h | grep -E 'Size|root'
\"'"
```

### Script 3: Logs & Diagnostics
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S bash -c \"
echo '=== Backend Logs (Last 20 Lines) ===' 
docker logs warungin-backend -n 20
echo 
echo '=== Frontend Status ===' 
docker logs warungin-frontend -n 10
echo 
echo '=== Database Status ===' 
docker logs warungin-postgres -n 5
\"'"
```

### Script 4: Stop All Services
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S bash -c \"
cd /root/New-Warungin
docker-compose down
echo 'All services stopped'
\"'"
```

---

## Environment Variables

### Server SSH Connection Info
```
REMOTE_HOST=192.168.1.101
REMOTE_USER=faiz
REMOTE_PASS=123
REMOTE_ROOT_PASS=123
REMOTE_PROJECT_PATH=/root/New-Warungin
```

### WSL Configuration
```
WSL_DISTRO=Ubuntu
SSH_TOOL=sshpass
```

---

## Troubleshooting

### Issue: "Connection refused"
```bash
# Verify SSH server is running on remote
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'systemctl status ssh'"

# If not running:
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S systemctl start ssh'"
```

### Issue: "Permission denied (publickey)"
```bash
# Ensure password auth is enabled in /etc/ssh/sshd_config
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S grep PasswordAuthentication /etc/ssh/sshd_config'"

# Should output: PasswordAuthentication yes
```

### Issue: "Docker permission denied"
```bash
# Ensure user in docker group or use sudo
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'groups faiz'"

# If docker not in groups, use sudo for docker commands
```

### Issue: "sshpass: command not found"
```bash
# Reinstall sshpass in WSL
wsl.exe -d Ubuntu -- bash -c "sudo apt-get update && sudo apt-get install -y sshpass"
```

---

## Next Steps

1. **Option A - Manual Deployment**
   - SSH into server manually
   - Run build & deployment steps one by one
   - Monitor logs

2. **Option B - Automated Deployment**
   - Use Script 1 above for full automated deployment
   - Monitor progress
   - Verify with Script 2

3. **Option C - Scheduled Deployment**
   - Set up cron job on server
   - Or use scheduled task in Windows

---

## File Locations Reference

| Item | Path |
|------|------|
| Project Root | /root/New-Warungin |
| Backend Source | /root/New-Warungin/src |
| Frontend Source | /root/New-Warungin/client/src |
| Docker Compose | /root/New-Warungin/docker-compose.yml |
| Docker Images | Custom built: warungin-backend:staging, warungin-client:staging |
| Logs | Inside containers via `docker logs` |
| Database | warungin-postgres container |

---

## Monitoring & Health Checks

### Check All Services Health
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker ps --format \"{{.Names}}\t{{.Status}}\"'"
```

### Test API Endpoint
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S curl -s http://localhost:3000/api/health'"
```

### View Real-time Logs
```bash
wsl.exe -d Ubuntu -- bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | sudo -S docker-compose logs -f api'"
```

---

## Document Information

| Info | Value |
|------|-------|
| **Created** | December 31, 2025 |
| **Status** | ✅ Verified & Working |
| **WSL Version** | Ubuntu (WSL 2) |
| **sshpass Version** | 1.09-1 |
| **SSH Status** | ✅ Connected |
| **Server Verified** | ✅ Yes |

---

**Next Action**: Ready for automated deployment or manual build commands on server!
