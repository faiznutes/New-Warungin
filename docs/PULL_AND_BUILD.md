# Cara Pull dan Build Project

## Pull dari GitHub

```bash
# Pull perubahan terbaru dari main branch
git pull origin main
```

## Build yang Diperlukan

### 1. Build Backend (TypeScript)
```bash
# Masuk ke direktori backend
cd src

# Install dependencies (jika ada perubahan package.json)
npm install

# Build TypeScript (compile ke JavaScript)
npm run build
```

### 2. Build Frontend (Vue.js)
```bash
# Masuk ke direktori client
cd client

# Install dependencies (jika ada perubahan package.json)
npm install

# Build untuk production
npm run build
```

### 3. Rebuild Docker Services (Hanya yang Diperlukan)

#### Rebuild Backend saja:
```bash
docker compose build backend
docker compose up -d backend
```

#### Rebuild Frontend saja:
```bash
docker compose build frontend
docker compose up -d frontend
```

#### Rebuild Backend + Frontend:
```bash
docker compose build backend frontend
docker compose up -d backend frontend
```

#### Rebuild Semua Services (jika ada perubahan besar):
```bash
docker compose build
docker compose up -d
```

## Restart Services (Tanpa Rebuild)

Jika hanya perlu restart service tanpa rebuild:

```bash
# Restart semua services
docker compose restart

# Restart service tertentu
docker compose restart backend
docker compose restart frontend
```

## Verifikasi Build

```bash
# Cek status semua services
docker compose ps

# Cek logs backend
docker compose logs backend --tail=50

# Cek logs frontend
docker compose logs frontend --tail=50
```

## Catatan Penting

1. **Tidak perlu rebuild database** kecuali ada perubahan schema Prisma
2. **Tidak perlu rebuild nginx** kecuali ada perubahan konfigurasi
3. **Tidak perlu rebuild cloudflared** kecuali ada perubahan konfigurasi
4. **Backend build** diperlukan jika ada perubahan TypeScript di `src/`
5. **Frontend build** diperlukan jika ada perubahan Vue.js di `client/`

## Jika Ada Error Build

### Backend Error:
```bash
# Cek TypeScript errors
cd src
npm run type-check

# Fix errors, lalu rebuild
npm run build
docker compose build backend
docker compose up -d backend
```

### Frontend Error:
```bash
# Cek Vue errors
cd client
npm run type-check

# Fix errors, lalu rebuild
npm run build
docker compose build frontend
docker compose up -d frontend
```

