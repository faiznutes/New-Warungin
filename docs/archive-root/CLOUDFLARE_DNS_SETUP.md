# CloudFlare DNS Configuration untuk pos.faiznute.site

## Status Saat Ini
- ✅ Tunnel CloudFlare sudah berjalan di Windows (cloudflared.exe service)
- ✅ Backend services berjalan di 192.168.1.101
- ✅ Nginx reverse proxy aktif
- ❌ DNS records belum dikonfigurasi di CloudFlare dashboard

## Masalah
**DNS_PROBE_POSSIBLE** error = CloudFlare belum tahu bahwa `pos.faiznute.site` harus routing ke tunnel Anda

## Solusi: Konfigurasi DNS di CloudFlare Dashboard

### STEP 1: Login ke CloudFlare
1. Buka https://dash.cloudflare.com
2. Login dengan email & password Anda

### STEP 2: Pilih Domain
1. Di halaman Dashboard, pilih domain **faiznute.site**
2. Klik tab **DNS** di sebelah kiri

### STEP 3: Tambah DNS Record untuk Tunnel

#### Opsi A: CNAME Record (Recommended)
1. Klik "Add record"
2. Isi form:
   - **Type**: CNAME
   - **Name**: pos  (hanya "pos", domain akan auto-complete jadi "pos.faiznute.site")
   - **Target**: [MASUKAN TUNNEL URL ANDA]
   - **TTL**: Auto
   - **Proxy status**: Proxied (orange cloud)
3. Klik "Save"

#### Opsi B: A Record (jika CNAME tidak tersedia)
1. Klik "Add record"
2. Isi form:
   - **Type**: A
   - **Name**: pos
   - **IPv4 address**: [IP cloudflared service Anda]
   - **TTL**: Auto
   - **Proxy status**: Proxied
3. Klik "Save"

### STEP 4: Verifikasi di CloudFlare Tunnel
1. Login ke https://dash.cloudflare.com
2. Pilih **Zero Trust** (atau **Cloudflare Tunnel**)
3. Pilih tunnel yang sudah Anda setup
4. Tab **Public Hostname** harus ada entry untuk:
   ```
   Hostname: pos.faiznute.site
   Service: http://127.0.0.1:80 (atau ke Nginx address)
   ```

### STEP 5: Test DNS
Setelah konfigurasi:

```bash
# Via Command Prompt/PowerShell di Windows:
nslookup pos.faiznute.site

# Output yang diharapkan:
# Name: pos.faiznute.site
# Addresses: 104.16.132.229 (atau IP CloudFlare lainnya)
```

Atau buka di browser:
- `https://pos.faiznute.site/health` → Should return "OK"
- `https://pos.faiznute.site/grafana/` → Should show Grafana login

### STEP 6: Troubleshooting

#### Problem: "This site can't be reached"
**Penyebab**: DNS records belum propagate ke seluruh internet (normal, butuh 5-30 menit)
**Solusi**: 
- Clear DNS cache: `ipconfig /flushdns`
- Tunggu 15-30 menit
- Coba dari device lain

#### Problem: "Connection refused" atau "Bad Gateway"
**Penyebab**: Tunnel berjalan tapi tidak terhubung ke backend
**Solusi**:
1. Cek tunnel berjalan di Windows: 
   ```bash
   tasklist | findstr cloudflared
   ```
2. Restart tunnel:
   ```bash
   # Di Windows Services atau:
   sc stop cloudflared
   sc start cloudflared
   ```
3. Check logs: `$env:APPDATA\Cloudflare\cloudflared\`

#### Problem: SSL Certificate Error
**Penyebab**: Self-signed certificate di Nginx
**Solusi**: 
- Di browser, klik "Advanced" → "Proceed anyway"
- Ini normal untuk self-signed cert di development
- Di production, gunakan Let's Encrypt atau certificate resmi

### STEP 7: Check CloudFlare Tunnel Config Anda

Di Windows, tunnel configuration file biasanya di:
```
%USERPROFILE%\.cloudflared\config.yml
```

Isinya harus seperti:
```yaml
tunnel: [tunnel-id]
credentials-file: [path-to-credentials]

ingress:
  - hostname: pos.faiznute.site
    service: http://192.168.1.101:80
  - service: http_status:404
```

### STEP 8: Jika DNS Masih Error

**Verifikasi Nameserver CloudFlare:**
1. Login https://dash.cloudflare.com
2. Pilih domain faiznute.site
3. Lihat tab **Overview** 
4. Di bawah "Nameservers", lihat 2 nameserver CloudFlare yang diberikan
5. Verifikasi nameserver di domain registrar Anda sudah menunjuk ke CloudFlare

Example:
- CloudFlare memberi: `neil.ns.cloudflare.com` dan `tina.ns.cloudflare.com`
- Domain registrar Anda harus set nameserver ke 2 URL tersebut

---

## Quick Reference: Server Info

**Local Access (dalam LAN):**
```
https://192.168.1.101/app/       → Frontend
https://192.168.1.101/api/       → API
https://192.168.1.101/grafana/   → Grafana (admin/admin)
https://192.168.1.101/health     → Health Check
```

**Remote Access (via CloudFlare Tunnel):**
```
https://pos.faiznute.site/app/       → Frontend
https://pos.faiznute.site/api/       → API
https://pos.faiznute.site/grafana/   → Grafana
https://pos.faiznute.site/health     → Health Check
```

**Server SSH:**
```
Host: 192.168.1.101
User: root
Password: 123
```

---

## DNS Propagation Timeline

| Time | Status |
|------|--------|
| Immediate | DNS records created di CloudFlare dashboard |
| 5-10 min | CloudFlare nameservers tahu record baru |
| 10-30 min | ISP DNS resolvers tahu record baru |
| 30+ min | Semua DNS servers worldwide tahu record |

Jika sudah > 30 menit dan masih error, cek:
1. CloudFlare dashboard DNS record ada?
2. Tunnel aktif berjalan di Windows?
3. Nameserver di registrar sudah pointing ke CloudFlare?
