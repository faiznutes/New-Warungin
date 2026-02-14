# 🔧 TROUBLESHOOTING GUIDE - Masalah & Solusi

**File ini untuk masalah yang paling sering terjadi saat setup tunnel**

---

## ⚠️ ERROR YANG PALING SERING

### ERROR 1: "DNS PROBE IMPOSSIBLE" / Domain tidak bisa di-resolve

**Gejala:**
```
Chrome: This site can't be reached
Firefox: Server not found
cmd: nslookup pos.faiznute.site
     → server can't find pos.faiznute.site
```

**Penyebab Paling Umum:**

1. **Nameserver di registrar belum di-update ke CloudFlare**
   - Ini adalah penyebab #1!
   - Ketika setup tunnel, CloudFlare buat CNAME record
   - Tapi jika registrar tidak point ke CloudFlare DNS, record tidak terlihat

2. **DNS baru belum propagate** (normal, butuh waktu 5-60 menit)

3. **Tunnel belum running di Windows**

**SOLUSI - Ikuti ini:**

**Step 1: Verifikasi nameserver di registrar**

```
Jika domain di:
- Niagahoster    → Login ke niagahoster.com → Domain → DNS Management
- Hostinger      → Login ke hostinger.com → Manage → DNS
- IDwebhost      → Domain Management → Name Server
- Lainnya        → Cari DNS/Name Server settings
```

Lihat apa nameserver di registrar:

❌ **Jika masih nameserver registrar (bukan CloudFlare):**
```
Nameserver 1: ns1.niagahoster.com
Nameserver 2: ns2.niagahoster.com
```

✅ **Seharusnya CloudFlare:**
```
Nameserver 1: neil.ns.cloudflare.com
Nameserver 2: tina.ns.cloudflare.com
(atau equivalent dari CloudFlare Anda)
```

**→ HARUS DI-CHANGE KE CLOUDFLARE!**

**Step 2: Ambil nameserver CloudFlare yang benar**

Di CloudFlare dashboard → faiznute.site → Overview → Scroll ke Nameservers

Copy 2 nameserver dari situ.

**Step 3: Update di registrar**

Paste 2 nameserver CloudFlare ke registrar dan SAVE.

**Step 4: Tunggu propagasi**

⏱️ **5-30 menit** biasanya, maksimal 48 jam

**Step 5: Test DNS**

```cmd
# Tunggu 10 menit, lalu test
ipconfig /flushdns
nslookup pos.faiznute.site
```

✅ Jika keluar alamat IP → DNS berhasil!

---

### ERROR 2: "CONNECTION REFUSED" / ERR_EMPTY_RESPONSE

**Gejala:**
```
DNS resolve OK (nslookup working)
Tapi browser: Connection refused / empty response
curl: Empty reply from server
```

**Penyebab:**
- Tunnel berjalan tapi tidak terhubung ke backend
- Backend service tidak running
- Firewall memblokir port 80
- Nginx tidak berjalan

**SOLUSI - Check tunnel dulu:**

```cmd
# 1. Verifikasi tunnel running
tasklist | findstr cloudflared
```

❌ **Jika tidak ada, start ulang:**
```cmd
sc stop cloudflared
sc start cloudflared
tasklist | findstr cloudflared
```

```cmd
# 2. Cek tunnel healthy di CloudFlare
nslookup pos.faiznute.site
```

✅ Jika resolve → DNS OK

**Step 2: Check backend server**

```bash
# SSH ke server
sshpass -p "123" ssh root@192.168.1.101

# Check docker services
docker ps

# Harus ada:
# ✓ warungin-nginx        (healthy)
# ✓ warungin-backend      (healthy)
# ✓ warungin-frontend     (healthy)
```

❌ **Jika ada yang not healthy:**

```bash
# Lihat logs untuk error
docker logs warungin-nginx | tail -20
docker logs warungin-backend | tail -20

# Restart yang error
docker restart warungin-nginx
docker restart warungin-backend
```

**Step 3: Test local access**

```bash
# Di server:
curl -k https://localhost:443/health
# Atau
curl http://localhost:80/health
```

✅ Jika return OK → backend OK

**Step 4: Test tunnel connection**

```bash
# Still SSH ke server
# Test apakah incoming connection from tunnel diterima
netstat -tlnp | grep nginx
# Harus muncul:
# tcp        0      0 0.0.0.0:80          0.0.0.0:*               LISTEN
```

✅ Jika muncul listening on port 80 → backend OK

**Step 5: Test dari Windows**

```cmd
# SSH dari Windows
sshpass -p "123" ssh root@192.168.1.101

# Test local IP
curl -k https://192.168.1.101/health
```

✅ Jika OK → Masalah adalah DNS/Tunnel configuration

---

### ERROR 3: "BAD GATEWAY" / 502 Error

**Gejala:**
```
DNS OK
Website accessible
Tapi halaman muncul: 502 Bad Gateway
nginx/1.29.4
```

**Penyebab:**
- Nginx tidak bisa reach backend
- Backend/frontend crashed
- Database connection error

**SOLUSI:**

```bash
# SSH ke server
sshpass -p "123" ssh root@192.168.1.101

# Check backend logs
docker logs warungin-backend | tail -30
```

**Look for errors seperti:**

```
❌ "Connection error: Authentication failed against database server"
   → Database credentials wrong
   → Solution: docker restart warungin-backend

❌ "Error: listen EADDRINUSE"
   → Port 3000 sudah di-pakai
   → Solution: docker restart warungin-backend

❌ "Cannot find module"
   → Application error
   → Solution: docker logs warungin-backend untuk lihat detail
```

