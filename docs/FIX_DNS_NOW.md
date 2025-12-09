# 🔧 Fix DNS Sekarang - Command Langsung

## ⚡ Quick Fix DNS (Jalankan Sekarang)

```bash
# 1. Fix DNS dengan Google DNS
sudo bash -c 'cat > /etc/resolv.conf << EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
EOF'

# 2. Test DNS
ping -c 3 8.8.8.8
ping -c 3 github.com

# 3. Test HTTPS
curl -I https://github.com --max-time 5
```

## 🔍 Check Masalah Network

```bash
# Check internet connection
ping -c 3 8.8.8.8

# Check DNS resolution
nslookup github.com
host github.com

# Check current DNS
cat /etc/resolv.conf
```

## ✅ Alternatif: Download via IP Address (Jika DNS Masih Gagal)

Jika DNS masih tidak bisa, kita bisa coba download langsung via IP atau gunakan mirror:

```bash
# Method 1: Download via wget dengan IP GitHub
# (Tidak recommended karena IP bisa berubah)

# Method 2: Setup DNS di /etc/hosts
echo "140.82.121.3 github.com" | sudo tee -a /etc/hosts
echo "140.82.121.3 api.github.com" | sudo tee -a /etc/hosts

# Test lagi
ping -c 3 github.com
```

## 🚀 Solusi Terbaik: Manual Upload dari Local

Karena DNS bermasalah, cara tercepat adalah upload dari komputer lokal:

### Di Windows (PowerShell):

```powershell
# Upload folder ke VPS
scp -r "F:\Backup W11\Github\Warungin\New-Warungin\*" root@your-vps-ip:/home/warungin/Warungin/

# Atau zip dulu lalu upload
cd "F:\Backup W11\Github\Warungin\New-Warungin"
Compress-Archive -Path * -DestinationPath Warungin.zip
scp Warungin.zip root@your-vps-ip:/home/warungin/
```

### Di VPS (setelah upload):

```bash
cd /home/warungin
unzip Warungin.zip -d Warungin
cd Warungin
rm ../Warungin.zip
```

## 🔧 Fix DNS Permanen (Agar Tidak Reset)

```bash
# Untuk systemd-resolved (Ubuntu 18.04+)
sudo nano /etc/systemd/resolved.conf

# Uncomment dan set:
DNS=8.8.8.8 8.8.4.4
FallbackDNS=1.1.1.1

# Restart
sudo systemctl restart systemd-resolved
sudo systemctl enable systemd-resolved

# Atau untuk older systems:
sudo nano /etc/resolvconf/resolv.conf.d/base
# Add:
nameserver 8.8.8.8
nameserver 8.8.4.4

sudo resolvconf -u
```

## 📋 Checklist Troubleshooting

1. ✅ Internet connection OK? (`ping 8.8.8.8`)
2. ✅ DNS server configured? (`cat /etc/resolv.conf`)
3. ✅ DNS resolution working? (`ping github.com`)
4. ✅ Firewall blocking? (`sudo ufw status`)
5. ✅ Proxy needed? (`echo $http_proxy`)

---

**Coba fix DNS dulu, jika masih gagal gunakan manual upload!**

