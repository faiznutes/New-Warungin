# 🔧 Fix NPX Cache Error - Prisma Installation

Panduan untuk memperbaiki error npx cache corrupted saat menjalankan prisma migrate.

---

## 🔍 Masalah

Error saat menjalankan `npx prisma migrate deploy`:
- `npm warn tar ENOENT: Cannot cd into...`
- `npm error ENOTEMPTY: directory not empty`
- NPX cache corrupted

---

## ✅ Solusi

### Opsi 1: Clear NPX Cache (Recommended)

```bash
# Clear npx cache di container
docker compose exec backend rm -rf /home/nodejs/.npm/_npx

# Atau clear semua npm cache
docker compose exec backend npm cache clean --force

# Coba lagi migrate
docker compose exec backend npx prisma migrate deploy
```

### Opsi 2: Gunakan Prisma yang Sudah Terinstall

Jika prisma sudah terinstall di container, gunakan langsung tanpa npx:

```bash
# Cek apakah prisma sudah terinstall
docker compose exec backend npm list prisma

# Jika sudah terinstall, gunakan langsung
docker compose exec backend npm run prisma:migrate:deploy

# Atau jika ada script di package.json
docker compose exec backend npx --yes prisma migrate deploy
```

### Opsi 3: Install Prisma di Container

```bash
# Install prisma di container
docker compose exec backend npm install -g prisma

# Atau install sebagai dev dependency
docker compose exec backend npm install --save-dev prisma

# Coba lagi migrate
docker compose exec backend npx prisma migrate deploy
```

### Opsi 4: Rebuild Container (Jika Opsi Lain Gagal)

```bash
# Rebuild backend container
docker compose build --no-cache backend

# Restart container
docker compose up -d backend

# Coba lagi migrate
docker compose exec backend npx prisma migrate deploy
```

---

## 🚀 Solusi Cepat (Copy-Paste)

```bash
# 1. Clear npx cache
docker compose exec backend rm -rf /home/nodejs/.npm/_npx

# 2. Clear npm cache
docker compose exec backend npm cache clean --force

# 3. Coba lagi migrate
docker compose exec backend npx prisma migrate deploy
```

---

## 🔍 Alternatif: Gunakan Prisma dari package.json

Jika prisma sudah ada di `package.json`, gunakan npm script:

```bash
# Cek package.json untuk script prisma
docker compose exec backend cat package.json | grep -A 5 "scripts"

# Jika ada script prisma:migrate:deploy, gunakan:
docker compose exec backend npm run prisma:migrate:deploy

# Atau jika ada script prisma:migrate, gunakan:
docker compose exec backend npm run prisma:migrate
```

---

## 🆘 Troubleshooting

### Error: npm cache clean failed

```bash
# Force clear cache
docker compose exec backend rm -rf /home/nodejs/.npm

# Atau masuk ke container dan clear manual
docker compose exec backend sh
rm -rf /home/nodejs/.npm
exit
```

### Error: prisma command not found

Install prisma terlebih dahulu:

```bash
docker compose exec backend npm install -g prisma
```

### Error: Permission denied

```bash
# Gunakan user yang benar
docker compose exec -u root backend npm cache clean --force
```

---

## 💡 Tips

1. **Gunakan npm script** - Lebih reliable daripada npx jika prisma sudah terinstall
2. **Clear cache secara berkala** - Untuk menghindari cache corruption
3. **Install prisma di container** - Untuk menghindari masalah npx cache
4. **Gunakan --yes flag** - Untuk skip prompt saat menggunakan npx

---

**Last Updated:** 2024-11-28

