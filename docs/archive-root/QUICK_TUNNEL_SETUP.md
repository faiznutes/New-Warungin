# ⚡ PANDUAN CEPAT: CloudFlare Tunnel Setup (15-30 menit)

**Ikuti langkah ini one-by-one. Jangan lompat!**

---

## 🟢 STEP 1: VERIFIKASI TUNNEL WINDOWS (2 menit)

### Check tunnel status

Buka **Command Prompt** dan jalankan:

```cmd
tasklist | findstr cloudflared
```

✅ **Jika muncul `cloudflared.exe`**: Lanjut ke STEP 2

❌ **Jika tidak muncul**: Jalankan:
```cmd
sc start cloudflared
```

---

## 🟢 STEP 2: SETUP TUNNEL DI CLOUDFLARE (3 menit)

### 1. Buka dashboard CloudFlare

https://dash.cloudflare.com

### 2. Login dengan email & password Anda

### 3. Pilih domain **faiznute.site**

### 4. Klik menu **Zero Trust** (di sebelah kiri)

Atau search: "Cloudflare Tunnel"

### 5. Klik **Tunnels**

### 6. Lihat tunnel yang ada atau buat baru

Jika sudah ada tunnel: **warungin-pos** atau similar → Skip

Jika belum ada:
- Klik **Create a tunnel**
- Pilih **Cloudflared**
- Nama: `warungin-pos`
- Selesaikan setup

### ✅ Catat Tunnel ID dari halaman ini

Contoh: `023553e8-93ec-40e4-9ec3-59086fd35271`

---

## 🟢 STEP 3: KONFIGURASI PUBLIC HOSTNAME (3 menit)

### Masih di tunnel page:

1. Klik tab **Public Hostname**

2. Klik **Create public hostname**

3. Isi form:

| Field | Isi |
|-------|-----|
| Subdomain | `pos` |
| Domain | `faiznute.site` |
| Type | `HTTP` |
| URL | `http://192.168.1.101:80` |

4. Klik **Save hostname**

✅ **Seharusnya keluar:** `pos.faiznute.site → http://192.168.1.101:80`

---

## 🟢 STEP 4: SETUP DNS DI CLOUDFLARE (3 menit)

### 1. Di CloudFlare, pilih domain **faiznute.site**

### 2. Cari CNAME value dari tunnel Anda

Di halaman tunnel (Zero Trust → Tunnels → Select tunnel):

Cari text seperti ini di halaman:
```
CNAME: [tunnel-id].cfargotunnel.com
```

Contoh:
```
CNAME: 023553e8-93ec-40e4-9ec3-59086fd35271.cfargotunnel.com
```

**COPY value ini! Ini yang akan dipakai di STEP 3 below**

### 3. Klik tab **DNS** di CloudFlare dashboard

### 4. Lihat record untuk `pos`

Seharusnya sudah ada entry CNAME otomatis.

Jika belum ada, tambah manual:

- Klik **Add record**
- Type: **CNAME** (bukan A record!)
- Name: **pos** (hanya "pos", bukan "pos.faiznute.site")
- Target: **[PASTE CNAME DARI STEP 2]**
  - Contoh: `023553e8-93ec-40e4-9ec3-59086fd35271.cfargotunnel.com`
  - **BUKAN IP address!** ⚠️
  - **BUKAN 192.168.1.101!** ⚠️
- Proxy status: **Proxied** (orange cloud)
- TTL: **Auto**
- Klik **Save**

✅ Status harus **Proxied** (warna orange)

**🚨 PENTING:**
- CNAME value harus END dengan `.cfargotunnel.com`
- BUKAN IP address (104.16.x.x atau 192.168.1.101)
- BUKAN domain pos.faiznute.site
- HANYA CloudFlare tunnel domain!

---

## 🟢 STEP 5: UPDATE NAMESERVER DI REGISTRAR (5 menit)

**PENTING - Jangan lupa!**

### 1. Lihat nameserver CloudFlare

