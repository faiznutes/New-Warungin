# 🧨 Warungin POS — Refocused TODO (Production-First)

> **Versi minimalis, brutal, prioritas tinggi.**
> Fokus: *Security, Stability, POS Performance, PWA, Multi-Tenant Safety.*
> Siap commit sebagai `TODO.md`.

---

# 🚀 PRIORITAS UTAMA (Wajib Sebelum Launch)

## 1. 🔒 SECURITY HARDENING (P1 — Must Finish)

* [ ] **Hapus 244+ `console.log`**, ganti ke `logger` terstruktur.
* [ ] **Encrypt defaultPassword** (AES-256) atau hapus fitur ini total.
* [ ] **Refresh Token Rotation + Blacklist** (Redis mandatory).
* [ ] **Server-side input sanitization** (gabungkan Zod + sanitizer).
* [ ] **CSP Headers + Strict-Transport-Security**.
* [ ] **Audit env leaks** (no secrets in logs, no accidental dumps).
* [ ] **Hardening rate limit** (per-user + per-IP dengan Redis).
* [ ] **Secure payment callbacks:** idempotency + signature verification.
* [ ] **Audit multi-tenant isolation:** pastikan 0 potensi cross-tenant.
* [ ] **API key rotation** untuk integrations.
* [ ] **Check raw queries** → pastikan 0 string-concat SQL.

---

## 2. 🧪 TESTING FOUNDATION (P1)

* [ ] Setup **test DB** (Docker).
* [ ] 10 Integration Tests kritikal:

  * [ ] Auth → login, refresh, 2FA
  * [ ] Tenant isolation (paling penting)
  * [ ] POS order → stock update transactional
  * [ ] Payment callback
  * [ ] User roles/permissions
* [ ] Unit tests minimal untuk:

  * [ ] auth.service
  * [ ] user.service
  * [ ] order.service
  * [ ] payment.service
  * [ ] tenant.service
* [ ] Remove `tsc` error bypass → fix semua TS errors.

---

## 3. 🔁 TRANSACTIONAL SAFETY (P1)

* [ ] Bungkus seluruh proses transaksi (order, stock, payment) dalam Prisma **transaction()**.
* [ ] Tambahkan **idempotent transaction key** untuk mencegah double order.
* [ ] Retry queue untuk payment callback gagal (Redis list).
* [ ] Locking untuk operasi stok.

---

## 4. ⚡ PERFORMANCE BASELINE (P1)

* [ ] Redis jadi **mandatory**, bukan optional.
* [ ] Tambah database indexes (audit schema).
* [ ] Tambah slow-query logging.
* [ ] Pagination WAJIB di semua list endpoints.
* [ ] Limit response size + request size.
* [ ] Response-time middleware audit.

---

# 📱 PHASE 2 — POS Frontend Stability + PWA

## 5. 📱 PWA UPGRADE (P2)

* [ ] Full PWA support (manifest, sw, offline fallback).
* [ ] Auto update SW tanpa user action.
* [ ] Cache strategy: static + API fallback.
* [ ] PWA onboarding screen.

### **Auto Landscape Mode (Tablet/Kasir)**

* [ ] Detect device → force landscape layout untuk POS.
* [ ] Tambah CSS orientation-lock.
* [ ] Warning modal saat user portrait.
* [ ] POS layout optimize untuk landscape.

---

## 6. 💥 POS FRONTEND RESILIENCE (P2)

* [ ] Offline-safe POS mode:

  * [ ] Queue transaksi lokal (localStorage/IndexedDB).
  * [ ] Auto-sync saat online.
* [ ] Error Boundary global (tidak crash total).
* [ ] Auto retry untuk request kritikal.
* [ ] Socket auto-reconnect.
* [ ] Optimasi loading POS < 1.5s.

---

# 📊 PHASE 3 — Core Features yang Layak Jual

## 7. 📊 Laporan yang Dibutuhkan User (P2)

* [ ] Profit & Loss / Laba Rugi.
* [ ] Penjualan per kategori.
* [ ] Produk terlaris.
* [ ] Stok minimum (alert).
* [ ] Closing shift.

---

## 8. 🧹 CODE CLEANUP (P2)

* [ ] Hapus commented code (rateLimiter, old services).
* [ ] Audit folder `scripts/` → buang 50% tidak terpakai.
* [ ] Kurangi file service tidak digunakan.
* [ ] Standardize error handler (1 file saja).
* [ ] Zero `any` types di module kritikal.

---

# 🕸️ PHASE 4 — Infrastructure

## 9. 🏗️ DEPLOYMENT & DEVOPS (P3)

* [ ] CI/CD (GitHub Actions):

  * [ ] Lint → Test → Build → Deploy.
* [ ] Docker multi-stage build optimization.
* [ ] Staging environment terpisah.
* [ ] DB backup automation.
* [ ] Log rotation + structured logging.

---

# 🔐 PHASE 5 — Code Security Audit (Cursor Workflow)

Karena kamu pakai **Cursor + Vibes Coding**, struktur audit harus spesifik:

### 10. 🔍 SECURITY AUDIT TASKLIST (P3)

