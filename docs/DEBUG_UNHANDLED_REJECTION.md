# Debug Unhandled Rejection Error

## Step 1: Cek log lengkap untuk melihat error detail

```bash
docker compose logs backend | tail -100
```

Atau untuk melihat log real-time:
```bash
docker compose logs -f backend
```

## Step 2: Cek apakah backend container running

```bash
docker compose ps
```

## Step 3: Cek apakah backend listen di port 3000

```bash
docker compose exec backend netstat -tlnp | grep 3000
```

Atau:
```bash
docker compose exec backend ss -tlnp | grep 3000
```

## Step 4: Cek error stack trace

```bash
docker compose logs backend | grep -A 20 "Unhandled Rejection"
```

## Step 5: Test koneksi ke backend

```bash
curl -I http://localhost:3000/health
```

Atau dari dalam container:
```bash
docker compose exec backend curl -I http://localhost:3000/health
```

## Step 6: Jika backend tidak start

### Cek apakah ada syntax error atau runtime error

```bash
docker compose logs backend | grep -i "error\|failed\|crash\|exit"
```

### Cek apakah database connection OK

```bash
docker compose exec backend npx prisma db pull
```

### Restart dengan verbose logging

```bash
docker compose down
docker compose up -d backend
docker compose logs -f backend
```

## Step 7: Jika masih error, cek environment variables

```bash
docker compose exec backend env | grep -E "DATABASE|REDIS|JWT|NODE_ENV"
```