Di CloudFlare dashboard, tab **Overview**:

Scroll ke "Nameservers", catat 2 nameserver:

Contoh:
```
neil.ns.cloudflare.com
tina.ns.cloudflare.com
```

### 2. Login ke registrar domain Anda

Contoh: Niagahoster, Hostinger, IDwebhost, dll

### 3. Cari menu Domain Management atau DNS

### 4. Update nameserver ke 2 nameserver CloudFlare di atas

### 5. Save/Confirm

⏱️ **Tunggu 5-60 menit untuk propagasi**

---

## 🟡 STEP 6: VERIFIKASI DNS PROPAGATION (10 menit)

### Buka Command Prompt dan cek:

```cmd
nslookup pos.faiznute.site
```

### Output yang diharapkan:

```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name:   pos.faiznute.site
Address: 104.16.132.229
```

❌ **Jika "server can't find" atau "Name does not exist":**

1. Clear cache: `ipconfig /flushdns`
2. Tunggu 5 menit lebih
3. Coba lagi

**Bisa juga test dengan DNS Google:**
```cmd
nslookup pos.faiznute.site 8.8.8.8
```

---

## 🟢 STEP 7: TEST AKSES WEBSITE (2 menit)

### Buka browser dan ketik:

```
https://pos.faiznute.site/
```

### Warning SSL muncul?

**NORMAL** (self-signed certificate)

Klik: **Advanced** → **Proceed anyway**

### ✅ Diharapkan muncul: Halaman login Warungin

---

## 🟢 STEP 8: TEST SEMUA ENDPOINT (2 menit)

Buka di browser atau curl:

```
https://pos.faiznute.site/               ✅ Frontend
https://pos.faiznute.site/app/           ✅ Frontend
https://pos.faiznute.site/api/           ✅ API (error OK, berarti connecting)
https://pos.faiznute.site/grafana/       ✅ Grafana (admin/admin)
https://pos.faiznute.site/health         ✅ Should say "OK"
```

---

## ✅ SELESAI!

Jika semua endpoint working:

🎉 **Tunnel + DNS setup SUKSES!**

---

## ❌ Jika Masih Error?

### Error 1: "This site can't be reached"

```cmd
# Cek tunnel
tasklist | findstr cloudflared

# Restart tunnel
sc stop cloudflared
sc start cloudflared

# Clear DNS
ipconfig /flushdns

# Tunggu 15 menit
```

### Error 2: "Connection refused"

Tunnel berjalan tapi backend tidak respond:

```bash
# SSH ke server
sshpass -p "123" ssh root@192.168.1.101

# Check backend
docker ps

# Restart
docker restart warungin-backend warungin-nginx
```

### Error 3: SSL warning (normal)

Klik **Advanced** → **Proceed anyway**

---

## 📞 Informasi Penting

### Server Credentials
```
Host: 192.168.1.101
User: root
Pass: 123
```

### Tunnel ID
```
[CATAT TUNNEL ID DARI STEP 2]
```

### Domain
```
pos.faiznute.site
```

### Files to Check

**Di Windows:**
```
%USERPROFILE%\.cloudflared\config.yml
%USERPROFILE%\.cloudflared\cert.pem
```

**Di Server:**
```
/root/New-Warungin/nginx/nginx.conf
docker logs warungin-nginx
```

---

## ⏱️ Timeline

| Step | Waktu |
|------|-------|
| 1. Verifikasi tunnel | 2 min |
| 2. Setup di CloudFlare | 3 min |
| 3. Public hostname | 3 min |
| 4. DNS setup | 3 min |
| 5. Update nameserver | 5 min |
| 6. DNS propagation | 5-60 min |
| 7. Test website | 2 min |
| 8. Test endpoints | 2 min |
| **TOTAL** | **25-75 min** |

---

**MULAI SEKARANG! 🚀**

Jika ada masalah, refer ke file: `CLOUDFLARE_TUNNEL_TUTORIAL_ID.md` untuk detail lebih lengkap.
