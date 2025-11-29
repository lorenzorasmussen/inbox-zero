# 🚀 Inbox Zero Port & Service Configuration Guide

## 📋 **PORT MAPPING OVERVIEW**

### **Current Port Usage:**

```
Port 3000  → Next.js Development Server (internal)
Port 3001  → Next.js Production/Proxy (external access)
Port 5432  → PostgreSQL (production compose)
Port 5433  → PostgreSQL (development compose)
Port 6379  → Redis (internal)
Port 6380  → Redis (external access)
Port 8079  → Redis HTTP API (external access)
```

## 🔧 **SERVICE CONFIGURATIONS**

### **1. Development Environment**

```yaml
# docker-compose.dev.yml
services:
  db:
    ports: ["5433:5432"]    # PostgreSQL on 5433
  redis:
    ports: ["6380:6379"]    # Redis on 6380
  serverless-redis-http:
    ports: ["8079:80"]      # Redis HTTP on 8079

# Web app runs locally:
NEXT_PUBLIC_BASE_URL=http://localhost:3000
pnpm dev  # Runs on port 3000 internally
```

### **2. Production Environment**

```yaml
# docker-compose.yml
services:
  db:
    ports: ["5432:5432"]    # PostgreSQL on 5432
  redis:
    ports: ["6380:6379"]    # Redis on 6380
  serverless-redis-http:
    ports: ["8079:80"]      # Redis HTTP on 8079
  web:
    ports: ["3001:3000"]    # Web app on 3001

# Web app environment:
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### **3. Optimized Development**

```yaml
# docker-compose.dev-optimized.yml
services:
  db:
    ports: ["5433:5432"] # PostgreSQL on 5433
  redis:
    ports: ["6380:6379"] # Redis on 6380
  serverless-redis-http:
    ports: ["8079:80"] # Redis HTTP on 8079
```

## 🌐 **ACCESS ENDPOINTS**

### **Web Application**

- **Development**: `http://localhost:3000`
- **Production**: `http://localhost:3001`
- **Docker Production**: `http://localhost:3001`

### **Database Connections**

- **Development DB**: `postgresql://postgres:password@localhost:5433/inboxzero`
- **Production DB**: `postgresql://postgres:password@localhost:5432/inboxzero`

### **Redis Connections**

- **Direct Redis**: `redis://localhost:6379`
- **HTTP API**: `http://localhost:8079`
- **Upstash Compatible**: `http://localhost:8079`

## 📁 **ENVIRONMENT FILES ANALYSIS**

### **Available .env Files:**

```
/Users/lorenzo/Projects/inbox-zero-google-migration/
├── .env                              # Root environment (blocked)
├── apps/web/
│   ├── .env.example                    # Template with all options
│   ├── .env.local                      # Local overrides
│   ├── .env.build                      # Build-specific
│   ├── .env.production                  # Production-specific
│   └── .env                            # Main config (blocked)
└── apps/unsubscriber/
    └── .env.example                    # Unsubscriber template
```

### **Port Configuration by .env:**

```bash
# apps/web/.env.example
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # ← PORT CONFUSION HERE!
DATABASE_URL=postgresql://postgres:password@localhost:5432/inboxzero
DIRECT_URL=postgresql://postgres:password@localhost:5432/inboxzero

# Should be for development:
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # dev server port
# Should be for production:
NEXT_PUBLIC_BASE_URL=http://localhost:3001  # proxy port
```

## ⚠️ **PORT CONFUSION ISSUES**

### **Problem Identified:**

The `.env.example` shows `NEXT_PUBLIC_BASE_URL=http://localhost:3000` but:

- **Development server** runs on port 3000 (correct)
- **Production proxy** expects port 3001 (mismatch)
- **Docker compose** exposes port 3001 (correct for production)

### **Resolution:**

```bash
# For local development:
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For Docker production:
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# For external access:
NEXT_PUBLIC_BASE_URL=http://your-domain.com
```

## 🔍 **SERVICE HEALTH CHECKS**

### **Database Health:**

```bash
# Development PostgreSQL
curl http://localhost:5433 || echo "DB not accessible via HTTP"

# Production PostgreSQL
curl http://localhost:5432 || echo "DB not accessible via HTTP"

# Check with psql
psql -h localhost -p 5433 -U postgres -d inboxzero
```

### **Redis Health:**

```bash
# Direct Redis connection
redis-cli -p 6379 ping

# HTTP API check
curl http://localhost:8079/health

# Check Redis HTTP service
curl http://localhost:8079
```

### **Web Application Health:**

```bash
# Development server
curl http://localhost:3000/api/health

# Production proxy
curl http://localhost:3001/api/health

# Check if running
lsof -i :3000
lsof -i :3001
```

## 🛠️ **TROUBLESHOOTING PORTS**

### **Port Already in Use:**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -t -i :3000 | awk 'NR!=1 {print $2}')

# Check all ports
netstat -an | grep LISTEN
```

### **Docker Port Conflicts:**

```bash
# Stop all containers
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Check specific container
docker ps -a | grep inbox-zero

# Restart services
docker-compose up -d
```

### **Service Connection Issues:**

```bash
# Check container logs
docker-compose logs db
docker-compose logs redis
docker-compose logs web

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart db
```

## 📋 **QUICK REFERENCE CHEAT SHEET**

### **Start Commands:**

```bash
# Development with database
docker-compose -f docker-compose.dev.yml up -d
cd apps/web && pnpm dev

# Production (all services)
NEXT_PUBLIC_BASE_URL=http://localhost:3001 docker-compose --profile all up -d

# Optimized development
./docker/scripts/start-optimized.sh
```

### **Port Access:**

```bash
# Web App (dev):     http://localhost:3000
# Web App (prod):    http://localhost:3001
# Database (dev):     localhost:5433
# Database (prod):    localhost:5432
# Redis (direct):     localhost:6379
# Redis (HTTP):       http://localhost:8079
```

### **Environment Variables:**

```bash
# Required minimum:
AUTH_SECRET=your_secret_here
EMAIL_ENCRYPT_SECRET=your_encrypt_secret_here
EMAIL_ENCRYPT_SALT=your_encrypt_salt_here
NEXT_PUBLIC_BASE_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/inboxzero
UPSTASH_REDIS_URL=http://localhost:8079
UPSTASH_REDIS_TOKEN=your_redis_token_here
INTERNAL_API_KEY=your_api_key_here
API_KEY_SALT=your_api_salt_here

# LLM Provider (choose ONE):
DEFAULT_LLM_PROVIDER=openrouter
DEFAULT_LLM_MODEL=anthropic/claude-sonnet-4.5
OPENROUTER_API_KEY=your_openrouter_key_here
```

## 🎯 **RECOMMENDED CONFIGURATION**

### **For Your Hardware (8GB RAM):**

```bash
# Use optimized development setup
./docker/scripts/start-optimized.sh

# This uses:
# - Port 5433 for PostgreSQL
# - Port 6380 for Redis
# - Port 8079 for Redis HTTP
# - Local web app on port 3000
# - Resource limits optimized for 8GB RAM
```

### **Port Usage Summary:**

- **3000**: Next.js development server
- **3001**: Production proxy/Docker web
- **5432**: Production PostgreSQL
- **5433**: Development PostgreSQL
- **6379**: Redis (internal)
- **6380**: Redis (external)
- **8079**: Redis HTTP API

This should resolve all port confusion and provide clear access patterns.