* [ ] Gunakan perintah Cursor:
  "Audit seluruh file untuk credential leak + password plaintext + token exposure"
* [ ] Cari pattern sensitive dengan regex:

  * [ ] `(password|secret|token|key)`
* [ ] Jalankan AI audit untuk folder:

  * [ ] `/services`
  * [ ] `/middlewares`
  * [ ] `/prisma`
  * [ ] `/auth`
* [ ] Generate Security Weakness Report via Cursor.
* [ ] Generate Auto-Fix Patch untuk 10 critical issues.
* [ ] Validate patch manual.

---

# 🌍 PHASE 6 — PWA + Multi-Device Experience

## 11. 📱 Multi-Device Layout (P4)

* [ ] Template layout: Desktop, Tablet Landscape, Phone.
* [ ] Breakpoints untuk kasir (landscape optimized).
* [ ] Touch-optimized UI components.
* [ ] Keyboard shortcuts untuk desktop kasir.

---

# ♻️ PHASE 7 — Fitur Nice-to-Have (tunda sampai stabil)

* [ ] Contact Submissions Management.
* [ ] System Info Page.
* [ ] N8N Webhook.
* [ ] Push Notifications.
* [ ] AI/ML Feature Playground.

---

# ⭐ PRIORITAS BESAR (Versi Singkat)

1. **Security** (paling wajib)
2. **Transactional Safety**
3. **Testing**
4. **POS Stabil, Offline-Safe**
5. **PWA + Auto Landscape**
6. **Performance Optimized**
7. Baru fitur tambahan

---

# 🔥 Speed Checklist untuk Cursor

Gunakan prompt ini di Cursor (simpan juga sebagai script):

```
[Audit Mode]
- Cari seluruh console.log
- Cari plaintext password
- Cari code yang berpotensi expose tenant lain
- Cari raw SQL atau dynamic query
- Cari missing await pada operasi DB
- Cari fungsi non-transactional yang menyentuh stock/order/payment
- Cari potensi race condition
- Cari unused imports, dead code, commented blocks
```

```
[Refactor Mode]
- Buat patch penghapusan console.log
- Konversi semua operasi critical → Prisma.transaction()
- Tambah idempotent key di order service
- Standardize all error handlers
```

```
[Security Mode]
- Tambahkan CSP
- Tambahkan sanitization
- Tambahkan JWT rotation
- Tambahkan Redis rate limit
```

```
[PWA Mode]
- Buat manifest.json
- Buat service worker dengan auto update
- Buat offline fallback
```

---

# 📌 Catatan

> Fokus pada produk yang **bisa dijual dan stabil**, bukan yang “wah tapi nggak dipakai market”.

Setelah Phase 1–2 selesai, kamu sudah siap *public beta*.

---

# 🛠️ CURSOR.AI FULL CHECK COMMANDS (Tambahan)

## 12. 🔍 FULL FUNCTIONALITY CHECK (Cursor AI)

Gunakan command berikut untuk menemukan error UI/UX, button tidak bekerja, event hilang, dan logic kacau:

### **[UI Event Audit]**

```
Cari di seluruh project:
- Fungsi yang dipanggil tapi tidak ada implementasi
- onClick/onSubmit/onChange yang referensinya undefined
- Komponen yang import function yang tidak pernah digunakan
- Komponen yang punya button tanpa handler
- Emit event yang tidak ditangkap di parent
- Handler async tanpa await (potensi race condition)
- try/catch kosong di UI yang menelan error
```

### **[Component Wiring Audit]**

```
Audit semua .vue:
- Cari `@click="*"` → pastikan semua method ada
- Cari "TODO" dalam fungsi UI
- Cari komponen yang memakai props tapi tidak diberikan dari parent
- Cari komponen yang punya watch tapi logikanya kosong
```

### **[Event Flow Debug]**

```
Untuk setiap page POS:
- Trace alur onClick dari button → method → service
- Cari missing return
- Cari missing await
- Cari state yang diubah tapi UI tidak reactive
```

### **[Global Logic Checker]**

```
Audit seluruh project untuk:
- Fungsi yang namanya sama tapi beda isi (duplikat)
- Fungsi yang tidak dipakai (dead code)
- Import yang salah path
- Komponen yang tidak pernah dipakai
```

---

## 13. 🔎 PROGRAM OTOMATIS UNTUK FULL CHECK ✅ SELESAI

* [x] Buat script `npm run check:ui`:

  * [x] Scan semua `.vue` untuk mencari handler hilang
  * [x] Scan import yang unresolved
  * [x] Scan fungsi undefined
  * [x] Scan props tanpa definisi
  * [x] Scan komponen orphan
* [x] Buat script `npm run check:logic`:

  * [x] Trace seluruh dependency tree service → cari circular
  * [x] Cek semua async/await consistency
  * [x] Cek fungsi kritikal tanpa error handling
* [x] Buat script `npm run check:events`:

  * [x] Parse semua `@click`, `@change`, `@submit`
  * [x] Validasi apakah method ada di `methods:`
* [x] Integrasikan semua script ke package.json (`npm run check:full-auto`)

---

# ✔️ Last Updated: (akan diperbarui setelah commit berikutnya)
