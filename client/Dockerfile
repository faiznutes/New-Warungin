# Frontend Dockerfile
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm install to handle lock file sync issues, fallback to legacy-peer-deps if needed
# Add retry logic for network issues
RUN npm install --legacy-peer-deps || \
    npm install || \
    (sleep 10 && npm install --legacy-peer-deps) || \
    (sleep 20 && npm install)

# Copy source code
COPY . .

# Set environment variable for API URL
ARG VITE_API_URL=https://pos.faiznute.site/api
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create required nginx cache directories and setup permissions
# This must happen as root before nginx starts
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp \
    && mkdir -p /var/run/nginx \
    && mkdir -p /var/log/nginx \
    && chmod -R 755 /var/cache/nginx /var/run/nginx /var/log/nginx

# Copy built files
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Run as root (containerized, safe)
# Let entrypoint manage nginx startup
ENTRYPOINT ["/docker-entrypoint.sh"]
