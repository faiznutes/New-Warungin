# Deployment Summary & Instructions

## ✅ Completed Tasks

### 1. Git Commit & Push
- ✅ All changes committed locally
- ⚠️ SSH push requires SSH key setup (can be done manually)
- **Commit:** `feat: Add 28 UX enhancement features`

### 2. Scripts Created
- ✅ `scripts/reset-superadmin.js` - Reset superadmin password
- ✅ `scripts/deploy-and-reset-admin.sh` - Full deployment script
- ✅ `scripts/check-health-ssh.sh` - Health check script
- ✅ `DEPLOYMENT_GUIDE.md` - Complete deployment documentation

### 3. Package.json Updated
- ✅ Added `reset:superadmin` script

## 🚀 Deployment Steps (Manual)

Karena PowerShell tidak support `&&` dalam command line, gunakan script atau jalankan perintah satu per satu:

### Option 1: Use WSL Terminal Directly

Buka WSL terminal dan jalankan:

```bash
# 1. Check current status
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - root -c "cd /root/New-Warungin && docker compose ps"'

# 2. Pull latest code
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - root -c "cd /root/New-Warungin && git pull origin main || git pull upstream main"'

# 3. Rebuild and restart
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - root -c "cd /root/New-Warungin && docker compose down && docker compose build --no-cache && docker compose up -d"'

# 4. Wait for database
sleep 10

# 5. Reset superadmin
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - root -c "cd /root/New-Warungin && SUPERADMIN_PASSWORD=SuperAdmin123! docker compose exec -T backend node scripts/reset-superadmin.js"'

# 6. Check health
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - root -c "cd /root/New-Warungin && docker compose ps"'
```

### Option 2: Use Deployment Script

```bash
# In WSL terminal
cd /mnt/f/Backup\ W11/Project/New-Warungin
./scripts/deploy-and-reset-admin.sh
```

### Option 3: SSH into Server and Run Commands

```bash
# Connect to server
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101

# Switch to root
su -
# Password: 123

# Navigate to project
cd /root/New-Warungin

# Pull latest code
git pull origin main || git pull upstream main

# Stop containers
docker compose down

# Rebuild
docker compose build --no-cache

# Start containers
docker compose up -d

# Wait for database
sleep 10

# Run migrations
docker compose exec backend npm run prisma:migrate:safe

# Reset superadmin
SUPERADMIN_PASSWORD=SuperAdmin123! docker compose exec backend node scripts/reset-superadmin.js

# Check health
docker compose ps
```

## 🔐 Superadmin Credentials

After running reset script:
- **Email:** admin@warungin.com
- **Password:** SuperAdmin123! (default) or custom if set via `SUPERADMIN_PASSWORD` env var

## 📋 Files Created/Modified

### New Files:
1. `scripts/reset-superadmin.js` - Reset superadmin password script
2. `scripts/deploy-and-reset-admin.sh` - Full deployment automation
3. `scripts/check-health-ssh.sh` - Health check script
4. `DEPLOYMENT_GUIDE.md` - Complete deployment documentation
5. `DEPLOYMENT_SUMMARY.md` - This file

### Modified Files:
1. `package.json` - Added `reset:superadmin` script

## ⚠️ Important Notes

1. **SSH Key Setup**: If SSH push fails, you need to set up SSH keys:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ssh-copy-id faiz@192.168.1.101
   ```

2. **PowerShell Limitation**: PowerShell doesn't support `&&` in command line. Use WSL terminal directly or run commands one by one.

3. **Root Access Required**: All Docker commands must be run as root. Use `su -` after SSH connection.

4. **Project Directory**: Always use `/root/New-Warungin` (absolute path).

5. **Database Wait Time**: Wait at least 10 seconds after starting containers before running migrations.

## 🏥 Health Check

After deployment, verify all services are healthy:

```bash
# Check container status
docker compose ps

# Check backend health
docker compose exec backend wget --quiet --tries=1 --spider http://localhost:3000/health

# Check frontend health
docker compose exec frontend wget --quiet --tries=1 --spider http://localhost:80

# Check database
docker compose exec postgres pg_isready -U postgres
```

## 📝 Next Steps

1. **Push to SSH Remote** (if SSH key is set up):
   ```bash
   git push upstream main
   ```

2. **Or manually copy files** to server if needed

3. **Run deployment script** on server

4. **Verify health** of all containers

5. **Test login** with new superadmin credentials

## 🔧 Troubleshooting

### Container Not Starting
```bash
docker compose logs [service_name]
```

### Database Connection Error
```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT 1;"
```

### Reset Superadmin Again
```bash
SUPERADMIN_PASSWORD=YourNewPassword123! docker compose exec backend node scripts/reset-superadmin.js
```

---

**Status:** ✅ Scripts ready, manual deployment required due to PowerShell limitations

