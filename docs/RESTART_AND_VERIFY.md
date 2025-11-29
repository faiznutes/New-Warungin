# Restart Backend dan Verifikasi

## Step 1: Restart Backend

```bash
docker compose restart backend
```

## Step 2: Cek Logs Backend

```bash
docker compose logs -f backend
```

Tunggu beberapa detik untuk melihat apakah backend start dengan sukses. Cari pesan seperti:
- `✅ Database connection established`
- `Server running on port 3000`
- Tidak ada error tentang `addedBySuperAdmin` atau `column does not exist`

## Step 3: Test Login

Coba login di browser:
- URL: `https://pos.faiznute.site/login`
- Cek apakah error 502 sudah hilang

## Step 4: Jika Masih Error 502

### Cek apakah backend container running

```bash
docker compose ps
```

### Cek logs untuk error spesifik

```bash
docker compose logs backend | tail -50
```

### Cek apakah ada error Prisma

```bash
docker compose logs backend | grep -i "prisma\|error\|failed"
```

## Step 5: Jika Backend Crash

### Rebuild backend

```bash
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### Cek logs lagi

```bash
docker compose logs -f backend
```

