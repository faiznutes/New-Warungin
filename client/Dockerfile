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

# Create non-root user for nginx
RUN addgroup -g 1002 -S nginx-user && \
    adduser -S nginx-user -u 1002 -G nginx-user && \
    chown -R nginx-user:nginx-user /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Copy built files
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Change ownership of nginx files
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html /etc/nginx/conf.d

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Use entrypoint script to create directories before nginx starts
ENTRYPOINT ["/docker-entrypoint.sh"]

