#!/bin/bash
# Instructions untuk deploy dari PowerShell Native (bukan WSL)

cat << 'EOF'
========================================
PHASE 35 Deployment Instructions
========================================

WSL2 network isolated, tidak bisa reach 192.168.1.101 directly.

SOLUSI: Gunakan PowerShell Native (bukan WSL)

Step 1: Buka PowerShell (Admin)
========================================
Press Win+X, pilih "Windows PowerShell (Admin)"

Step 2: Test SSH connection
========================================
# Test koneksi ke server
ssh -V
Test-NetConnection -ComputerName 192.168.1.101 -Port 22

Step 3: Gunakan sshpass dari PowerShell
========================================
# Install sshpass jika belum ada (via Chocolatey)
choco install sshpass -y

# Test SSH dengan sshpass
sshpass -p 123 ssh -o StrictHostKeyChecking=no root@192.168.1.101 'pwd'

Step 4: Deploy PHASE 35
========================================

## Option A: PowerShell (Recommended - from native PowerShell, not WSL)
powershell -ExecutionPolicy Bypass -File "f:\Backup W11\Project\New-Warungin\scripts\deploy-production.ps1"

## Option B: Bash/WSL
bash scripts/deploy-production.sh

## Option C: Manual SSH
sshpass -p "123" ssh root@192.168.1.101

Step 5: Verify deployment
========================================
# SSH to server
sshpass -p 123 ssh root@192.168.1.101

# Check app status
curl http://localhost:3000/health

# View logs
tail -f /root/New-Warungin/logs/application.log

========================================
Note: Copy paste commands di PowerShell, satu per satu
========================================
EOF
