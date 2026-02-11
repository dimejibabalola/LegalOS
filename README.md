# Babalola Legal OS - Docker Configuration

Complete Docker setup for Babalola Legal OS - a comprehensive Law Firm Management Platform.

## 📁 Project Structure

```
/mnt/okcomputer/output/
├── docker-compose.yml           # Main orchestration file
├── Caddyfile                    # Caddy reverse proxy configuration
├── README.md                    # This file
├── frontend/
│   ├── Dockerfile               # Frontend multi-stage Dockerfile
│   ├── .env.example             # Frontend environment variables template
│   ├── nginx.conf               # Nginx configuration for production
│   └── package.json             # Frontend package.json with Docker scripts
└── backend/
    ├── Dockerfile               # Backend multi-stage Dockerfile
    ├── .env.example             # Backend environment variables template
    └── package.json             # Backend package.json with Docker scripts
```

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for convenience commands)

### 1. Clone and Setup

```bash
# Copy the Docker configuration to your project root
cp -r /mnt/okcomputer/output/* /path/to/your/project/

# Navigate to your project
cd /path/to/your/project
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit the .env files with your actual values
nano frontend/.env
nano backend/.env
```

### 3. Start All Services

```bash
# Build and start all services
docker-compose up -d

# Or with build flag for first run
docker-compose up -d --build
```

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://app.localhost | Main application UI |
| Backend API | http://api.localhost | API endpoints |
| Direct Frontend | http://localhost:3000 | Direct frontend access |
| Direct API | http://localhost:3001 | Direct API access |
| PostgreSQL | localhost:5432 | Database (use DB client) |
| Redis | localhost:6379 | Cache/Session store |

## 🐳 Services Overview

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| frontend | Node.js 20 + Vite | 3000 | React application |
| backend | Node.js 20 | 3001 | Express API server |
| postgres | PostgreSQL 15 | 5432 | Primary database |
| redis | Redis 7 | 6379 | Cache & sessions |
| caddy | Caddy 2 | 80, 443 | Reverse proxy |

## 📋 Docker Commands

### Development Mode (with hot reloading)

```bash
# Start all services in development mode
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Production Mode

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or build manually
docker-compose build --no-cache
```

### Individual Services

```bash
# Start only backend and database
docker-compose up -d backend postgres redis

# Start only frontend
docker-compose up -d frontend

# Restart a service
docker-compose restart backend
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d babalola_legal

# Run database migrations
docker-compose exec backend npm run db:migrate

# Run database seeds
docker-compose exec backend npm run db:seed

# Backup database
docker-compose exec postgres pg_dump -U postgres babalola_legal > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d babalola_legal
```

### Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Remove all containers, networks, and images
docker-compose down --rmi all -v

# Clean up Docker system
docker system prune -f
docker volume prune -f
```

## 🔧 Configuration

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:3001/api | Backend API URL |
| `VITE_APP_NAME` | Babalola Legal OS | Application name |
| `VITE_ENABLE_ANALYTICS` | false | Enable analytics |
| `VITE_ENABLE_DARK_MODE` | true | Enable dark mode |

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | postgres | Database host |
| `DB_PORT` | 5432 | Database port |
| `DB_NAME` | babalola_legal | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |
| `JWT_SECRET` | - | JWT signing secret |
| `REDIS_HOST` | redis | Redis host |
| `REDIS_PORT` | 6379 | Redis port |

## 🌐 Network Configuration

The setup creates a custom Docker network `babalola-network` (172.20.0.0/16) for inter-service communication.

### Service Hostnames

Within the Docker network, services can communicate using their service names:
- `frontend:3000` - Frontend service
- `backend:3001` - Backend service
- `postgres:5432` - PostgreSQL database
- `redis:6379` - Redis cache
- `caddy:80` - Caddy reverse proxy

## 💾 Volumes

| Volume | Purpose |
|--------|---------|
| `postgres_data` | PostgreSQL data persistence |
| `redis_data` | Redis data persistence |
| `uploads` | File uploads storage |
| `caddy_data` | Caddy certificates and data |
| `caddy_config` | Caddy configuration |

## 🔒 Security

### Production Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT_SECRET
- [ ] Configure SMTP credentials
- [ ] Enable HTTPS with valid certificates
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable request logging
- [ ] Set up monitoring and alerting

### Security Headers

Caddy is configured with security headers:
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content Security Policy

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :5432
lsof -i :80

# Kill process or change ports in docker-compose.yml
```

#### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart service
docker-compose restart <service-name>
```

#### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Verify environment variables
docker-compose exec backend env | grep DB_
```

#### Hot Reload Not Working
```bash
# Check file watching
docker-compose exec frontend ls -la

# Restart frontend
docker-compose restart frontend
```

### Health Checks

All services include health checks:
- Frontend: HTTP check on port 3000
- Backend: HTTP check on `/api/health`
- PostgreSQL: `pg_isready` command
- Redis: `redis-cli ping`

## 📊 Monitoring

### View Resource Usage
```bash
# Container stats
docker stats

# Specific service stats
docker stats babalola-backend
```

### Logs
```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

## 🔄 Updates

### Update Images
```bash
# Pull latest images
docker-compose pull

# Rebuild with no cache
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Update Dependencies
```bash
# Frontend
docker-compose exec frontend npm update

# Backend
docker-compose exec backend npm update
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)

## 📄 License

MIT License - Babalola Legal OS Team
