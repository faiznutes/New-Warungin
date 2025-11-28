# Panduan Pull Manual dan Migrate Database di SSH

Dokumentasi lengkap untuk melakukan pull manual dari GitHub dan migrate database di server SSH.

---

## 📋 Prerequisites

1. Akses SSH ke server
2. Akses ke direktori project
3. Akses ke database PostgreSQL
4. Environment variables sudah dikonfigurasi (`.env`)
5. Node.js dan npm sudah terinstall (atau gunakan Docker)

## ⚠️ Troubleshooting: npx command not found

Jika muncul error `npx: command not found`, ada beberapa solusi:

### Solusi 1: Install Node.js dan npm

```bash
# Untuk Debian/Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### Solusi 2: Gunakan Docker (Recommended)

Jika project menggunakan Docker, gunakan Docker untuk menjalankan migrate:

```bash
# Masuk ke container backend
docker compose exec backend sh

# Atau langsung jalankan command di container
docker compose exec backend npx prisma migrate deploy
```

### Solusi 3: Gunakan npm run script

Jika `npx` tidak tersedia, gunakan npm run script:

```bash
# Di package.json, pastikan ada script:
# "prisma:migrate": "prisma migrate deploy"

# Jalankan dengan:
npm run prisma:migrate
```

---

## 🔄 Pull Manual dari GitHub

### 1. Masuk ke Server via SSH

```bash
ssh user@your-server-ip
# atau
ssh user@your-server-domain
```

### 2. Navigate ke Direktori Project

```bash
cd /path/to/your/project
# Contoh:
cd /var/www/new-warungin
# atau
cd ~/projects/new-warungin
```

### 3. Cek Status Git

```bash
git status
```

### 4. Stash Perubahan Lokal (Jika Ada)

Jika ada perubahan lokal yang belum di-commit:

```bash
git stash
# atau jika ingin menyimpan dengan nama
git stash save "backup sebelum pull"
```

### 5. Pull dari GitHub

```bash
# Pull dari branch main
git pull origin main

# Atau jika ingin pull dari branch tertentu
git pull origin <branch-name>
```

### 6. Restore Stash (Jika Ada)

Jika sebelumnya melakukan stash:

```bash
git stash pop
```

### 7. Cek Perubahan

```bash
git log --oneline -5
# Menampilkan 5 commit terakhir
```

---

## 🗄️ Migrate Database

### 1. Masuk ke Direktori Backend

```bash
cd /path/to/your/project
# Pastikan berada di root project yang memiliki folder prisma
```

### 2. Install Dependencies (Jika Perlu)

```bash
# Jika ada package baru yang ditambahkan
npm install
# atau
yarn install
```

### 3. Generate Prisma Client

#### Opsi A: Menggunakan npx (Jika Node.js terinstall)

```bash
npx prisma generate
```

#### Opsi B: Menggunakan Docker

```bash
docker compose exec backend npx prisma generate
```

#### Opsi C: Menggunakan npm run script

```bash
npm run prisma:generate
# Pastikan di package.json ada: "prisma:generate": "prisma generate"
```

### 4. Cek Status Migration

#### Opsi A: Menggunakan npx

```bash
npx prisma migrate status
```

#### Opsi B: Menggunakan Docker

```bash
docker compose exec backend npx prisma migrate status
```

Ini akan menampilkan:
- Migration yang sudah dijalankan
- Migration yang belum dijalankan
- Database schema vs migration files

### 5. Jalankan Migration

#### A. Migrate Development (Untuk Development)

**Menggunakan npx:**
```bash
npx prisma migrate dev
```

**Menggunakan Docker:**
```bash
docker compose exec backend npx prisma migrate dev
```

**Catatan:** Command ini akan:
- Membuat migration file baru jika ada perubahan schema
- Menjalankan migration
- Regenerate Prisma Client

#### B. Migrate Deploy (Untuk Production - RECOMMENDED)

**Menggunakan npx:**
```bash
npx prisma migrate deploy
```

**Menggunakan Docker:**
```bash
docker compose exec backend npx prisma migrate deploy
```

**Menggunakan npm run script:**
```bash
npm run prisma:migrate
# Pastikan di package.json ada: "prisma:migrate": "prisma migrate deploy"
```

**Catatan:** Command ini:
- Hanya menjalankan migration yang belum dijalankan
- Tidak membuat migration file baru
- Aman untuk production

### 6. Verifikasi Migration

```bash
# Cek status lagi
npx prisma migrate status

