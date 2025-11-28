# 🔄 Rebuild Frontend Container

Panduan untuk rebuild frontend container agar perubahan tampilan terlihat.

---

## 🔍 Masalah

Perubahan tampilan di page POS tidak terlihat karena:
- Frontend container masih menggunakan build lama
- Perlu rebuild container untuk menggunakan code terbaru

---

## ✅ Solusi: Rebuild Frontend Container

### Step 1: Pull Code Terbaru (Jika Belum)

```bash
# Masuk ke direktori project
cd ~/New-Warungin

# Pull code terbaru dari GitHub
git pull origin main
```

### Step 2: Rebuild Frontend Container

```bash
# Rebuild frontend container tanpa cache
docker compose build --no-cache frontend

# Atau rebuild dengan cache (lebih cepat)
docker compose build frontend
```

### Step 3: Restart Frontend Container

```bash
# Stop dan start ulang frontend container
docker compose up -d frontend

# Atau restart semua container
docker compose restart frontend
```

### Step 4: Verifikasi

```bash
# Cek status container
docker compose ps frontend

# Cek logs untuk memastikan tidak ada error
docker compose logs -f frontend
```

---

## 🚀 All-in-One Command (Copy-Paste)

```bash
# 1. Pull code terbaru
cd ~/New-Warungin
git pull origin main

# 2. Rebuild frontend
docker compose build --no-cache frontend

# 3. Restart frontend
docker compose up -d frontend

# 4. Cek status
docker compose ps frontend
```

---

## 🔄 Rebuild Semua Container (Jika Perlu)

Jika ingin rebuild semua container:

```bash
# Rebuild semua
docker compose build --no-cache

# Restart semua
docker compose up -d
```

---

## 🌐 Clear Browser Cache

Setelah rebuild, clear browser cache untuk memastikan perubahan terlihat:

### Chrome/Edge:
1. Tekan `Ctrl + Shift + Delete` (Windows) atau `Cmd + Shift + Delete` (Mac)
2. Pilih "Cached images and files"
3. Klik "Clear data"

### Atau Hard Refresh:
- Windows: `Ctrl + F5` atau `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 🆘 Troubleshooting

### Error: Build failed

```bash
# Cek logs untuk error
docker compose logs frontend

# Cek apakah ada masalah dengan dependencies
docker compose exec frontend npm list
```

### Error: Container tidak start

```bash
# Cek logs
docker compose logs frontend

# Cek status
docker compose ps frontend

# Restart dengan force
docker compose up -d --force-recreate frontend
```

### Perubahan Masih Tidak Terlihat

1. **Clear browser cache** (lihat di atas)
2. **Cek apakah code sudah di-pull** di server
3. **Verifikasi build berhasil** dengan cek logs
4. **Cek apakah menggunakan container yang benar** dengan `docker compose ps`

---

## 💡 Tips

1. **Gunakan `--no-cache`** untuk memastikan build dari awal (lebih lama tapi lebih aman)
2. **Clear browser cache** setelah rebuild untuk memastikan perubahan terlihat
3. **Cek logs** setelah rebuild untuk memastikan tidak ada error
4. **Verifikasi build** dengan cek file di container: `docker compose exec frontend ls -la /usr/share/nginx/html`

---

## ✅ Checklist

- [ ] Code sudah di-pull dari GitHub
- [ ] Frontend container sudah di-rebuild
- [ ] Frontend container sudah di-restart
- [ ] Browser cache sudah di-clear
- [ ] Perubahan tampilan sudah terlihat

---

**Last Updated:** 2024-11-28

