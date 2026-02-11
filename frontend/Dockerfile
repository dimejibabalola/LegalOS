# ================================================
# Babalola Legal OS - Frontend Dockerfile
# React Application with Vite
# ================================================

# ================================================
# Stage 1: Base Image (Common Dependencies)
# ================================================
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates

# ================================================
# Stage 2: Development Environment
# ================================================
FROM base AS development

# Set environment variables
ENV NODE_ENV=development
ENV VITE_HMR_HOST=0.0.0.0
ENV VITE_HMR_PORT=3000

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Health check for development server
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start development server with hot reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ================================================
# Stage 3: Build Stage (Production Assets)
# ================================================
FROM base AS builder

# Set environment variables
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ================================================
# Stage 4: Production Environment (nginx)
# ================================================
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create uploads directory
RUN mkdir -p /usr/share/nginx/html/uploads && \
    chown -R nginx:nginx /usr/share/nginx/html

# Add security headers configuration
RUN echo 'server_tokens off;' > /etc/nginx/conf.d/security.conf

# Expose nginx port
EXPOSE 80

# Health check for nginx
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ================================================
# Labels
# ================================================
LABEL maintainer="Babalola Legal OS Team" \
      app.name="Babalola Legal OS Frontend" \
      app.version="1.0.0" \
      app.description="Law Firm Management Platform - Frontend"
