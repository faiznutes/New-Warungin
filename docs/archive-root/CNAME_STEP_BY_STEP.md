# 📸 CNAME RECORD - STEP BY STEP SCREENSHOTS

## STEP 1: Ambil Tunnel CNAME dari CloudFlare

### Buka halaman Tunnel

```
https://dash.cloudflare.com
→ Pilih domain: faiznute.site
→ Menu Zero Trust (kiri)
→ Klik Tunnels
→ Pilih tunnel: warungin-pos
```

### Halaman tunnel terlihat seperti ini:

```
╔═══════════════════════════════════════════════════╗
║ Tunnel: warungin-pos                              ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║ Status: HEALTHY ✓                                ║
║                                                   ║
║ Tunnel ID:                                        ║
║ 023553e8-93ec-40e4-9ec3-59086fd35271            ║
║                                                   ║
║ CNAME VALUE (copy this):                          ║
║ 023553e8-93ec-40e4-9ec3-59086fd35271             ║
║ .cfargotunnel.com                                ║
║                                                   ║
║ ← COPY INI!                                       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**Highlight & copy value dari CNAME:**
```
023553e8-93ec-40e4-9ec3-59086fd35271.cfargotunnel.com
```

---

## STEP 2: Ke tab DNS di CloudFlare

### Buka DNS tab

```
https://dash.cloudflare.com
→ Pilih: faiznute.site
→ Klik tab: DNS (di bagian atas)
```

### Halaman DNS terlihat seperti ini:

```
╔════════════════════════════════════════════════════════╗
║ DNS                                                    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ [Add record]  [Import] [Export]                       ║
║                                                        ║
║ Type │ Name │ Content      │ TTL │ Status            ║
║────────────────────────────────────────────────────── ║
║ (existing records here)                               ║
║                                                        ║
║ [ Add record button ]  ← KLIK INI                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**Klik: Add record**

---

## STEP 3: Isi Form DNS Record

### Form terlihat seperti ini:

```
╔═══════════════════════════════════════════════════════╗
║ Create DNS record                                     ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║ Type *                                                ║
║ ┌──────────────────────────────────────────────────┐ ║
║ │ [CNAME ▼]  ← Select CNAME dari dropdown         │ ║
║ └──────────────────────────────────────────────────┘ ║
║                                                       ║
║ Name *                                                ║
║ ┌──────────────────────────────────────────────────┐ ║
║ │ [pos]  ← Type "pos" (bukan pos.faiznute.site)  │ ║
║ └──────────────────────────────────────────────────┘ ║
║                                                       ║
║ Content *                                             ║
║ ┌──────────────────────────────────────────────────┐ ║
║ │ [023553e8-93ec-40e4-9ec3-59086fd35271          │ ║
║ │ .cfargotunnel.com]  ← PASTE CNAME dari STEP 1   │ ║
║ └──────────────────────────────────────────────────┘ ║
║                                                       ║
║ TTL                                                   ║
║ ┌──────────────────────────────────────────────────┐ ║
║ │ [Auto ▼]                                         │ ║
║ └──────────────────────────────────────────────────┘ ║
║                                                       ║
║ Proxy status                                          ║
║ ◉ Proxied (orange)   ← MUST BE SELECTED!            ║
║ ○ DNS only (gray)                                     ║
║                                                       ║
║ ┌──────────────────────────────────────────────────┐ ║
║ │ [Save]              [Cancel]                    │ ║
║ └──────────────────────────────────────────────────┘ ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## FILLED FORM CONTOH (CORRECT)

```
Type:    CNAME ✓
         ↓
Name:    pos ✓
         ↓
Content: 023553e8-93ec-40e4-9ec3-59086fd35271.cfargotunnel.com ✓
         ↓
TTL:     Auto ✓
         ↓