# Cek schema database
npx prisma db pull
```

---

## 🔧 Troubleshooting

### Error: Migration Already Applied

Jika muncul error bahwa migration sudah dijalankan:

```bash
# Reset migration status (HATI-HATI: Hanya untuk development!)
npx prisma migrate reset

# Atau resolve manual
npx prisma migrate resolve --applied <migration-name>
```

### Error: Database Connection

Pastikan environment variables sudah benar:

```bash
# Cek file .env
cat .env | grep DATABASE_URL

# Test koneksi database
npx prisma db pull
```

### Error: Permission Denied

Jika ada error permission:

```bash
# Cek permission file
ls -la

# Ubah permission jika perlu
chmod +x node_modules/.bin/prisma
```

### Rollback Migration (Development Only)

```bash
# Reset semua migration (HATI-HATI: Akan menghapus data!)
npx prisma migrate reset

# Atau rollback ke migration tertentu
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 📝 Script Otomatis

Anda bisa membuat script untuk memudahkan proses:

### Script: `pull-and-migrate.sh`

```bash
#!/bin/bash

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting pull and migrate process...${NC}"

# 1. Pull dari GitHub
echo -e "${GREEN}📥 Pulling from GitHub...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi

# 2. Install dependencies (optional)
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# 3. Generate Prisma Client
echo -e "${GREEN}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# 4. Run migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pull and migrate completed successfully!${NC}"
```

### Cara Menggunakan Script:

```bash
# Buat file script
nano pull-and-migrate.sh

# Copy script di atas ke file

# Berikan permission execute
chmod +x pull-and-migrate.sh

# Jalankan script
./pull-and-migrate.sh
```

---

## 🔐 Best Practices

### 1. Backup Database Sebelum Migrate

```bash
# Backup database PostgreSQL
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau menggunakan Prisma
npx prisma db pull --schema=backup.prisma
```

### 2. Test di Staging Terlebih Dahulu

Selalu test migration di staging environment sebelum production.

### 3. Monitor Logs

```bash
# Monitor application logs
tail -f logs/app.log

# Monitor database logs
tail -f /var/log/postgresql/postgresql.log
```

### 4. Verifikasi Setelah Migrate

```bash
# Cek migration status
npx prisma migrate status

# Cek schema database
npx prisma studio
# Akan membuka browser dengan Prisma Studio
```

---

## 📋 Checklist

Sebelum menjalankan migrate di production:

- [ ] Backup database sudah dibuat
- [ ] Environment variables sudah benar
- [ ] Dependencies sudah terinstall
- [ ] Migration sudah ditest di staging
- [ ] Maintenance mode sudah diaktifkan (jika perlu)
- [ ] Backup aplikasi sudah dibuat
- [ ] Tim sudah diberitahu tentang maintenance

---

## 🆘 Emergency Rollback

Jika terjadi masalah setelah migrate:

### 1. Rollback Migration

```bash
# Rollback migration terakhir
npx prisma migrate resolve --rolled-back <migration-name>
```

### 2. Restore Database

```bash
# Restore dari backup
psql -U username -d database_name < backup_file.sql
```

### 3. Revert Code

```bash
# Revert ke commit sebelumnya
git revert HEAD
# atau
git reset --hard <previous-commit-hash>
```

---

## 📞 Support

Jika mengalami masalah:

1. Cek logs aplikasi dan database
2. Cek status migration: `npx prisma migrate status`
3. Cek koneksi database: `npx prisma db pull`
4. Hubungi tim development

---

## 📚 Referensi

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Git Pull Documentation](https://git-scm.com/docs/git-pull)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/current/backup.html)

