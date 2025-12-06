# 🔍 Check Network & Solusi

## Step 1: Check Internet Connection

```bash
# Test koneksi internet langsung ke IP (bypass DNS)
ping -c 3 8.8.8.8

# Jika ini juga gagal, berarti tidak ada koneksi internet
# Jika berhasil, berarti masalahnya di DNS resolution
```

## Step 2: Check Network Interface

```bash
# Check network interfaces
ip addr show
# atau
ifconfig

# Check routing
ip route show
# atau
route -n

# Check apakah ada default gateway
```

## Step 3: Check Firewall

```bash
# Check iptables
sudo iptables -L -n

# Check UFW
sudo ufw status

# Allow DNS jika firewall aktif
sudo ufw allow out 53/tcp
sudo ufw allow out 53/udp
sudo ufw allow out 443/tcp
sudo ufw allow out 80/tcp
```

## Step 4: Try Alternative DNS Methods

```bash
# Method 1: Use /etc/hosts (hardcode IP)
# Get GitHub IP first (dari komputer lain atau browser)
# GitHub IP biasanya: 140.82.121.3 atau 140.82.121.4

echo "140.82.121.3 github.com" | sudo tee -a /etc/hosts
echo "140.82.121.3 api.github.com" | sudo tee -a /etc/hosts
echo "140.82.121.3 codeload.github.com" | sudo tee -a /etc/hosts

# Test
ping -c 3 github.com
```

## Step 5: Check DNS Service

```bash
# Check systemd-resolved
sudo systemctl status systemd-resolved

# Restart DNS service
sudo systemctl restart systemd-resolved

# Flush DNS cache
sudo systemd-resolve --flush-caches
```

## 🚀 Solusi Paling Praktis: Upload Manual

Karena DNS bermasalah, cara tercepat adalah upload dari komputer lokal:

### Di Windows PowerShell:

```powershell
# 1. Masuk ke directory project
cd "F:\Backup W11\Github\Warungin\New-Warungin"

# 2. Upload semua file (ganti IP dengan IP VPS Anda)
# Jika menggunakan scp:
scp -r * root@your-vps-ip:/home/warungin/Warungin/

# Atau jika scp tidak tersedia, gunakan WinSCP:
# - Download WinSCP: https://winscp.net/
# - Connect ke VPS
# - Upload folder New-Warungin ke /home/warungin/Warungin
```

### Atau Zip & Upload:

```powershell
# Di Windows
cd "F:\Backup W11\Github\Warungin"
Compress-Archive -Path "New-Warungin\*" -DestinationPath "Warungin.zip"

# Upload zip ke VPS
scp Warungin.zip root@your-vps-ip:/home/warungin/
```

### Di VPS (setelah upload):

```bash
cd /home/warungin

# Jika upload sebagai zip
unzip Warungin.zip -d Warungin
cd Warungin
rm ../Warungin.zip

# Jika upload langsung folder
cd Warungin

# Setup
cp env.example .env
nano .env  # Edit konfigurasi

# Build dan start
docker compose build
docker compose up -d

# Tunggu dan create super admin
sleep 30
docker compose exec backend node scripts/create-super-admin-docker.js
```

---

**Rekomendasi: Upload manual dari local lebih cepat dan reliable!**

