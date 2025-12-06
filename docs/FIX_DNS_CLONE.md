# 🔧 Fix DNS & Clone Repository Root

## Masalah: "Could not resolve host: github.com"

Ini berarti VPS tidak bisa resolve DNS untuk github.com. Berikut solusinya:

## ✅ Solusi 1: Fix DNS (Recommended)

Jalankan command berikut di VPS:

```bash
# 1. Backup resolv.conf
sudo cp /etc/resolv.conf /etc/resolv.conf.backup

# 2. Set Google DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf

# 3. Test DNS
ping -c 3 github.com

# 4. Clone repository
cd /home/warungin
git clone https://YOUR_GITHUB_TOKENKpQBqVwr7Xk6YmdkSqHuKlumGirBTE0Oab0p@github.com/faiznutes/Root.git Warungin
cd Warungin
```

## ✅ Solusi 2: Download via ZIP (Jika DNS masih bermasalah)

```bash
# 1. Download repository sebagai ZIP
cd /home/warungin
curl -L -H "Authorization: token YOUR_GITHUB_TOKENKpQBqVwr7Xk6YmdkSqHuKlumGirBTE0Oab0p" \
  https://api.github.com/repos/faiznutes/Root/zipball/main -o Root.zip

# 2. Extract
unzip Root.zip

# 3. Rename directory
mv faiznutes-Root-* Warungin

# 4. Cleanup
rm Root.zip

# 5. Masuk ke directory
cd Warungin
```

## ✅ Solusi 3: Setup DNS Permanen

Agar DNS tidak reset setelah reboot:

```bash
# Edit network config (Ubuntu/Debian)
sudo nano /etc/systemd/resolved.conf

# Uncomment dan set:
DNS=8.8.8.8 8.8.4.4

# Restart service
sudo systemctl restart systemd-resolved

# Atau untuk older systems:
sudo nano /etc/resolvconf/resolv.conf.d/base
# Add:
nameserver 8.8.8.8
nameserver 8.8.4.4

sudo resolvconf -u
```

## ✅ Solusi 4: Clone via SSH (Jika punya SSH key)

```bash
# 1. Generate SSH key (jika belum ada)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 2. Copy public key
cat ~/.ssh/id_rsa.pub

# 3. Add ke GitHub: Settings > SSH and GPG keys > New SSH key

# 4. Clone via SSH
cd /home/warungin
git clone git@github.com:faiznutes/Root.git Warungin
cd Warungin
```

## ✅ Solusi 5: Manual Copy dari Local

Jika semua gagal, copy dari komputer lokal:

```bash
# Di komputer lokal (Windows):
# 1. Zip folder New-Warungin
# 2. Upload ke VPS via SCP:
scp -r "F:\Backup W11\Github\Warungin\New-Warungin" warungin@your-vps-ip:/home/warungin/Warungin

# Atau via WinSCP/FTP client
```

## 🚀 Setelah Clone Berhasil

Setelah repository berhasil di-clone, lanjutkan setup:

```bash
cd /home/warungin/Warungin

# Jalankan setup script
chmod +x scripts/vps-setup-root.sh
bash scripts/vps-setup-root.sh
```

## 🔍 Troubleshooting

### Test Koneksi Internet
```bash
# Test ping ke Google DNS
ping -c 3 8.8.8.8

# Test DNS resolution
nslookup github.com

# Test HTTPS connection
curl -I https://github.com
```

### Check Firewall
```bash
# Check UFW status
sudo ufw status

# Allow outbound connections (usually already allowed)
sudo ufw allow out 53/tcp  # DNS
sudo ufw allow out 443/tcp # HTTPS
```

### Check Proxy (Jika ada)
```bash
# Check proxy settings
echo $http_proxy
echo $https_proxy

# Set proxy jika diperlukan
export http_proxy=http://proxy:port
export https_proxy=http://proxy:port
```

---

**Pilih solusi yang paling sesuai dengan kondisi VPS Anda!**

