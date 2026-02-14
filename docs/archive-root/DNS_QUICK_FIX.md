# 🚀 QUICK START: Configure pos.faiznute.site DNS

## ⚡ 5 Langkah Cepat

### 1️⃣ Buka CloudFlare Dashboard
   - https://dash.cloudflare.com
   - Login dengan akun Anda

### 2️⃣ Pilih Domain
   - Klik domain: **faiznute.site**

### 3️⃣ Setup Tunnel (jika belum ada)
   - Di sebelah kiri, klik: **Zero Trust** atau **Cloudflare Tunnel**
   - Klik **Create a tunnel**
   - Pilih **Cloudflared**
   - Beri nama: `warungin-pos-tunnel`
   - Selesaikan setup (copy token untuk Windows)

### 4️⃣ Tambah Public Hostname
   Dalam tunnel yang sudah dibuat:
   
   | Setting | Nilai |
   |---------|-------|
   | **Hostname** | pos.faiznute.site |
   | **Service Type** | HTTP |
   | **Service URL** | http://192.168.1.101:80 |
   
   Klik **Save tunnel**

### 5️⃣ Verify DNS
   Di Windows Command Prompt:
   ```
   nslookup pos.faiznute.site
   ```
   Harus return IP CloudFlare (bukan error)

---

## 🔍 Jika Masih Error

### Cek 1: Tunnel Berjalan di Windows?
```powershell
# Buka PowerShell sebagai Administrator
tasklist | findstr cloudflared

# Harus muncul:
# cloudflared.exe     [PID]    Services
```

Jika tidak ada, restart:
```powershell
sc stop cloudflared
sc start cloudflared
```

### Cek 2: Backend Services Aktif?
```bash
# Di Command Prompt/PowerShell:
curl -k -I https://192.168.1.101/health

# Harus return HTTP/2 200 (atau 302 jika redirect)
```

### Cek 3: CloudFlare Tunnel Status
1. https://dash.cloudflare.com
2. Zero Trust → Tunnels
3. Cari tunnel Anda
4. Status harus **HEALTHY** (tidak Connected/Disconnected)

### Cek 4: DNS Propagation
```powershell
nslookup pos.faiznute.site 8.8.8.8

# Harus return CNAME ke tunnel CloudFlare
# Bukan "server can't find" error
```

---

## ✅ Yang Sudah Siap

- ✅ Nginx reverse proxy (192.168.1.101)
- ✅ Backend API service
- ✅ Frontend Vue.js
- ✅ SSL/HTTPS configured
- ✅ Monitoring stack (Grafana, Prometheus)
- ✅ CloudFlare tunnel running on Windows

## 🎯 Yang Perlu Dilakukan

- [ ] Setup public hostname di CloudFlare Tunnel
- [ ] Verify DNS records di CloudFlare dashboard
- [ ] Test: `curl https://pos.faiznute.site/health`
- [ ] Test: Open browser to `https://pos.faiznute.site/app/`

---

## 📞 Support

Jika masih ada error, berikan info:
1. Status `tasklist | findstr cloudflared` di Windows
2. Output dari `nslookup pos.faiznute.site`
3. Screenshot dari CloudFlare Zero Trust → Tunnels