**General fix:**

```bash
# Restart all services
docker restart warungin-backend warungin-frontend warungin-nginx

# Wait 10 seconds
sleep 10

# Check logs again
docker logs warungin-backend | tail -10
```

---

### ERROR 4: SSL Certificate Error

**Gejala:**
```
"Your connection is not private"
"NET::ERR_CERT_AUTHORITY_INVALID"
"Did not send ClientHello"
```

**Penyebab:**
- Self-signed certificate (NORMAL untuk development)
- Browser tidak trust certificate

**SOLUSI - INI NORMAL!**

Klik: **Advanced** → **Proceed anyway** (atau equivalent di browser Anda)

**Untuk production, gunakan Let's Encrypt** (gratis):

```bash
# Di server:
# Install certbot
apt-get install certbot

# Generate Let's Encrypt certificate
certbot certonly --standalone -d pos.faiznute.site

# Update nginx.conf untuk point ke baru certificate
```

---

### ERROR 5: Tunnel Service Tidak Auto-Start

**Gejala:**
```
Restart Windows
tasklist | findstr cloudflared
  → tidak ada
```

**Penyebab:**
- Windows service tidak properly installed
- Service disabled

**SOLUSI:**

**Option 1: Via Services (GUI)**

```
1. Buka: services.msc (atau search "Services")
2. Cari: "Cloudflared"
3. Right-click → Properties
4. Startup type: Automatic
5. Service status: Start
6. OK
```

**Option 2: Via Command (Admin)**

```cmd
# Run as Administrator
sc config Cloudflared start= auto
sc start Cloudflared

# Verify
tasklist | findstr cloudflared
```

---

### ERROR 6: Tunnel Config File Error

**Gejala:**
```
Command: cloudflared tunnel run warungin-pos
Error: open C:\Users\..\.cloudflared\config.yml: file not found
```

**Penyebab:**
- config.yml tidak ada atau di path yang salah

**SOLUSI:**

```cmd
# Check di mana file seharusnya
echo %USERPROFILE%\.cloudflared\

# Check kalau ada
dir %USERPROFILE%\.cloudflared\
```

❌ **Jika tidak ada, buat:**

```cmd
# Buat file config.yml manual
notepad %USERPROFILE%\.cloudflared\config.yml
```

Paste ini:

```yaml
tunnel: [TUNNEL-ID]
credentials-file: C:\Users\[USERNAME]\.cloudflared\[TUNNEL-ID].json

ingress:
  - hostname: pos.faiznute.site
    service: http://192.168.1.101:80
  - service: http_status:404
```

Ganti:
- `[TUNNEL-ID]` → tunnel ID dari CloudFlare
- `[USERNAME]` → Windows username Anda

---

### ERROR 7: "CNAME Record Not Found" / Tunnel DNS Error

**Gejala:**
```
Tunnel healthy di CloudFlare
tapi nslookup masih error
```

**Penyebab:**
- CNAME record tidak di-create otomatis
- Perlu manual setup

**SOLUSI:**

Di CloudFlare dashboard → DNS → Add record:

```
Type: CNAME
Name: pos
Target: [tunnel-id].cfargotunnel.com
TTL: Auto
Proxy status: Proxied (orange)
```

Klik Save.

Tunggu 5 menit, test:

```cmd
nslookup pos.faiznute.site
```

---

## 🎯 QUICK DIAGNOSIS FLOW

**Gunakan flow ini jika masalah:**

```
START
   ↓
Website tidak accessible?
├─ YES → ERROR: DNS PROBE POSSIBLE?
│         → Lihat ERROR 1
│
└─ NO → Bisa di-resolve?
   nslookup pos.faiznute.site
   ├─ YES → Dapat error page?
   │        ├─ YES (502, Bad Gateway) → Lihat ERROR 3
   │        │
   │        └─ NO (timeout) → Lihat ERROR 2
   │
   └─ NO (server can't find) → Lihat ERROR 1
```

---

## 📋 DIAGNOSTIC COMMANDS

Copy-paste ini untuk diagnose:

```cmd
echo === SYSTEM ===
systeminfo | findstr OS

echo === TUNNEL ===
tasklist | findstr cloudflared

echo === CONFIG ===
dir %USERPROFILE%\.cloudflared\

echo === DNS ===
nslookup pos.faiznute.site
nslookup pos.faiznute.site 8.8.8.8

echo === ENDPOINT ===
curl -k https://pos.faiznute.site/health

echo === BACKEND CHECK ===
sshpass -p "123" ssh root@192.168.1.101 "docker ps"
```

---

## 📞 WHEN TO ASK FOR HELP

Jika sudah coba semua di atas dan masih error, siapkan:

1. **Exact error message** dari browser
2. **Output dari diagnostic commands** di atas
3. **Screenshot dari CloudFlare tunnel status**
4. **Output dari:**
   ```bash
   docker logs warungin-nginx | tail -30
   docker logs warungin-backend | tail -30
   ```
5. **Kapan error mulai** (setelah setup step berapa?)

---

## ✅ VERIFICATION AFTER FIX

Setelah apply solusi, test:

```cmd
# 1. DNS
nslookup pos.faiznute.site

# 2. Tunnel
tasklist | findstr cloudflared

# 3. Website
curl -k https://pos.faiznute.site/health

# 4. Browser
https://pos.faiznute.site/
```

✅ Semua OK → Problem solved!

---

**Last Updated**: 2026-01-21
**Most Common Issues**: Covered ✅