Proxy:   ◉ Proxied (orange) ✓
```

✅ SEMUA BENAR - KLIK SAVE

---

## FILLED FORM SALAH (MISTAKES)

### ❌ Mistake 1: IP Address

```
Type:    A (WRONG! Should be CNAME)
Content: 104.16.132.229 (WRONG! Should be .cfargotunnel.com)
Proxy:   ○ DNS only (WRONG! Should be Proxied)
```

### ❌ Mistake 2: Localhost IP

```
Type:    CNAME (correct type)
Content: 192.168.1.101 (WRONG! Should be cfargotunnel domain)
Proxy:   ◉ Proxied (correct)
```

### ❌ Mistake 3: Missing suffix

```
Type:    CNAME
Content: 023553e8-93ec-40e4-9ec3-59086fd35271
         (WRONG! Missing .cfargotunnel.com)
```

### ❌ Mistake 4: Wrong name

```
Name:    pos.faiznute.site
         (WRONG! Should be just "pos")
```

---

## STEP 4: Klik Save

### Form sebelum save:

```
┌──────────────────────────────┐
│ Type:    CNAME               │
│ Name:    pos                 │
│ Content: 023553e8...         │
│          .cfargotunnel.com   │
│ TTL:     Auto                │
│ Proxy:   ◉ Proxied           │
└──────────────────────────────┘
              ↓
        [SAVE button]
```

### Klik: [Save]

---

## STEP 5: Verifikasi DNS Record Tersimpan

### Setelah save, lihat di DNS records list:

```
╔════════════════════════════════════════════════════════════╗
║ DNS Records                                                ║
╠════════════════════════════════════════════════════════════╣
║ Type  │ Name │ Content              │ TTL  │ Status       ║
╠═══════╪══════╪══════════════════════╪══════╪══════════════╣
║ CNAME │ pos  │ 023553e8-93ec-40e... │ Auto │ Proxied 🟠   ║
║       │      │ cfargotunnel.com     │      │              ║
╚════════════════════════════════════════════════════════════╝
```

✅ Jika terlihat seperti ini → **BERHASIL!**

---

## STEP 6: Test DNS dari Windows

### Buka Command Prompt

```cmd
nslookup pos.faiznute.site
```

### Output yang BENAR:

```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name:   pos.faiznute.site
Address: 104.16.132.229

---

Atau test dengan Google DNS:

nslookup pos.faiznute.site 8.8.8.8
```

✅ Jika keluar **alamat IP** (104.16.x.x) = **DNS BERHASIL!**

---

## ❌ TEST YANG SALAH

### Error 1: DNS tidak resolve

```cmd
nslookup pos.faiznute.site

Output:
*** [DNS_SERVER] can't find pos.faiznute.site: Server failed
(or) NXDOMAIN
```

**Penyebab:**
- CNAME belum di-save
- DNS belum propagate (tunggu 10 menit)
- Format CNAME salah

**Fix:**
1. Check DNS record di CloudFlare
2. Pastikan Content end dengan .cfargotunnel.com
3. Tunggu 10-15 menit, coba lagi
4. Clear cache: `ipconfig /flushdns`

### Error 2: Resolve ke IP yang salah

```cmd
nslookup pos.faiznute.site

Output:
Name:   pos.faiznute.site
Address: 192.168.1.101 (WRONG! Should be 104.16.x.x)
```

**Penyebab:**
- CNAME tidak pointing ke cfargotunnel.com
- Pointing ke IP lokal

**Fix:**
1. Edit DNS record
2. Ubah Content ke: `[tunnel-id].cfargotunnel.com`
3. Save
4. Wait 5 min, test lagi

---

## 🎯 SUMMARY

| Step | Action | Verify |
|------|--------|--------|
| 1 | Copy Tunnel CNAME | Format: `xxx.cfargotunnel.com` |
| 2 | Go to DNS tab | CloudFlare DNS page open |
| 3 | Add record | Form appears |
| 4 | Fill form | Type=CNAME, Name=pos, Content=tunnel |
| 5 | Select Proxied | Orange status selected |
| 6 | Click Save | Record appears in list |
| 7 | Test DNS | `nslookup pos.faiznute.site` returns IP |

---

**JIKA BERHASIL SAMPAI STEP 7 → LANJUT KE NEXT STEP! ✅**

Jika masih error → Check TROUBLESHOOTING_TUNNEL.md
