#!/bin/bash
cd "$(dirname "$0")" || exit 1

echo "=== Git Status ==="
git status

echo ""
echo "=== Adding files ==="
git add docker-compose.yml

echo ""
echo "=== Checking diff ==="
git diff --cached docker-compose.yml | head -50

echo ""
echo "=== Committing ==="
git commit -m "fix: correct tmpfs mount permissions in docker-compose.yml

- Remove duplicate mode specifications in tmpfs mounts  
- Backend tmpfs: proper mode and uid/gid (1001:1001)
- Frontend tmpfs: /var/run uses 1002:1002 (fixed duplicate 101:101)
- nginx tmpfs mounts: removed redundant mode parameters

These changes allow services to properly write to temporary directories
while maintaining security hardening with read-only root filesystems.

Fixes 'Permission denied' errors in nginx container:
- mkdir() \"/var/cache/nginx/client_temp\" failed (13: Permission denied)
- could not open error log file: /var/log/nginx/error.log"

echo ""
echo "=== Latest commit ==="
git log --oneline -1

echo ""
echo "=== Pushing to GitHub ==="
git push origin main

echo ""
echo "=== Push complete ==="
git log --oneline -1
