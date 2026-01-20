# WSL2 Local Network Access Setup Guide

## Problem
WSL2 memiliki network bridge terpisah (172.27.x.x) yang tidak bisa reach local network (192.168.1.x). SSH ke `root@192.168.1.101` dari WSL menghasilkan error: **"No route to host"**.

## Solution: Enable Mirrored Networking

WSL2 v1.10+ support mirrored networking untuk akses local network.

### Step 1: Edit `.wslconfig` File

**Lokasi**: `C:\Users\<YourUsername>\.wslconfig`

Jika file belum ada, buat file baru dengan content:

```ini
[wsl2]
# Enable mirrored networking to access local network
networkingMode=mirrored
firewall=false
```

### Step 2: Restart WSL

Jalankan di PowerShell (Admin):

```powershell
# Shutdown WSL
wsl --shutdown

# Restart WSL (pilih salah satu)
wsl -d Ubuntu  # Or your WSL distro name
# atau buka Windows Terminal dan select Ubuntu
```

### Step 3: Test SSH Connection

Di WSL terminal:

```bash
# Test ping
ping -c 2 192.168.1.101

# Test SSH dengan sshpass
sshpass -p '123' ssh root@192.168.1.101 'pwd'

# Or test interactive
sshpass -p '123' ssh root@192.168.1.101
```

## Current Test Results

```
❌ WSL2 Default (isolated network): Cannot reach 192.168.1.101
✅ WSL2 Mirrored Mode (after setup): Should reach 192.168.1.101
```

## Troubleshooting

### If mirrored networking doesn't work:

**Option A: Use Bridged Networking**

Edit `.wslconfig`:
```ini
[wsl2]
networkingMode=bridged
bridgeInterface=Ethernet
```

(Ganti `Ethernet` dengan nama network adapter Anda, lihat via `ipconfig`)

**Option B: Use SSH Key Instead of Password**

```bash
# Generate SSH key (dari WSL atau PowerShell)
ssh-keygen -t ed25519 -C "deployment@warungin"

# Copy public key ke server
sshpass -p '123' ssh-copy-id -i ~/.ssh/id_ed25519.pub root@192.168.1.101

# Test koneksi tanpa password
ssh root@192.168.1.101 'pwd'
```

**Option C: SSH dari PowerShell Native (Bypass WSL)**

Open PowerShell (not WSL):
```powershell
# Test koneksi
Test-NetConnection -ComputerName 192.168.1.101 -Port 22

# Install sshpass via Chocolatey (if needed)
choco install sshpass

# SSH dengan sshpass
sshpass -p '123' ssh root@192.168.1.101 'pwd'
```

## Deployment setelah Setup

Setelah `.wslconfig` dikonfigurasi dan WSL di-restart:

```bash
# Dari WSL terminal
cd /mnt/f/Backup\ W11/Project/New-Warungin

# Test SSH
sshpass -p '123' ssh root@192.168.1.101 'echo Connected!'

# Run deployment script
./scripts/deploy-ssh.sh

# Atau manual deploy
sshpass -p '123' ssh root@192.168.1.101 << 'EOF'
cd /root/New-Warungin
git pull origin main
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
EOF
```

## WSL Versions Support

- **WSL2 v1.10+**: Mirrored networking fully supported
- **WSL2 v1.9 or older**: Need to upgrade WSL or use alternative solution

Check WSL version:
```powershell
wsl --version
```

Update WSL:
```powershell
wsl --update
```

## Security Notes

- ⚠️ Jangan commit `.wslconfig` ke git (add ke `.gitignore`)
- ✅ Password `123` hanya untuk development, gunakan SSH key untuk production
- ✅ Pertimbangkan firewall rules di server untuk restrict SSH access

---

**Status**: WSL networking isolated, awaiting `.wslconfig` setup
**Next**: Edit `.wslconfig` dan restart WSL, kemudian test SSH connection
