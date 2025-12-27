# SSH Remote Server - New-Warungin

Dokumentasi untuk akses SSH ke server Debian 13 untuk project New-Warungin.

## Informasi Server

| Item | Value |
|------|-------|
| **IP Address** | `192.168.1.101` |
| **User** | `faiz` |
| **Password User** | `123` |
| **Root Password** | `123` |
| **OS** | Debian 13 Server |
| **Project Directory** | `/root/New-Warungin` |

## Perintah SSH

### 1. Connect SSH dengan sshpass (Otomatis tanpa prompt password)

```bash
# Connect sebagai user faiz
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101

# Connect dan langsung jalankan command
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'command_here'
```

### 2. Connect SSH Manual

```bash
# Connect biasa (akan prompt password)
ssh faiz@192.168.1.101
# Password: 123
```

### 3. Masuk Root (setelah SSH)

```bash
su -
# Password: 123
```

### 4. Navigasi ke Project Directory

```bash
cd /root/New-Warungin
```

## Docker Commands

### Cek Docker yang berjalan
```bash
docker ps -a
docker compose ps
```

### Restart semua containers
```bash
docker compose down
docker compose up -d
```

### Rebuild dan restart
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Lihat logs
```bash
docker compose logs -f
docker compose logs -f [service_name]
```

## One-Liner Commands (untuk AI)

### Cek status Docker (via root)
```bash
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo 123 | su - -c 'cd /root/New-Warungin && docker ps -a'"
```

### Cek status Docker Compose
```bash
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo 123 | su - -c 'cd /root/New-Warungin && docker compose ps'"
```

### Git pull dan rebuild
```bash
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo 123 | su - -c 'cd /root/New-Warungin && git pull && docker compose build --no-cache && docker compose up -d'"
```

### Restart containers tanpa rebuild
```bash
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo 123 | su - -c 'cd /root/New-Warungin && docker compose restart'"
```

### Lihat logs realtime
```bash
sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo 123 | su - -c 'cd /root/New-Warungin && docker compose logs -f --tail=100'"
```

## Pro Tips untuk AI Agent

1. **Project ada di `/root/New-Warungin`** - selalu gunakan path absolut ini
2. **Pastikan sshpass terinstall** di WSL dengan `sudo apt install sshpass`
3. **Harus masuk root** untuk akses project - gunakan `echo 123 | su - -c 'command'`
4. **Jika WSL bermasalah**, gunakan terminal PowerShell atau coba restart WSL

## Troubleshooting

### WSL tidak bisa SSH
```bash
# Pastikan WSL running
wsl --status

# Restart WSL jika perlu
wsl --shutdown
wsl
```

### Docker permission denied
```bash
# Pastikan user faiz ada di group docker
sudo usermod -aG docker faiz
# Re-login untuk apply
```

### Container tidak healthy
```bash
# Lihat status health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check logs specific container
docker compose logs [container_name]
```

---

> [!IMPORTANT]  
> **Default Terminal HARUS PowerShell** - Jika menggunakan WSL sebagai default terminal, SSH commands akan error dengan "Invalid command line argument: -c". Pastikan VS Code/IDE menggunakan PowerShell sebagai default terminal.

## Docker Status Terakhir (2025-12-27 18:52)

| Container | Status |
|-----------|--------|
| warungin-nginx | ✅ healthy |
| warungin-frontend | ✅ healthy |
| warungin-backend | ⏳ starting |
| warungin-postgres | ✅ healthy |
| warungin-redis | ✅ healthy |
| warungin-loki | ⚠️ unhealthy |
| warungin-cloudflared | ⚠️ unhealthy |
| warungin-promtail | ❌ not running |

---

**Last Updated:** 2025-12-27 18:52
**Author:** AI Assistant (Antigravity)
