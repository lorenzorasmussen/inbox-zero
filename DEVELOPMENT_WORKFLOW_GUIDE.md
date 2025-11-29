# 🚀 Inbox Zero Development Workflow Guide

## 📋 **CURRENT SETUP STATUS**

### **✅ Services Running & Healthy**

- **PostgreSQL**: `localhost:5433` (Development database)
- **Redis**: `localhost:6379` (Direct access)
- **Redis HTTP**: `http://localhost:8079` (HTTP API)
- **Web Application**: `http://localhost:3000` (Next.js development server)

### **✅ Environment Configuration**

- **Database URL**: `postgresql://postgres:password@localhost:5433/inboxzero`
- **Redis URLs**: Configured for both direct and HTTP access
- **Base URL**: `http://localhost:3000` (Next.js development)
- **Security**: All secrets generated and configured
- **LLM Provider**: OpenRouter configured (needs API key)

---

## 🚀 **DEVELOPMENT WORKFLOW**

### **🎯 Daily Development Setup**

#### **Step 1: Start Services**

```bash
# Start optimized Docker services (database + Redis)
./docker/scripts/start-optimized.sh

# Or start manually
docker-compose -f docker-compose.dev-optimized.yml up -d
```

#### **Step 2: Start Web Application**

```bash
# Start Next.js development server
cd apps/web
pnpm dev

# Or with optimized memory settings
NODE_OPTIONS=--max_old_space_size=1024 pnpm dev
```

#### **Step 3: Verify Setup**

```bash
# Check all services are healthy
./scripts/verify-services.sh

# Quick web app check
curl http://localhost:3000/api/health
```

### **📊 Service Access URLs**

| Service          | URL                              | Purpose               |
| ---------------- | -------------------------------- | --------------------- |
| **Web App**      | http://localhost:3000            | Next.js development   |
| **Database**     | localhost:5433                   | PostgreSQL (psql)     |
| **Redis Direct** | localhost:6379                   | Redis CLI (redis-cli) |
| **Redis HTTP**   | http://localhost:8079            | Redis HTTP API        |
| **Health Check** | http://localhost:3000/api/health | Application health    |

### **🔧 Development Commands**

#### **Database Management**

```bash
# Connect to PostgreSQL
psql -h localhost -p 5433 -U postgres -d inboxzero

# Run migrations
cd apps/web
pnpm prisma migrate dev

# Reset database (if needed)
pnpm prisma migrate reset
```

#### **Redis Management**

```bash
# Connect to Redis CLI
redis-cli -p 6379

# Check Redis status
redis-cli -p 6379 ping

# Clear Redis cache
redis-cli -p 6379 FLUSHALL
```

#### **Web Application Management**

```bash
# Start development server
cd apps/web
pnpm dev

# Start with specific memory limit
NODE_OPTIONS=--max_old_space_size=1024 pnpm dev

# Build for testing
pnpm build

# Run tests
pnpm test
```

#### **Service Monitoring**

```bash
# Check Docker container status
docker-compose -f docker-compose.dev-optimized.yml ps

# Monitor resource usage
./docker/scripts/monitor.sh

# Check service logs
docker-compose -f docker-compose.dev-optimized.yml logs [service-name]

# Verify all services
./scripts/verify-services.sh
```

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Port Conflicts**

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -t -i :3000 | awk 'NR!=1 {print $2}')

# Check all ports
netstat -an | grep LISTEN
```

#### **Docker Issues**

```bash
# Stop all containers
docker-compose -f docker-compose.dev-optimized.yml down

# Clean up Docker resources
docker system prune -f

# Restart services
./docker/scripts/start-optimized.sh
```

#### **Database Connection Issues**

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.dev-optimized.yml logs db

# Test database connection
psql -h localhost -p 5433 -U postgres -d inboxzero -c "SELECT 1;"

# Reset database if corrupted
docker-compose -f docker-compose.dev-optimized.yml down
docker volume rm inbox-zero-dev-optimized_dev-database-data
./docker/scripts/start-optimized.sh
```

#### **Web Application Issues**

```bash
# Check Next.js logs
cd apps/web && tail -f .next/server.log

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install
```

#### **Memory Issues**

```bash
# Check system memory usage
./scripts/optimize-system.sh

# Check Docker memory usage
docker stats --no-stream

# Kill memory-intensive processes
pkill -f "chrome"
pkill -f "opencode"
```

---

## 🔄 **DEPLOYMENT WORKFLOW**

### **Production Setup**

```bash
# Set production environment
export DOCKER_ENV=production

# Start all services
NEXT_PUBLIC_BASE_URL=http://localhost:3001 docker-compose --profile all up -d

# Run database migrations
docker-compose exec web npx prisma migrate deploy
```

### **Development to Production**

```bash
# Build application
cd apps/web
pnpm build

# Test production build locally
pnpm start:standalone

# Deploy with Docker
docker-compose -f docker-compose.yml build web
docker-compose --profile all up -d
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **For Your Hardware (8GB RAM)**

#### **Development Best Practices**

```bash
# Use optimized development setup
./docker/scripts/start-optimized.sh

# Limit browser tabs (Chrome is memory intensive)
# Use lightweight editor instead of heavy IDEs
# Close unnecessary applications during development

# Monitor resources regularly
./docker/scripts/monitor.sh
```

#### **Memory Management**

```bash
# System optimization (run weekly)
./scripts/optimize-system.sh

# Clear system caches
sudo rm -rf /Library/Caches/*
rm -rf ~/Library/Caches/*

# Monitor memory pressure
memory_pressure
```

#### **Docker Optimization**

```bash
# Use optimized compose file
docker-compose -f docker-compose.dev-optimized.yml

# Resource limits are already configured:
# - PostgreSQL: 512MB RAM, 0.4 CPU cores
# - Redis: 128MB RAM, 0.15 CPU cores
# - Redis HTTP: 64MB RAM, 0.1 CPU cores
```

---

## 🎯 **QUICK REFERENCE**

### **Environment Files**

- **Main Config**: `apps/web/.env`
- **Template**: `apps/web/.env.example`
- **Setup Script**: `./scripts/setup-environment.sh`

### **Docker Files**

- **Development**: `docker-compose.dev-optimized.yml`
- **Production**: `docker-compose.yml`
- **Startup Script**: `./docker/scripts/start-optimized.sh`

### **Service Scripts**

- **Verification**: `./scripts/verify-services.sh`
- **Monitoring**: `./docker/scripts/monitor.sh`
- **System Optimize**: `./scripts/optimize-system.sh`

### **Port Configuration**

- **Development**: http://localhost:3000
- **Database**: localhost:5433
- **Redis**: localhost:6379 / http://localhost:8079

---

## 🎉 **READY TO DEVELOP**

Your development environment is now fully configured and optimized:

✅ **All services running and healthy**
✅ **Environment properly configured**
✅ **Port conflicts resolved**
✅ **Resource limits optimized for 8GB RAM**
✅ **Automated tools available for maintenance**

**Start developing with:**

```bash
cd apps/web && pnpm dev
```

**Monitor with:**

```bash
./docker/scripts/monitor.sh
```

**Troubleshoot with:**

```bash
./scripts/verify-services.sh
./scripts/optimize-system.sh
```

---

_Last updated: $(date)_
