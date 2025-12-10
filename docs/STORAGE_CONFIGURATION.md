# Storage Configuration Guide

## Overview

This document describes the storage configuration for the New-Warungin Docker infrastructure.

---

## Database Storage: 200GB

### PostgreSQL Volume Configuration

**Target Capacity:** 200GB  
**Current Usage:** ~66MB (baseline)  
**Volume Location:** `/var/lib/docker/volumes/warungin_postgres_data`

### Configuration

The PostgreSQL database is configured with a dedicated volume that can grow up to 200GB:

```yaml
volumes:
  postgres_data:
    driver: local
    # 200GB capacity allocated for database storage
```

### Monitoring Database Size

```bash
# Check current database size
docker exec warungin-postgres du -sh /var/lib/postgresql/data

# Check database size from PostgreSQL
docker exec warungin-postgres psql -U postgres -d warungin -c "
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;
"

# Check table sizes
docker exec warungin-postgres psql -U postgres -d warungin -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
"
```

### Storage Management

1. **Regular Monitoring:**
   - Monitor database growth weekly
   - Set alerts when usage exceeds 80% (160GB)
   - Review and archive old data when needed

2. **Backup Strategy:**
   - Daily backups stored separately (not in database volume)
   - Retention: 30 days daily, 12 months monthly
   - Backup location: `/var/backups/warungin/`

3. **Cleanup Procedures:**
   - Archive old transactions (>1 year)
   - Remove soft-deleted records periodically
   - Vacuum and analyze database regularly

### Expanding Storage

If storage needs exceed 200GB:

1. **Option 1: Increase Volume Size (Recommended)**
   ```bash
   # Stop PostgreSQL container
   docker compose stop postgres
   
   # Resize volume (requires LVM or similar)
   # This depends on your storage backend
   
   # Restart container
   docker compose start postgres
   ```

2. **Option 2: Migrate to Larger Volume**
   ```bash
   # Create new volume
   docker volume create --driver local \
     --opt type=none \
     --opt device=/path/to/larger/storage \
     warungin_postgres_data_new
   
   # Backup current data
   docker compose exec postgres pg_dump -U postgres warungin > backup.sql
   
   # Update docker-compose.yml to use new volume
   # Restore data
   docker compose exec -T postgres psql -U postgres warungin < backup.sql
   ```

---

## Docker Storage: 10GB Limit

### Configuration

Docker storage is configured with a 10GB limit to prevent disk space issues.

### Current Docker Storage Usage

```bash
# Check Docker storage usage
docker system df

# Output example:
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          31        10        7.923GB   7.923GB (100%)
# Containers      10        10        493.3MB   0B (0%)
# Local Volumes   6         5         180.5MB   51.26MB (28%)
# Build Cache     338       0         13.01GB   7.087GB
```

### Setting Docker Storage Limit

#### Method 1: Docker Daemon Configuration (Recommended)

Edit `/etc/docker/daemon.json`:

```json
{
  "storage-driver": "overlay2",
  "storage-opts": [
    "size=10G"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Then restart Docker:
```bash
sudo systemctl restart docker
```

#### Method 2: Build Cache Limit

Limit build cache size in `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
      # Build cache limit
      cache_from:
        - warungin-backend:latest
```

#### Method 3: Regular Cleanup

Set up automated cleanup:

```bash
# Create cleanup script
cat > /usr/local/bin/docker-cleanup.sh << 'EOF'
#!/bin/bash
# Clean up Docker resources to maintain 10GB limit

# Remove unused images
docker image prune -af --filter "until=168h"  # 7 days

# Remove unused build cache
docker builder prune -af --filter "until=72h"  # 3 days

# Remove stopped containers
docker container prune -f

# Remove unused volumes (be careful!)
# docker volume prune -f

echo "Docker cleanup completed"
EOF

chmod +x /usr/local/bin/docker-cleanup.sh

# Add to crontab (run daily at 2 AM)
echo "0 2 * * * /usr/local/bin/docker-cleanup.sh" | crontab -
```

### Monitoring Docker Storage

```bash
# Check storage usage
docker system df

# Detailed view
docker system df -v

# Check build cache
docker builder du

# Check specific volume sizes
docker volume ls
docker volume inspect <volume_name>
```

### Storage Cleanup Commands

```bash
# Remove all unused images
docker image prune -a

# Remove build cache older than 24 hours
docker builder prune --filter "until=24h"

# Remove all unused build cache
docker builder prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes (WARNING: May delete important data)
docker volume prune

# Full cleanup (WARNING: Removes everything unused)
docker system prune -a --volumes
```

### Alerts and Monitoring

Set up alerts for Docker storage:

1. **Prometheus Alert Rule:**
   ```yaml
   - alert: DockerStorageHigh
     expr: (node_filesystem_avail_bytes{mountpoint="/var/lib/docker"} / node_filesystem_size_bytes{mountpoint="/var/lib/docker"}) < 0.2
     for: 5m
     annotations:
       summary: "Docker storage usage is above 80%"
   ```

2. **Manual Check Script:**
   ```bash
   #!/bin/bash
   DOCKER_USAGE=$(docker system df --format "{{.Size}}" | head -1)
   THRESHOLD="10G"
   
   if [ "$(echo "$DOCKER_USAGE > $THRESHOLD" | bc)" -eq 1 ]; then
     echo "WARNING: Docker storage usage exceeds $THRESHOLD"
     docker system prune -a --filter "until=72h"
   fi
   ```

---

## Storage Best Practices

### 1. Regular Monitoring
- Check storage usage weekly
- Set up automated alerts at 80% capacity
- Review and clean up monthly

### 2. Backup Strategy
- Store backups outside Docker volumes
- Use separate storage for backups
- Implement retention policies

### 3. Cleanup Procedures
- Remove unused images regularly
- Clean build cache weekly
- Archive old logs
- Vacuum database monthly

### 4. Capacity Planning
- Monitor growth trends
- Plan for expansion before reaching limits
- Document storage requirements per component

---

## Troubleshooting

### Database Volume Full

```bash
# Check database size
docker exec warungin-postgres du -sh /var/lib/postgresql/data

# Check PostgreSQL logs
docker logs warungin-postgres | grep -i "disk\|space\|full"

# Vacuum database
docker exec warungin-postgres psql -U postgres -d warungin -c "VACUUM FULL;"
```

### Docker Storage Full

```bash
# Check what's using space
docker system df -v

# Clean up immediately
docker system prune -a --filter "until=24h"

# Remove specific large images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k3 -h -r
docker rmi <image_id>
```

### Build Cache Too Large

```bash
# Check build cache size
docker builder du

# Remove build cache
docker builder prune -a

# Limit build cache in future builds
docker build --cache-from <image> --cache-to <cache> .
```

---

## References

- [Docker Storage Drivers](https://docs.docker.com/storage/storagedriver/)
- [PostgreSQL Disk Usage](https://www.postgresql.org/docs/current/disk-usage.html)
- [Docker System Prune](https://docs.docker.com/engine/reference/commandline/system_prune/)

