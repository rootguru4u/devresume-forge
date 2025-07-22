# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install security updates
RUN apk update && apk upgrade && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Dependencies stage
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
COPY . .
RUN npm ci && \
    npm run build

# Production stage with Nginx
FROM nginx:1.25-alpine AS production

# Install security updates and remove unnecessary packages
RUN apk update && apk upgrade && \
    apk del --purge apk-tools && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Create non-root user for Nginx
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 -G nginx-group

# Set proper permissions
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d

# Create PID directory for nginx
RUN mkdir -p /var/run/nginx && \
    chown -R nginx-user:nginx-group /var/run/nginx

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Metadata
LABEL maintainer="DevResume Forge Team" \
      version="1.0.0" \
      description="DevResume Forge Frontend Application" \
      org.opencontainers.image.source="https://github.com/yourusername/devresume-forge" 