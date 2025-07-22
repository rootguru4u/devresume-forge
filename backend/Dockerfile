# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install security updates and dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app directory and non-root user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
COPY . .
RUN npm ci && \
    npm run build && \
    npm prune --production

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Copy production dependencies and built application
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=backend:nodejs /app/dist ./dist
COPY --from=build --chown=backend:nodejs /app/package*.json ./

# Create necessary directories with proper permissions
RUN mkdir -p uploads uploads/pdfs logs temp && \
    chown -R backend:nodejs uploads logs temp

# Security: Remove unnecessary packages and create non-root user
RUN apk del --purge apk-tools && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Switch to non-root user
USER backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 5000, path: '/api/health', timeout: 2000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# Metadata
LABEL maintainer="DevResume Forge Team" \
      version="1.0.0" \
      description="DevResume Forge Backend API" \
      org.opencontainers.image.source="https://github.com/yourusername/devresume-forge" 