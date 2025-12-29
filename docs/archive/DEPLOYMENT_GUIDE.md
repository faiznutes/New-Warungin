# Deployment Guide - SSH Server

## Quick Commands

### 1. Check Current Status
```bash
wsl bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c \"cd /root/New-Warungin && docker compose ps\"'"
```

### 2. Pull Latest Code
```bash
wsl bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c \"cd /root/New-Warungin && git pull origin main || git pull upstream main\"'"
```

### 3. Rebuild and Restart
```bash
wsl bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c \"cd /root/New-Warungin && docker compose down && docker compose build --no-cache && docker compose up -d\"'"
```

### 4. Reset Superadmin Password
```bash
wsl bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c \"cd /root/New-Warungin && SUPERADMIN_PASSWORD=SuperAdmin123! docker compose exec -T backend node scripts/reset-superadmin.js\"'"
```

### 5. Check Health Status
```bash
wsl bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c \"cd /root/New-Warungin && docker compose ps --format \\\"table {{.Name}}\\t{{.Status}}\\t{{.Health}}\\\"\"'"
```

### 6. View Logs
```bash
wsl bash -c "sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c \"cd /root/New-Warungin && docker compose logs --tail=50\"'"
```

## Full Deployment Script

Use the automated script:
```bash
cd /mnt/f/Backup\ W11/Project/New-Warungin
./scripts/deploy-and-reset-admin.sh
```

Or set custom password:
```bash
SUPERADMIN_PASSWORD=YourPassword123! ./scripts/deploy-and-reset-admin.sh
```

## Manual Steps

### Step 1: Connect to Server
```bash
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101
```

### Step 2: Switch to Root
```bash
su -
# Password: 123
```

### Step 3: Navigate to Project
```bash
cd /root/New-Warungin
```

### Step 4: Pull Latest Code
```bash
git pull origin main || git pull upstream main
```

### Step 5: Stop Containers
```bash
docker compose down
```

### Step 6: Rebuild Containers
```bash
docker compose build --no-cache
```

### Step 7: Start Containers
```bash
docker compose up -d
```

### Step 8: Wait for Database
```bash
sleep 10
docker compose exec postgres pg_isready -U postgres
```

### Step 9: Run Migrations
```bash
docker compose exec backend npm run prisma:migrate:safe
```

### Step 10: Reset Superadmin
```bash
SUPERADMIN_PASSWORD=SuperAdmin123! docker compose exec backend node scripts/reset-superadmin.js
```

### Step 11: Check Health
```bash
docker compose ps
```

## Superadmin Credentials

After reset:
- **Email:** admin@warungin.com
- **Password:** SuperAdmin123! (or custom if set)

## Troubleshooting

### Container Not Starting
```bash
docker compose logs [service_name]
```

### Database Connection Issues
```bash
docker compose exec postgres psql -U postgres -d warungin -c "SELECT 1;"
```

### Backend Health Check
```bash
docker compose exec backend wget --quiet --tries=1 --spider http://localhost:3000/health
```

### Frontend Health Check
```bash
docker compose exec frontend wget --quiet --tries=1 --spider http://localhost:80
```

### Restart Specific Service
```bash
docker compose restart [service_name]
```

### View Real-time Logs
```bash
docker compose logs -f [service_name]
```

## Notes

- All commands must be run as root (use `su -`)
- Project directory is `/root/New-Warungin`
- Default superadmin password: `SuperAdmin123!`
- SSH password: `123`
- Server IP: `192.168.1.101`

