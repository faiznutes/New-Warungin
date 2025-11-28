# 🔄 Force Rebuild Frontend - Complete Reset

Panduan untuk force rebuild frontend container dengan menghapus semua cache dan build lama.

---

## 🔍 Masalah

Perubahan tampilan masih tidak terlihat meskipun sudah rebuild. Perlu force rebuild dengan menghapus semua cache dan build lama.

---

## ✅ Solusi: Force Rebuild Complete

### Step 1: Stop Container

```bash
# Stop frontend container
docker compose stop frontend

# Atau stop semua container
docker compose stop
```

### Step 2: Remove Container dan Image

```bash
# Remove frontend container
docker compose rm -f frontend

# Remove frontend image (jika ada)
docker rmi new-warungin-frontend 2>/dev/null || true
docker rmi $(docker images | grep 'new-warungin-frontend' | awk '{print $3}') 2>/dev/null || true
```

### Step 3: Pull Code Terbaru

```bash
# Pastikan code terbaru
cd ~/New-Warungin
git pull origin main

# Verifikasi file POS.vue sudah terupdate
git log --oneline -5
```

### Step 4: Clear Docker Build Cache

```bash
# Clear build cache
docker builder prune -f

# Clear semua unused resources (optional, hati-hati)
# docker system prune -a --volumes
```

### Step 5: Rebuild dari Awal

```bash
# Rebuild frontend tanpa cache
docker compose build --no-cache --pull frontend
```

### Step 6: Start Container

```bash
# Start frontend
docker compose up -d frontend

# Atau start semua
docker compose up -d
```

### Step 7: Verifikasi

```bash
# Cek status
docker compose ps frontend

# Cek logs
docker compose logs --tail=100 frontend

# Cek apakah file sudah terupdate di container
docker compose exec frontend ls -la /usr/share/nginx/html | head -20
```

---

## 🚀 All-in-One Script (Copy-Paste)

```bash
# 1. Stop dan remove container
cd ~/New-Warungin
docker compose stop frontend
docker compose rm -f frontend

# 2. Remove image (jika ada)
docker rmi new-warungin-frontend 2>/dev/null || true

# 3. Pull code terbaru
git pull origin main

# 4. Clear build cache
docker builder prune -f

# 5. Rebuild dari awal
docker compose build --no-cache --pull frontend

# 6. Start container
docker compose up -d frontend

# 7. Cek status dan logs
docker compose ps frontend
docker compose logs --tail=50 frontend
```

---

## 🔍 Verifikasi Code Sudah Terupdate

Sebelum rebuild, pastikan code sudah terupdate:

```bash
# Cek apakah file POS.vue sudah terupdate
cd ~/New-Warungin
git log --oneline -10 | grep -i "pos\|design"

# Cek isi file POS.vue (baris pertama untuk verifikasi)
head -5 client/src/views/pos/POS.vue

# Cek apakah ada perubahan yang belum di-commit
git status
```

---

## 🌐 Clear Browser Cache (Penting!)

Setelah rebuild, **WAJIB** clear browser cache:

### Chrome/Edge:
1. Tekan `F12` untuk buka DevTools
2. Klik kanan pada tombol refresh
3. Pilih "Empty Cache and Hard Reload"

### Atau:
- Windows: `Ctrl + Shift + Delete` → Pilih semua → Clear
- Mac: `Cmd + Shift + Delete` → Clear

### Atau Incognito/Private Window:
- Buka halaman POS di Incognito/Private window untuk test tanpa cache

---

## 🆘 Troubleshooting

### Error: Image tidak terhapus

```bash
# Force remove image
docker rmi -f new-warungin-frontend

# Atau remove semua image yang tidak digunakan
docker image prune -a -f
```

### Error: Build masih menggunakan cache

```bash
# Clear semua build cache
docker builder prune -a -f

# Rebuild lagi
docker compose build --no-cache --pull frontend
```

### Perubahan Masih Tidak Terlihat

1. **Verifikasi code sudah ter-pull** dengan `git log`
2. **Cek file di container** dengan `docker compose exec frontend cat /usr/share/nginx/html/index.html | head -20`
3. **Clear browser cache** dengan hard refresh (`Ctrl + Shift + R`)
4. **Test di Incognito window** untuk memastikan bukan masalah cache browser
5. **Cek apakah menggunakan container yang benar** dengan `docker compose ps`

### Build Error

```bash
# Cek logs build
docker compose build --no-cache frontend 2>&1 | tee build.log

# Cek error di log
cat build.log | grep -i error
```

---

## 💡 Tips Tambahan

1. **Gunakan `--pull` flag** untuk memastikan base image terbaru
2. **Clear browser cache** setelah setiap rebuild
3. **Test di Incognito** untuk memastikan bukan masalah cache
4. **Cek git log** untuk memastikan code sudah ter-pull
5. **Verifikasi file di container** untuk memastikan build berhasil

---

## ✅ Checklist Final

- [ ] Container sudah di-stop dan di-remove
- [ ] Image sudah di-remove
- [ ] Code sudah di-pull dari GitHub
- [ ] Build cache sudah di-clear
- [ ] Rebuild sudah dilakukan dengan `--no-cache --pull`
- [ ] Container sudah di-start
- [ ] Browser cache sudah di-clear
- [ ] Test di Incognito window
- [ ] Perubahan tampilan sudah terlihat

---

**Last Updated:** 2024-11-28

