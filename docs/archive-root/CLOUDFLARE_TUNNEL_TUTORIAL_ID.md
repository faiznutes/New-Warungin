# 🌐 TUTORIAL LENGKAP: CloudFlare Tunnel + DNS Setup

**Target**: Akses `pos.faiznute.site` dari internet dan terhubung ke server lokal Anda

---

## 📋 DAFTAR ISI
1. [Persyaratan](#persyaratan)
2. [STEP 1: Verifikasi Tunnel di Windows](#step-1-verifikasi-tunnel-di-windows)
3. [STEP 2: Login CloudFlare](#step-2-login-cloudflare)
4. [STEP 3: Setup Tunnel di CloudFlare](#step-3-setup-tunnel-di-cloudflare)
5. [STEP 4: Konfigurasi Public Hostname](#step-4-konfigurasi-public-hostname)
6. [STEP 5: Setup DNS Records](#step-5-setup-dns-records)
7. [STEP 6: Test Koneksi](#step-6-test-koneksi)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Persyaratan

**Yang sudah siap:**
- ✅ Server Linux: 192.168.1.101 (root:123)
- ✅ Nginx running pada port 80/443
- ✅ Backend API aktif
- ✅ Frontend aktif
- ✅ CloudFlare account & domain: faiznute.site
- ✅ CloudFlare token sudah ada

**Yang perlu:**
- Windows dengan akses ke `%USERPROFILE%\.cloudflared\`
- CloudFlare dashboard access: https://dash.cloudflare.com
- Admin akses ke domain registrar (untuk verifikasi nameserver)

---

## STEP 1: Verifikasi Tunnel di Windows

### 1.1 - Cek apakah cloudflared service sudah berjalan

Buka **Command Prompt** atau **PowerShell** dan jalankan:

```cmd
tasklist | findstr cloudflared
```

**Output yang diharapkan:**
```
cloudflared.exe     [PID]    Services
```

**Jika tidak muncul (tunnel belum running):**
```cmd
# Buka Services (services.msc) dan cari "Cloudflared"
# Atau restart via Command Prompt:

sc stop cloudflared
sc start cloudflared
```

### 1.2 - Cek status tunnel

```cmd
# Lihat file config tunnel
notepad %USERPROFILE%\.cloudflared\config.yml
```

Isinya harus seperti ini:
```yaml
tunnel: [tunnel-id-anda]
credentials-file: [path-to-credentials]

ingress:
  - hostname: pos.faiznute.site
    service: http://192.168.1.101:80
  - service: http_status:404
```

**Jika file tidak ada atau kosong**, lanjut ke STEP 2.

---

## STEP 2: Login CloudFlare

### 2.1 - Install/Update cloudflared di Windows

Download versi terbaru dari: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/remote/

Atau download langsung:
```cmd
# Download ke C:\Program Files\cloudflared\
# atau ke folder lain di PATH Anda
```

### 2.2 - Login ke CloudFlare dari Command Prompt

```cmd
cloudflared tunnel login
```

**Output:**
```
Visit this URL in your browser:
https://dash.cloudflare.com/argotunnel?aud=...

Successfully authenticated.
```

Otomatis akan buka browser untuk login. **Klik domain Anda: `faiznute.site`**

File kredensial akan disimpan di:
```
%USERPROFILE%\.cloudflared\[tunnel-id].json
```

---

## STEP 3: Setup Tunnel di CloudFlare

### 3.1 - Buat tunnel baru di CloudFlare

Di command prompt (lanjutan):

```cmd
cloudflared tunnel create warungin-pos
```

**Output:**
```
Tunnel credentials written to: C:\Users\[username]\.cloudflared\[tunnel-id].json
Created tunnel warungin-pos

Now try running this tunnel by executing the following command:
  cloudflared tunnel run warungin-pos
```

**Catat Tunnel ID**: Lihat output di atas atau buka file:
```
%USERPROFILE%\.cloudflared\cert.pem
```

### 3.2 - Konfigurasi tunnel config.yml

Buat/edit file:
```
%USERPROFILE%\.cloudflared\config.yml
```

Isi dengan:
```yaml
tunnel: [TUNNEL-ID-DARI-STEP-3.1]
credentials-file: C:\Users\[username]\.cloudflared\[tunnel-id].json

ingress:
  - hostname: pos.faiznute.site
    service: http://192.168.1.101:80
  - service: http_status:404
```

**Ganti:**
- `[TUNNEL-ID-DARI-STEP-3.1]` → Tunnel ID yang didapat di step 3.1
- `[username]` → Username Windows Anda
- `[tunnel-id].json` → Nama file JSON dari credentials

### 3.3 - Install tunnel sebagai Windows Service

```cmd
# Stop jika sudah running
sc stop cloudflared

# Install tunnel sebagai service
cloudflared service install

# Start service
sc start cloudflared

# Verifikasi
tasklist | findstr cloudflared
```

Atau di **PowerShell** (as Administrator):
```powershell
New-Service -Name Cloudflared -BinaryPathName "C:\Program Files\cloudflared\cloudflared.exe" -StartupType "Automatic" -DisplayName "Cloudflare Tunnel"
```

---

## STEP 4: Konfigurasi Public Hostname

### 4.1 - Login ke CloudFlare Dashboard

Buka: https://dash.cloudflare.com

### 4.2 - Pilih domain

Klik domain: **faiznute.site**

### 4.3 - Masuk ke Zero Trust

Di menu sebelah kiri, cari dan klik: **Zero Trust** (atau **Cloudflare Tunnel**)

### 4.4 - Pilih tunnel yang sudah dibuat

Di halaman Tunnels, cari tunnel: **warungin-pos**

Klik untuk masuk.

### 4.5 - Tambah Public Hostname

Tab: **Public Hostname**

Klik: **Create public hostname**

Isi form:
```
Subdomain: pos
Domain: faiznute.site
Type: HTTP
URL: http://192.168.1.101:80
```

Klik: **Save hostname**

**Hasil yang diharapkan:**
```
pos.faiznute.site   →   http://192.168.1.101:80
```

---

## STEP 5: Setup DNS Records

### 5.1 - Verifikasi nameserver CloudFlare

**Di CloudFlare Dashboard:**

1. Pilih domain: **faiznute.site**
2. Klik tab: **Overview**
3. Scroll ke bawah, lihat "Nameservers"
4. Catat 2 nameserver CloudFlare, misalnya:
   ```
   neil.ns.cloudflare.com
   tina.ns.cloudflare.com
   ```

### 5.2 - Setup nameserver di domain registrar

**PENTING**: Arahkan nameserver domain registrar ke CloudFlare

**Contoh jika domain di Niagahoster/Hostinger:**

1. Login ke registrar: https://[registrar-anda].com
2. Cari menu: **Domain Management** atau **DNS**
3. Ubah nameserver ke CloudFlare:
   ```
   Nameserver 1: neil.ns.cloudflare.com
   Nameserver 2: tina.ns.cloudflare.com
   ```
4. Save/Confirm

**Tunggu 5-60 menit untuk propagasi**

### 5.3 - Verifikasi DNS di CloudFlare

1. Di CloudFlare Dashboard, klik tab: **DNS**
2. Cari record untuk `pos`
3. Harus ada entry:
   ```
   Type: CNAME
   Name: pos
   Target: [tunnel-id].cfargotunnel.com
   Status: Proxied (orange cloud)
   ```

Jika belum ada, tambah manual:
- Klik: **Add record**
- Type: **CNAME**
- Name: **pos**
- Target: **Ambil dari tunnel status di Zero Trust**
- Proxy status: **Proxied** (warna orange)
- Klik: **Save**

---

## STEP 6: Test Koneksi

### 6.1 - Tunggu DNS propagation

DNS change butuh waktu (biasanya 5-30 menit, maksimal 48 jam)

Monitor dengan:
```cmd
nslookup pos.faiznute.site
```

**Output yang diharapkan:**
```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: pos.faiznute.site
Address: 104.16.132.229 (IP CloudFlare)
```

**Jika masih tidak resolve:**
- Tunggu lebih lama
- Clear DNS cache: `ipconfig /flushdns`
- Try nameserver Google: `nslookup pos.faiznute.site 8.8.8.8`

### 6.2 - Test akses website

Buka di browser:
```
https://pos.faiznute.site/
```

**Diharapkan:**
- Halaman Warungin frontend muncul
- SSL warning muncul (self-signed cert adalah normal)
- Klik "Advanced" → "Proceed anyway"

### 6.3 - Test endpoint lainnya

```
https://pos.faiznute.site/app/          → Frontend
https://pos.faiznute.site/api/          → API
https://pos.faiznute.site/grafana/      → Grafana (admin/admin)
https://pos.faiznute.site/health        → OK
```

### 6.4 - Test dari device lain

Untuk memastikan tunnel working, coba dari:
- Device lain di jaringan (bukan 192.168.1.x)
- Smartphone dengan data mobile (bukan WiFi)
- Online testing: https://www.iplocation.net/

---

## 🔍 Troubleshooting

### Problem 1: "This site can't be reached" / DNS tidak resolve

**Penyebab:**
- Tunnel belum running di Windows
- Nameserver di registrar belum di-update
- DNS belum propagate

**Solusi:**
```cmd
# 1. Cek tunnel running
tasklist | findstr cloudflared

# 2. Jika tidak ada, start ulang
sc stop cloudflared
sc start cloudflared

# 3. Clear DNS cache
ipconfig /flushdns

# 4. Test DNS dengan Google nameserver
nslookup pos.faiznute.site 8.8.8.8

# 5. Tunggu 15-30 menit jika baru setup
```

### Problem 2: "Connection refused" / ERR_CONNECTION_REFUSED

**Penyebab:**
- Nginx di server tidak running
- Port 80 tidak listening
- Firewall memblokir

**Solusi:**
```bash
# Di Windows, SSH ke server:
sshpass -p "123" ssh root@192.168.1.101

# Di server:
docker ps | grep nginx        # Check if nginx running
docker exec warungin-nginx netstat -tlnp  # Check port 80
curl http://192.168.1.101/    # Test local access

# Restart nginx jika tidak running:
docker restart warungin-nginx
```

### Problem 3: "Bad Gateway" atau 502 error

**Penyebab:**
- Backend/Frontend service tidak respond
- Nginx reverse proxy config salah

**Solusi:**
```bash
# SSH ke server
sshpass -p "123" ssh root@192.168.1.101

# Cek backend
docker logs warungin-backend | tail -20

# Cek frontend
docker logs warungin-frontend | tail -20

# Restart service
docker restart warungin-backend
docker restart warungin-frontend
```

### Problem 4: SSL Certificate Error

**Pesan:** "Your connection is not private" atau "NET::ERR_CERT_AUTHORITY_INVALID"

**Ini NORMAL** karena sertifikat di server self-signed.

**Solusi:**
- Klik "Advanced" → "Proceed anyway"
- Untuk production, gunakan Let's Encrypt (gratis)

### Problem 5: Tunnel service tidak auto-start

**Penyebab:** Windows Service tidak properly installed

**Solusi:**

Buka **Services** (services.msc):
1. Cari: "Cloudflared"
2. Right-click → **Properties**
3. Startup type: **Automatic**
4. Service status: **Start**

Atau via Command Prompt (Administrator):
```cmd
sc config Cloudflared start= auto
sc start Cloudflared
```

---

## ✅ Checklist Setup Lengkap

- [ ] 1. Tunnel service running di Windows
- [ ] 2. Config file ada di `%USERPROFILE%\.cloudflared\config.yml`
- [ ] 3. Tunnel ID sudah di-setup di CloudFlare Zero Trust
- [ ] 4. Public hostname `pos.faiznute.site` sudah di-add
- [ ] 5. Nameserver di registrar sudah point ke CloudFlare
- [ ] 6. DNS resolve dengan benar: `nslookup pos.faiznute.site`
- [ ] 7. Akses `https://pos.faiznute.site/` berhasil
- [ ] 8. Backend API respond: `https://pos.faiznute.site/api/`
- [ ] 9. Grafana accessible: `https://pos.faiznute.site/grafana/`

---

## 📊 Quick Reference

### Server Info
```
Server:    192.168.1.101
User:      root
Password:  123
SSH:       sshpass -p "123" ssh root@192.168.1.101
```

### Website URLs
```
Local:     https://192.168.1.101/
External:  https://pos.faiznute.site/

Frontend:  /app/ atau /
API:       /api/
Grafana:   /grafana/ (admin/admin)
Health:    /health
```

### Important Files di Server
```
/root/New-Warungin/
├── docker-compose.simple.yml
├── .env
└── nginx/
    ├── nginx.conf
    └── ssl/
        ├── cert.pem
        └── key.pem
```

### Important Files di Windows
```
%USERPROFILE%\.cloudflared\
├── config.yml                    ← Main config
├── cert.pem                      ← Client certificate
└── [tunnel-id].json              ← Credentials
```

### Useful Commands

**Windows:**
```cmd
# Check tunnel status
tasklist | findstr cloudflared

# Check DNS
nslookup pos.faiznute.site

# Check DNS with Google
nslookup pos.faiznute.site 8.8.8.8

# Clear DNS cache
ipconfig /flushdns

# Manual tunnel start (untuk testing)
cloudflared tunnel run warungin-pos
```

**Server (SSH):**
```bash
# View logs
docker logs -f warungin-nginx
docker logs -f warungin-backend

# Check services
docker ps

# Restart services
docker restart warungin-nginx
docker restart warungin-backend

# Test local access
curl https://192.168.1.101/health
```

---

## 🎯 Expected Result

**Setelah setup lengkap:**

✅ Akses `pos.faiznute.site` dari internet
✅ Terhubung ke server lokal via CloudFlare tunnel
✅ Frontend Warungin tampil
✅ API dapat diakses
✅ Monitoring dashboard (Grafana) dapat diakses
✅ HTTPS encrypted end-to-end

**Timeline:**
- ⏱️ 5-10 menit: Tunnel setup di CloudFlare
- ⏱️ 1-5 menit: Public hostname di-add
- ⏱️ 5-60 menit: DNS propagation
- ⏱️ Total: 15-75 menit

---

## 📞 Support

Jika masih ada error, berikan info:

1. **Screenshot dari CloudFlare Zero Trust → Tunnels** (status tunnel)
2. **Output dari commands:**
   ```cmd
   tasklist | findstr cloudflared
   nslookup pos.faiznute.site
   nslookup pos.faiznute.site 8.8.8.8
   ```
3. **Server logs:**
   ```bash
   docker logs warungin-nginx
   ```
4. **Exact error message** dari browser

---

**Status**: ✅ Ready to Setup
**Last Updated**: 2026-01-21
