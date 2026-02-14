# ✅ TUNNEL ID ANDA: dadba309-669b-4163-b903-59ef4302c3cb

---

## 🔧 LANGKAH 1: Verifikasi Config File

Buka file:
```
%USERPROFILE%\.cloudflared\config.yml
```

**Harus berisi EXACTLY:**

```yaml
tunnel: dadba309-669b-4163-b903-59ef4302c3cb
credentials-file: C:\Users\[YOUR-USERNAME]\.cloudflared\dadba309-669b-4163-b903-59ef4302c3cb.json

ingress:
  - hostname: pos.faiznute.site
    service: http://192.168.1.101:80
  - service: http_status:404
```

⚠️ **PERHATIAN:**
- Ganti `[YOUR-USERNAME]` dengan username Windows Anda
- Tunnel ID harus: `dadba309-669b-4163-b903-59ef4302c3cb`
- Credentials file harus ada dengan nama SAMA dengan tunnel ID

---

## 🔍 LANGKAH 2: Verifikasi Credentials File

Di PowerShell, cek:

```cmd
dir %USERPROFILE%\.cloudflared\dadba309-669b-4163-b903-59ef4302c3cb.json
```

**Expected output:**
```
    Directory: C:\Users\[username]\.cloudflared

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          1/21/2026 10:00 AM           1200 dadba309-669b-4163-b903-59ef4302c3cb.json
```

❌ **Jika file tidak ada** → Copy dari CloudFlare Zero Trust dashboard atau recreate tunnel

✅ **Jika file ada** → Lanjut step 3

---

## ✅ LANGKAH 3: Verify Tunnel exists di CloudFlare

```cmd
cloudflared tunnel list
```

**Expected output:**
```
ID                                     NAME                 CNAME
dadba309-669b-4163-b903-59ef4302c3cb  warungin-pos         dadba309-669b-4163-b903-59ef4302c3cb.cfargotunnel.com
```

❌ **Jika tidak ada di list** → Tunnel sudah di-delete, perlu recreate

✅ **Jika ada di list** → Tunnel masih valid

---

## 🚀 LANGKAH 4: Start/Restart Service

Jika config dan credentials OK:

```cmd
# Stop service lama
sc stop cloudflared

# Start ulang
sc start cloudflared

# Verifikasi running
tasklist | findstr cloudflared
```

✅ **Expected:**
```
cloudflared.exe                11234 Console    0      5,234 K
```

---

## 📊 QUICK DIAGNOSTIC COMMAND

Copy-paste ini di PowerShell untuk check semuanya:

```cmd
echo "=== CONFIG FILE ==="; type %USERPROFILE%\.cloudflared\config.yml; echo ""; echo "=== CREDENTIALS FILE ==="; dir %USERPROFILE%\.cloudflared\dadba309-669b-4163-b903-59ef4302c3cb.json; echo ""; echo "=== TUNNEL LIST ==="; cloudflared tunnel list; echo ""; echo "=== SERVICE STATUS ==="; sc query cloudflared; echo ""; echo "=== TUNNEL RUNNING? ==="; tasklist | findstr cloudflared
```

Run command ini dan catat outputnya.

---

## 🎯 JIKA MASIH ERROR 1033

Lihat tunnel logs untuk detail error:

```cmd
cloudflared tunnel logs warungin-pos
```

Catat error message dan kirim ke saya.

---

## 📝 CHECKLIST UNTUK TUNNEL ID INI

```
[ ] 1. Config file berisi tunnel: dadba309-669b-4163-b903-59ef4302c3cb
[ ] 2. Credentials file ada: dadba309-669b-4163-b903-59ef4302c3cb.json
[ ] 3. Tunnel ada di list: cloudflared tunnel list
[ ] 4. Service running: tasklist | findstr cloudflared
[ ] 5. Logs tidak ada error: cloudflared tunnel logs warungin-pos
```

Cek semua ini dan report hasilnya ke saya.

---

## 🌍 SETELAH TUNNEL FIXED

Langkah berikutnya:
1. ✅ Tunnel running dan connected
2. ⏳ Setup DNS CNAME record (lihat QUICK_TUNNEL_SETUP.md STEP 4)
3. ⏳ Test DNS: `nslookup pos.faiznute.site`
4. ⏳ Test website: `https://pos.faiznute.site/`

Saat ini fokus: **FIX Error 1033 dulu** gunakan checklist di atas.
