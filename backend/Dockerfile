# ================================================
# Babalola Legal OS - Backend Dockerfile
# Node.js API Server
# ================================================

# ================================================
# Stage 1: Base Image
# ================================================
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates \
    wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# ================================================
# Stage 2: Development Environment
# ================================================
FROM base AS development

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3001

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci && \
    npm cache clean --force

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && \
    chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3001

# Health check for development server
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start development server with nodemon for hot reloading
CMD ["nodemon", "--legacy-watch", "src/index.js"]

# ================================================
# Stage 3: Production Dependencies
# ================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# ================================================
# Stage 4: Production Environment
# ================================================
FROM node:20-alpine AS production

# Install security updates and wget for healthcheck
RUN apk upgrade --no-cache && \
    apk add --no-cache wget

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package.json for version info
COPY package*.json ./

# Copy source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose API port
EXPOSE 3001

# Health check for production server
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start production server
CMD ["node", "src/index.js"]

# ================================================
# Labels
# ================================================
LABEL maintainer="Babalola Legal OS Team" \
      app.name="Babalola Legal OS Backend" \
      app.version="1.0.0" \
      app.description="Law Firm Management Platform - Backend API"
