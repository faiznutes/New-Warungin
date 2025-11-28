# 🔧 Fix: Cloudflare Tunnel Down / Tidak Terkoneksi

## ❌ Gejala

Di Cloudflare One Dashboard (https://one.dash.cloudflare.com/):
- Tunnel status menunjukkan **"Down"** atau **"Disconnected"**
- Tidak ada koneksi dari cloudflared ke Cloudflare
- Error 1033 saat akses domain

## 🔍 Diagnosis

### Langkah 1: Check Cloudflared Container Status

```bash
# Di server SSH
cd ~/New-Warungin

# Check status
docker compose ps cloudflared

# Check logs
docker compose logs cloudflared | tail -50
```

**Cari error seperti:**
- `Unable to reach the origin service`
- `Tunnel token invalid`
- `Connection refused`
- `Failed to establish connection`

### Langkah 2: Check Tunnel Token

```bash
# Check token di .env
grep CLOUDFLARE_TUNNEL_TOKEN .env

# Token harus ada dan panjang (minimal 50 karakter)
# Format: eyJhIjoi... (base64 encoded)
```

**Jika token kosong atau terlalu pendek:**
- Token tidak di-set
- Token invalid atau expired
- Token salah di-copy

### Langkah 3: Test Tunnel Connection

```bash
# Test tunnel info (akan error jika token invalid)
docker compose exec cloudflared cloudflared tunnel info

# Test tunnel list
docker compose exec cloudflared cloudflared tunnel list
```

**Jika error:**
- Token invalid atau expired
- Network issue dari server ke Cloudflare

### Langkah 4: Check Network Connectivity

```bash
# Test internet connectivity dari cloudflared container
docker compose exec cloudflared ping -c 3 1.1.1.1

# Test DNS
docker compose exec cloudflared nslookup cloudflare.com

# Test HTTPS ke Cloudflare API
docker compose exec cloudflared wget -O- https://api.cloudflare.com 2>&1 | head -5
```

## ✅ Solusi

### Solusi 1: Regenerate Tunnel Token (Paling Umum)

**Jika token invalid atau expired:**

1. **Buka Cloudflare Dashboard:**
   - https://one.dash.cloudflare.com/
   - Login dengan akun Cloudflare Anda

2. **Hapus Tunnel Lama (Opsional):**
   - Zero Trust > Networks > Tunnels
   - Pilih tunnel yang down
   - Klik "Delete" atau "Remove"

3. **Buat Tunnel Baru:**
   - Klik **"Create a tunnel"**
   - Pilih **"Cloudflared"**
   - Beri nama (contoh: `warungin-tunnel`)
   - Klik **"Save tunnel"**

4. **Copy Tunnel Token:**
   - Setelah tunnel dibuat, Anda akan melihat **Tunnel Token**
   - **⚠️ PENTING:** Copy token sekarang! Token hanya ditampilkan sekali
   - Format: `eyJhIjoi...` (panjang, base64)

5. **Update di Server:**
   ```bash
   # Edit .env
   nano .env
   
   # Update atau tambahkan:
   CLOUDFLARE_TUNNEL_TOKEN=your_new_token_here
   
   # Save (Ctrl+X, Y, Enter)
   ```

6. **Restart Cloudflared:**
   ```bash
   # Stop cloudflared
   docker compose --profile cloudflare down cloudflared
   
   # Start dengan token baru
   docker compose --profile cloudflare up -d cloudflared
   
   # Check logs
   docker compose logs -f cloudflared
   ```

7. **Configure Public Hostname:**
   - Di Cloudflare Dashboard: Zero Trust > Networks > Tunnels
   - Pilih tunnel baru > **Configure**
   - Tab **Public Hostname** > **Add a public hostname**
   - Isi:
     - **Subdomain:** `pos`
     - **Domain:** `faiznute.site`
     - **Service URL:** `http://nginx:80` ⚠️ **PENTING!**
   - Klik **Save hostname**

8. **Verifikasi:**
   ```bash
   # Check tunnel info
   docker compose exec cloudflared cloudflared tunnel info
   
   # Check status di dashboard
   # Zero Trust > Networks > Tunnels > Your Tunnel
   # Status harus "Connected" atau "Active"
   ```

### Solusi 2: Fix Network Connectivity

**Jika cloudflared tidak bisa connect ke internet:**

```bash
# 1. Check DNS
docker compose exec cloudflared nslookup cloudflare.com

# 2. Check firewall (jika ada)
# Pastikan port 7844 (cloudflared) tidak di-block

# 3. Test dari host
ping -c 3 1.1.1.1
curl -I https://api.cloudflare.com

# 4. Restart Docker network
docker compose down
docker network prune -f
docker compose up -d
docker compose --profile cloudflare up -d cloudflared
```

### Solusi 3: Restart Cloudflared dengan Clean State

```bash
# 1. Stop cloudflared
docker compose --profile cloudflare down cloudflared

# 2. Remove container (force)
docker rm -f warungin-cloudflared 2>/dev/null || true

# 3. Pull latest image
docker pull cloudflare/cloudflared:latest

# 4. Start dengan clean state
docker compose --profile cloudflare up -d cloudflared

# 5. Monitor logs
docker compose logs -f cloudflared
```

### Solusi 4: Check Docker Network

**Jika cloudflared tidak di network yang benar:**

```bash
# Check network
docker network ls | grep warungin

# Check container network
docker inspect warungin-cloudflared | grep -A 10 "Networks"

# Recreate dengan network yang benar
docker compose --profile cloudflare down cloudflared
docker compose --profile cloudflare up -d cloudflared
```

### Solusi 5: Verify Environment Variables

```bash
# Check .env file
cat .env | grep CLOUDFLARE

# Verify token di container
docker compose exec cloudflared env | grep TUNNEL_TOKEN

# Jika tidak ada, restart dengan env yang benar
docker compose --profile cloudflare down cloudflared
docker compose --profile cloudflare up -d cloudflared
```

## 🔄 Langkah-Langkah Lengkap: Setup Ulang Tunnel

Jika semua solusi di atas tidak berhasil, setup ulang dari awal:

```bash
# 1. Stop semua
cd ~/New-Warungin
docker compose --profile cloudflare down cloudflared

# 2. Hapus container
docker rm -f warungin-cloudflared 2>/dev/null || true

# 3. Buat tunnel baru di Cloudflare Dashboard
# - https://one.dash.cloudflare.com/
# - Zero Trust > Networks > Tunnels
# - Create a tunnel > Cloudflared
# - Copy token

# 4. Update .env
nano .env
# Set: CLOUDFLARE_TUNNEL_TOKEN=new_token_here

# 5. Start cloudflared
docker compose --profile cloudflare up -d cloudflared

# 6. Check logs
docker compose logs -f cloudflared
# Harus melihat: "Connection established" atau "Tunnel is up"

# 7. Configure Public Hostname di Dashboard
# - Zero Trust > Networks > Tunnels > Your Tunnel
# - Configure > Public Hostname
# - Add: pos.faiznute.site -> http://nginx:80

# 8. Verifikasi
docker compose exec cloudflared cloudflared tunnel info
# Check di dashboard: Status harus "Connected"
```

## 📋 Checklist Troubleshooting

- [ ] Cloudflared container running (`docker compose ps cloudflared`)
- [ ] Tunnel token ada di `.env` dan tidak kosong
- [ ] Token valid (test: `docker compose exec cloudflared cloudflared tunnel info`)
- [ ] Internet connectivity dari server OK (`ping 1.1.1.1`)
- [ ] Cloudflared bisa reach Cloudflare API
- [ ] Public Hostname configured di Dashboard
- [ ] Service URL = `http://nginx:80` (bukan `localhost:80`)
- [ ] Tunnel status di Dashboard = "Connected" atau "Active"

## 🆘 Masih Down?

Jika tunnel masih down setelah semua langkah:

1. **Check Cloudflare Status:**
   - https://www.cloudflarestatus.com/
   - Pastikan tidak ada outage

2. **Check Server Resources:**
   ```bash
   # Check disk space
   df -h
   
   # Check memory
   free -h
   
   # Check Docker resources
   docker system df
   ```

3. **Check Firewall:**
   ```bash
   # Pastikan port 7844 tidak di-block
   # Cloudflared menggunakan port 7844 untuk tunnel
   ```

4. **Contact Support:**
   - Cloudflare Support: https://support.cloudflare.com/
   - Atau check Cloudflare Community

## 📊 Monitoring

### Check Tunnel Status

```bash
# Di server
docker compose exec cloudflared cloudflared tunnel info

# Di Dashboard
# Zero Trust > Networks > Tunnels > Your Tunnel
# Lihat status, metrics, dan connection info
```

### View Real-time Logs

```bash
# Follow logs
docker compose logs -f cloudflared

# Cari:
# - "Connection established" = Berhasil
# - "Tunnel is up" = Berhasil
# - "Unable to reach" = Error
# - "Connection refused" = Error
```

## 🔗 Referensi

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Troubleshooting Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/troubleshooting/)
- [Cloudflare One Dashboard](https://one.dash.cloudflare.com/)

---

**Last Updated:** 2025-11-28  
**Domain:** pos.faiznute.site

