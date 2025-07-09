# Docker Setup Guide for Trading Bot v3.1

This guide explains how to run the Trading Bot application using Docker containers.

## 🚀 Quick Start

### Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- At least 4GB of available RAM
- At least 2GB of free disk space

### Production Deployment

1. **Clone the repository and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd trading-bot-v3.1
   ```

2. **Start the application:**
   ```bash
   ./scripts/docker-start.sh
   ```
   
   Or manually:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

For development with hot reloading:

```bash
./scripts/docker-start-dev.sh
```

Or manually:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 📁 Project Structure

```
trading-bot-v3.1/
├── Dockerfile.backend          # Production backend image
├── Dockerfile.frontend         # Production frontend image
├── Dockerfile.frontend.dev     # Development frontend image
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── nginx.conf                  # Nginx configuration for frontend
├── .dockerignore              # Files to exclude from build
├── .env.example               # Environment variables template
├── .env.dev                   # Development environment variables
└── scripts/
    ├── docker-start.sh        # Start production environment
    ├── docker-start-dev.sh    # Start development environment
    └── docker-clean.sh        # Cleanup Docker resources
```

## 🐳 Docker Services

### Backend Service
- **Image**: Python 3.11 with FastAPI
- **Port**: 8000
- **Features**: 
  - Multi-stage build (development/production)
  - Auto-reload in development
  - Health checks
  - Volume mounts for data persistence

### Frontend Service
- **Image**: Node.js 18 with React + Vite (dev) / Nginx (prod)
- **Port**: 3000 (dev) / 80 (prod, mapped to 3000)
- **Features**:
  - Hot reloading in development
  - Optimized production build
  - Nginx reverse proxy for API calls

## ⚙️ Configuration

### Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` for production settings:**
   ```bash
   # Application Environment
   ENVIRONMENT=production
   
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   
   # Trading Configuration
   DEFAULT_INITIAL_CAPITAL=10000
   DEFAULT_COMMISSION=0.01
   
   # Add your API keys here
   # POLYGON_API_KEY=your_key_here
   ```

3. **For development, edit `.env.dev`:**
   ```bash
   ENVIRONMENT=development
   LOG_LEVEL=DEBUG
   API_RELOAD=true
   ```

### Volume Mounts

The following directories are mounted for data persistence:

- `./backtesting/outputs` → Container backtest results
- `./backtesting/csv_input` → Container CSV data files
- `./logs` → Container application logs

## 🔧 Management Commands

### Starting Services

```bash
# Production
./scripts/docker-start.sh

# Development
./scripts/docker-start-dev.sh

# Manual start
docker-compose up -d                    # Production
docker-compose -f docker-compose.dev.yml up  # Development
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Live tail
docker-compose logs -f --tail=100
```

### Rebuilding Images

```bash
# Rebuild and restart
docker-compose up --build -d

# Force rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Cleanup

```bash
# Interactive cleanup script
./scripts/docker-clean.sh

# Manual cleanup
docker-compose down -v              # Remove containers and volumes
docker system prune -f              # Remove unused resources
```

## 🔍 Debugging

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :8000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Permission issues:**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   
   # Fix volume permissions
   sudo chown -R $USER:$USER backtesting/outputs logs
   ```

3. **Build failures:**
   ```bash
   # Clear Docker cache
   docker builder prune -a
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

### Accessing Container Shell

```bash
# Backend container
docker-compose exec backend bash

# Frontend container (development)
docker-compose -f docker-compose.dev.yml exec frontend sh
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/
curl http://localhost:3000/
```

## 🚀 Production Deployment

### System Requirements

- **Minimum**: 2 CPU cores, 4GB RAM, 10GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 20GB storage

### Deployment Steps

1. **Prepare the server:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and configure:**
   ```bash
   git clone <your-repo-url>
   cd trading-bot-v3.1
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Deploy:**
   ```bash
   ./scripts/docker-start.sh
   ```

### Security Considerations

- Change default ports if needed
- Use environment variables for secrets
- Enable firewall rules
- Regular security updates
- Monitor logs for suspicious activity

## 📊 Monitoring

### Resource Usage

```bash
# Container resource usage
docker stats

# Disk usage
docker system df
```

### Log Management

```bash
# Rotate logs
docker-compose exec backend logrotate /etc/logrotate.conf

# Archive old logs
tar -czf logs-$(date +%Y%m%d).tar.gz logs/
```

## 🔄 Updates

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Or use rolling update
docker-compose up -d --force-recreate --build
```

### Database Migrations (Future)

When database support is added:

```bash
# Run migrations
docker-compose exec backend python manage.py migrate
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment configuration
3. Ensure sufficient system resources
4. Try the cleanup script: `./scripts/docker-clean.sh`
5. Rebuild from scratch: `docker-compose build --no-cache`

## 📝 Notes

- The frontend uses Vite in development for fast hot reloading
- The backend auto-reloads in development when code changes
- All data is persisted in mounted volumes
- Health checks ensure services are ready before accepting traffic
- Nginx serves the frontend and proxies API requests in production