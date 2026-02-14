# 🔍 VERIFICATION CHECKLIST

**Gunakan file ini untuk memastikan setup benar SEBELUM melanjutkan**

---

## ✅ PRE-SETUP VERIFICATION

### A. Server Status

Di Windows, jalankan:

```cmd
# 1. Test local access
curl -k https://192.168.1.101/health
```

✅ Expected: `OK` response

```cmd
# 2. SSH test
ssh root@192.168.1.101
```

✅ Expected: Berhasil connect (password: 123)

---

## ✅ TUNNEL SETUP VERIFICATION

### B. Windows Tunnel Service

Di Command Prompt:

```cmd
# 1. Check service running
tasklist | findstr cloudflared
```

✅ Expected: `cloudflared.exe    [PID]    Services`

```cmd
# 2. Check config file exists
dir %USERPROFILE%\.cloudflared\
```

✅ Expected: File `config.yml` dan `.json` credentials ada

```cmd
# 3. Check if can ping CloudFlare
ping 1.1.1.1
```

✅ Expected: Reply from server

---

## ✅ CLOUDFLARE SETUP VERIFICATION

### C. Tunnel Configuration

1. Buka: https://dash.cloudflare.com
2. Pilih domain: **faiznute.site**
3. Klik: **Zero Trust** → **Tunnels**
4. Pilih tunnel Anda

**Verify:**

```
[ ] Tunnel status: HEALTHY (bukan Disconnected)
[ ] Tunnel ID visible dan tercatat
[ ] Public Hostname sudah ada entry:
    pos.faiznute.site → http://192.168.1.101:80
```

---

## ✅ DNS SETUP VERIFICATION

### D. CloudFlare DNS

Di CloudFlare dashboard, tab **DNS**:

```
[ ] Record type: CNAME
[ ] Name: pos
[ ] Target: [tunnel-id].cfargotunnel.com
[ ] Proxy status: Proxied (orange cloud)
```

### E. Registrar Nameserver

Di registrar Anda (Niagahoster, Hostinger, dll):

```
[ ] Nameserver 1: neil.ns.cloudflare.com
    (atau equivalent dari CloudFlare)
[ ] Nameserver 2: tina.ns.cloudflare.com
[ ] Status: Active/Updated
```

---

## ✅ DNS PROPAGATION VERIFICATION

### F. DNS Resolution Test

Di Command Prompt:

```cmd
# 1. Test DNS propagation
nslookup pos.faiznute.site
```

✅ Expected: 
```
Server: [ISP DNS]
Name: pos.faiznute.site
Address: 104.16.x.x (CloudFlare IP)
```

```cmd
# 2. Test dengan Google DNS
nslookup pos.faiznute.site 8.8.8.8
```

✅ Expected: Same as above

```cmd
# 3. If still not resolving, clear cache
ipconfig /flushdns

# Then test again
nslookup pos.faiznute.site
```

---

## ✅ CONNECTIVITY VERIFICATION

### G. Test Endpoints

**Via command line (Windows):**

```cmd
# 1. Health check
curl -k https://pos.faiznute.site/health
```

✅ Expected: `OK`

```cmd
# 2. Frontend
curl -k -I https://pos.faiznute.site/
```

✅ Expected: `HTTP/2 200`

```cmd
# 3. API
curl -k -I https://pos.faiznute.site/api/
```

✅ Expected: `HTTP/2 404` (not found adalah normal, berarti backend responding)

```cmd
# 4. Grafana
curl -k -I https://pos.faiznute.site/grafana/
```

✅ Expected: `HTTP/2 302` (redirect adalah normal)

**Via Browser:**

```
https://pos.faiznute.site/               → Should load Warungin page
https://pos.faiznute.site/app/           → Should load Warungin page
https://pos.faiznute.site/grafana/       → Should redirect to Grafana login
```

---

## ✅ SSL/HTTPS VERIFICATION

### H. Certificate Status

Di browser, klik lock icon di URL bar:

```
[ ] Connection: HTTPS (locked)
[ ] Certificate: Self-signed (OK untuk testing)
[ ] Issuer: localhost
```

**If certificate warning:**
- [ ] Click "Advanced"
- [ ] Click "Proceed anyway"
- This is NORMAL for self-signed certs

---

## 🟢 FINAL STATUS CHECK

### Command untuk final verification:

```cmd
# All-in-one test
echo === TUNNEL STATUS ===
tasklist | findstr cloudflared

echo === DNS TEST ===
nslookup pos.faiznute.site

echo === ENDPOINT TEST ===
curl -k https://pos.faiznute.site/health
```

### Expected output:
```
=== TUNNEL STATUS ===
cloudflared.exe    [PID]    Services

=== DNS TEST ===
Name: pos.faiznute.site
Address: 104.16.x.x

=== ENDPOINT TEST ===
OK
```

---

## ✅ SUCCESS CRITERIA

Jika ALL items di bawah checked ✅, maka setup COMPLETE:

```
[ ] Tunnel service running di Windows
[ ] CloudFlare tunnel HEALTHY status
[ ] Public hostname pos.faiznute.site configured
[ ] CloudFlare DNS CNAME record exists
[ ] Registrar nameserver pointing to CloudFlare
[ ] DNS resolving correctly (nslookup)
[ ] HTTPS connection working (no errors)
[ ] Website loads (frontend visible)
[ ] API responding
[ ] Grafana accessible
```

---

## ❌ TROUBLESHOOTING QUICK REFERENCE

| Problem | Command | Expected |
|---------|---------|----------|
| Tunnel not running | `tasklist \| findstr cloudflared` | Shows cloudflared.exe |
| DNS not resolving | `nslookup pos.faiznute.site 8.8.8.8` | Returns IP address |
| Can't access website | `curl -k https://pos.faiznute.site/` | Status 200 |
| Backend not responding | `curl -k https://pos.faiznute.site/api/` | Status 404 (OK) |
| SSL error | Browser | Click Advanced → Proceed |

---

## 📋 VERIFICATION COMPLETION

**Tanggal checked**: _______________

**Verifier**: _______________

**Status**: 
- [ ] ✅ ALL PASS - Ready for Production
- [ ] ⚠️ PARTIAL - Need more time for DNS propagation
- [ ] ❌ FAILED - See troubleshooting section

**Notes**: 
```
_________________________________
_________________________________
_________________________________
```

---

**Print this page dan tandai setiap item saat verified!**
