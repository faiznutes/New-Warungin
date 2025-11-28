# 🔧 Fix Docker Network Error: "network not found"

## ❌ Error Message

```
Error response from daemon: failed to set up container networking: 
network 88f605a3482b7d222e79c502edc5e296470ab448c19acaa19e7d7a5e343a9e9d not found
```

## 🔍 Penyebab

- Container lama masih reference ke network yang sudah dihapus
- Docker network state tidak konsisten
- Container dibuat dengan network yang berbeda
- Network dihapus manual tapi container masih ada

## ✅ Solusi Cepat

### Langkah 1: Stop dan Remove Semua Container

```bash
# Stop semua container
docker compose down

# Remove semua container yang terkait (force)
docker rm -f warungin-postgres warungin-backend warungin-frontend warungin-nginx warungin-cloudflared warungin-redis 2>/dev/null || true
```

### Langkah 2: Clean Up Networks

```bash
# List semua networks
docker network ls

# Remove network yang bermasalah (jika ada)
docker network rm new-warungin_warungin-network 2>/dev/null || true
docker network rm warungin-network 2>/dev/null || true

# Remove semua unused networks
docker network prune -f
```

### Langkah 3: Restart dengan Clean State

```bash
# Pastikan di directory project
cd ~/New-Warungin

# Pull latest code (jika ada update)
git pull origin main

# Start semua services dengan urutan yang benar
docker compose down -v  # Remove volumes juga jika perlu (HATI-HATI: akan hapus data!)

# Start services satu per satu
docker compose up -d postgres
# Tunggu postgres ready
sleep 10
docker compose ps postgres  # Pastikan healthy

docker compose up -d backend
# Tunggu backend ready
sleep 15
docker compose ps backend  # Pastikan healthy

docker compose up -d frontend
sleep 10

docker compose up -d nginx
# Tunggu nginx ready
sleep 15
docker compose ps nginx  # Pastikan healthy

# Terakhir, start cloudflared
docker compose --profile cloudflare up -d cloudflared
sleep 10

# Check status
docker compose ps
```

### Langkah 4: Verifikasi

```bash
# Check semua container running
docker compose ps

# Check network
docker network ls | grep warungin

# Check logs
docker compose logs cloudflared | tail -20
```

## 🔄 Solusi Alternatif: Full Clean Restart

Jika masih error, lakukan full clean:

```bash
# 1. Stop semua
docker compose down -v

# 2. Remove semua container (force)
docker ps -a | grep warungin | awk '{print $1}' | xargs docker rm -f 2>/dev/null || true

# 3. Remove semua network yang terkait
docker network ls | grep warungin | awk '{print $1}' | xargs docker network rm 2>/dev/null || true

# 4. Prune unused resources
docker system prune -f

# 5. Recreate dari awal
docker compose up -d

# 6. Start cloudflared
docker compose --profile cloudflare up -d cloudflared
```

## 🛡️ Prevent Future Issues

1. **Selalu gunakan `docker compose down` sebelum `docker compose up`**
2. **Jangan hapus network manual jika container masih ada**
3. **Gunakan `docker compose down` bukan `docker stop` untuk stop services**

## 📋 Checklist

- [ ] Semua container stopped dengan `docker compose down`
- [ ] Network yang bermasalah sudah dihapus
- [ ] Unused networks sudah di-prune
- [ ] Services started dengan urutan yang benar
- [ ] Semua container status "Up" dan "healthy"
- [ ] Network `warungin-network` ada dan terhubung ke semua container

## 🆘 Masih Error?

Jika masih error setelah langkah di atas:

1. **Check Docker daemon:**
   ```bash
   docker info
   ```

2. **Restart Docker service:**
   ```bash
   sudo systemctl restart docker
   ```

3. **Check disk space:**
   ```bash
   df -h
   docker system df
   ```

4. **Full system prune (HATI-HATI):**
   ```bash
   docker system prune -a --volumes -f
   # Ini akan hapus SEMUA yang tidak digunakan, termasuk images!
   ```

---

**Last Updated:** 2025-11-28

