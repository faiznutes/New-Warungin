# Warungin POS - SOP (Standard Operating Procedures)

## Emergency Contacts

- Developer: [TBD]
- Server Admin: [TBD]

---

## 1. Jika Server Mati

### Diagnosis

```bash
# Check container status
docker ps -a

# Check logs
docker compose logs --tail=100

# Check system resources
df -h
free -h
docker stats
```

### Recovery Steps

```bash
# Jika container berhenti
docker compose restart

# Jika database tidak responsive
docker compose restart postgres

# Jika penuh crash
docker compose down
docker compose up -d
```

### Estimated Downtime: 2-5 menit

---

## 2. Jika Disk Penuh

### Diagnosis

```bash
# Check disk usage
df -h

# Check Docker volumes
docker volume ls

# Check container logs
du -sh /var/lib/docker/containers/*
```

### Recovery Steps

```bash
# Clean Docker logs
docker compose logs --tail=0 > /dev/null
truncate -s 0 $(docker compose logs --tail=0 | grep -oP '/var/lib/docker/containers/[^ ]+' | head -1) 2>/dev/null || true

# Clean unused Docker resources
docker system prune -a

# Remove old backups (keep last 7 days)
find /mnt/warungin-backups -name "*.sql.gz" -mtime +7 -delete
```

### Prevention

- Log rotation: 50MB x 3 files per container
- Backup retention: 30 days
- Monitor with Prometheus/Grafana

---

## 3. Jika Database Corrupt

### Diagnosis

```bash
# Check PostgreSQL logs
docker compose logs postgres | grep -i error

# Test connection
docker exec -it warungin-postgres pg_isready
```

### Recovery Steps

```bash
# Stop backend
docker compose stop backend

# Restore from latest backup
./scripts/restore.sh

# Start backend
docker compose start backend
```

### Estimated Downtime: 10-30 menit (tergantung ukuran backup)

### Prevention

- Daily automatic backups at 2 AM
- WAL archiving enabled
- Health checks on all services

---

## 4. Daily Health Check Commands

```bash
# Quick status
docker compose ps

# Health checks
curl -s http://localhost:3000/health | jq

# Recent errors
docker compose logs --since=1h | grep -i error | tail -20

# Resource usage
docker stats --no-stream
```

---

## 5. Monitoring URLs

- Backend Health: http://localhost:3000/health
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Logs: http://localhost:3100

---

## 6. Quick Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart backend
docker compose restart backend

# View logs
docker compose logs -f backend

# Backup now
docker exec -it warungin-db-backup sh -c 'pg_dump -h postgres -U postgres -d warungin | gzip > /backup/manual_backup_$(date +%Y%m%d).sql.gz'
```

---

## 7. Version Info

Current Version: v1.0.0
Last Updated: 2026-02-19
