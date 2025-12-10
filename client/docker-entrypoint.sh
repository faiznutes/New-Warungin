#!/bin/sh
set -e

# Create required nginx cache directories with proper permissions
mkdir -p /var/cache/nginx/client_temp
mkdir -p /var/cache/nginx/proxy_temp
mkdir -p /var/cache/nginx/fastcgi_temp
mkdir -p /var/cache/nginx/uwsgi_temp
mkdir -p /var/cache/nginx/scgi_temp

# Set proper permissions (user 1002:1002 = nginx-user)
chown -R nginx-user:nginx-user /var/cache/nginx /var/run /var/log/nginx 2>/dev/null || true
chmod -R 755 /var/cache/nginx 2>/dev/null || true

# Execute nginx
exec nginx -g "daemon off;"

