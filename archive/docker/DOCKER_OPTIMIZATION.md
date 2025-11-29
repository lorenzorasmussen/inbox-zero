# Docker Resource Optimization for Inbox Zero

## 🖥️ Your Hardware Configuration

- **MacBook Pro** with Dual-Core Intel Core i5 (2.7 GHz)
- **8 GB RAM** (limited memory)
- **120 GB SSD** with 7.6 GB free
- **Docker**: 1.918 GiB available for containers

## ⚠️ Current Issues & Solutions

### Problems Identified:

1. **Excessive Memory Usage**: Node.js configured for 16GB RAM (impossible on 8GB system)
2. **No Resource Limits**: Docker containers can consume all available resources
3. **CPU Overload**: Web container using 153% CPU (overloaded)
4. **Storage Constraints**: Only 7.6GB free space

### Applied Solutions:

✅ **Reduced Node.js memory** from 16GB → 1GB (production) / 2GB (dev)
✅ **Added Docker resource limits** based on your hardware
✅ **Optimized database settings** for low-memory systems
✅ **Created hardware-specific configurations**
✅ **Added monitoring and startup scripts**

## 🚀 Quick Start (Optimized for Your Hardware)

### Option 1: Use the Optimized Startup Script

```bash
# Automatically chooses best configuration for your hardware
./docker/scripts/start-optimized.sh
```

### Option 2: Manual Start with Resource Limits

```bash
# Stop existing containers
docker-compose down

# Use hardware-optimized configuration
docker-compose -f docker-compose.dev-optimized.yml up -d

# Monitor resources
./docker/scripts/monitor.sh
```

### Option 3: Minimal Development Setup

```bash
# Only database and Redis (no web container)
docker-compose -f docker-compose.dev-optimized.yml up -d db redis

# Run web app locally with reduced memory
cd apps/web
NODE_OPTIONS=--max_old_space_size=1024 pnpm dev
```

## 📊 Resource Limits Applied

### Production Docker Compose (`docker-compose.yml`):

- **Web App**: 1GB RAM, 0.75 CPU cores
- **PostgreSQL**: 1GB RAM, 0.5 CPU cores
- **Redis**: 256MB RAM, 0.2 CPU cores
- **Redis HTTP**: 128MB RAM, 0.15 CPU cores

### Optimized Development (`docker-compose.dev-optimized.yml`):

- **PostgreSQL**: 512MB RAM, 0.4 CPU cores
- **Redis**: 128MB RAM, 0.15 CPU cores
- **Redis HTTP**: 64MB RAM, 0.1 CPU cores

## 🔧 Monitoring & Management

### Real-time Resource Monitoring:

```bash
# Interactive monitoring dashboard
./docker/scripts/monitor.sh
```

### Quick Resource Check:

```bash
# Current container usage
docker stats --no-stream

# System memory usage
vm_stat
```

### Cleanup Commands:

```bash
# Stop all containers
docker-compose down

# Clean up unused resources
docker system prune -f

# Remove unused images
docker image prune -f
```

## 💡 Hardware-Specific Optimization Tips

### Memory Management:

1. **Close other applications** when running Docker
2. **Use optimized compose file** for development
3. **Monitor memory usage** with the provided script
4. **Restart containers** if memory usage exceeds 80%

### Performance Optimization:

1. **Use external services** for production (Neon, Upstash Redis)
2. **Run minimal services** during development
3. **Avoid builds** on low-memory systems
4. **Use pre-built images** instead of building locally

### Storage Management:

1. **Regular Docker cleanup** to free disk space
2. **Use external databases** to reduce local storage needs
3. **Monitor disk usage** with `df -h`

## 🆘 Troubleshooting

### System Becomes Unresponsive:

```bash
# Emergency stop all containers
docker stop $(docker ps -q)

# Or use compose
docker-compose down
```

### Out of Memory Errors:

```bash
# Use minimal configuration
docker-compose -f docker-compose.dev-optimized.yml up -d

# Or run web app locally
cd apps/web && NODE_OPTIONS=--max_old_space_size=512 pnpm dev
```

### High CPU Usage:

```bash
# Check what's consuming CPU
docker stats

# Restart specific service
docker-compose restart web
```

### Build Failures:

```bash
# Use pre-built image instead of building
docker-compose pull web

# Or reduce build memory
NODE_OPTIONS=--max_old_space_size=1024 docker-compose build web
```

## 📈 Expected Performance Improvements

### Before Optimization:

- **Memory Usage**: 8-16GB+ (system freeze)
- **CPU Usage**: 150%+ (system overload)
- **Build Time**: 10-20 minutes
- **Startup Time**: 5-10 minutes

### After Optimization:

- **Memory Usage**: 2-3GB total (usable system)
- **CPU Usage**: 50-70% peak (manageable)
- **Build Time**: 3-5 minutes (if needed)
- **Startup Time**: 1-2 minutes

## 🔄 Development Workflow

### Recommended Daily Workflow:

1. **Start optimized services**: `./docker/scripts/start-optimized.sh`
2. **Monitor resources**: `./docker/scripts/monitor.sh`
3. **Develop normally**: Access at http://localhost:3001
4. **Clean up**: `docker-compose down` when done

### Production Considerations:

1. **Use external services** (Neon, Upstash)
2. **Deploy to cloud** instead of local Docker
3. **Use managed databases** for better performance
4. **Monitor resource usage** in production

## 📞 Support

If you encounter issues:

1. Check the monitoring script for resource usage
2. Try the optimized compose file
3. Use minimal setup for development
4. Consider external services for production

The optimizations are specifically tuned for your MacBook Pro with 8GB RAM and should provide a much better development experience.
