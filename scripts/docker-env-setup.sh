#!/bin/bash
# Environment-specific Docker Optimization

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="inbox-zero"

echo "🚀 Optimizing Docker for $ENVIRONMENT environment"
echo "================================================"

case $ENVIRONMENT in
    "development")
        echo "🔧 Setting up development environment..."
        
        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose -f docker-compose.yml down
        docker-compose -f docker-compose.dev-optimized.yml down 2>/dev/null || true
        
        # Clean up resources
        echo "Cleaning up development resources..."
        docker system prune -f
        
        # Start optimized development environment
        echo "Starting optimized development environment..."
        docker-compose -f docker-compose.dev-ultra-optimized.yml up -d
        
        # Show resource usage
        echo ""
        echo "📊 Development Resource Usage:"
        sleep 5
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        
        echo ""
        echo "✅ Development environment optimized!"
        echo "🌐 App available at: http://localhost:3001"
        echo "🗄️  Database available at: localhost:5433"
        echo "🔴 Redis available at: localhost:6380"
        ;;
        
    "production")
        echo "🏭 Setting up production environment..."
        
        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose -f docker-compose.yml down
        docker-compose -f docker-compose.dev-optimized.yml down 2>/dev/null || true
        
        # Build optimized production image
        echo "Building optimized production image..."
        docker build -f docker/Dockerfile.prod.optimized -t inbox-zero:optimized .
        
        # Clean up resources
        echo "Cleaning up resources..."
        docker system prune -f
        
        # Start optimized production environment
        echo "Starting optimized production environment..."
        docker-compose -f docker-compose.optimized.yml up -d
        
        # Wait for health checks
        echo "Waiting for services to be healthy..."
        sleep 30
        
        # Show resource usage
        echo ""
        echo "📊 Production Resource Usage:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        
        echo ""
        echo "✅ Production environment optimized!"
        echo "🌐 App available at: http://localhost:3001"
        echo "🗄️  Database available at: localhost:5432"
        echo "🔴 Redis available at: localhost:6380"
        ;;
        
    "minimal")
        echo "🎯 Setting up minimal resource environment..."
        
        # Create minimal docker-compose override
        cat > docker-compose.minimal.yml << 'EOF'
name: inbox-zero-minimal

services:
  db:
    image: postgres:16-alpine
    container_name: inbox-zero-minimal-db
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-inboxzero}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
      - POSTGRES_MAX_CONNECTIONS=10
      - POSTGRES_SHARED_BUFFERS=16MB
      - POSTGRES_EFFECTIVE_CACHE_SIZE=32MB
    command: postgres -c max_connections=10 -c shared_buffers=16MB -c effective_cache_size=32MB
    volumes:
      - minimal-db-data:/var/lib/postgresql/data
    ports:
      - 5434:5432
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.2'
        reservations:
          memory: 64M
          cpus: '0.1'

  web:
    build:
      context: .
      dockerfile: ./docker/Dockerfile.dev.optimized
    env_file:
      - ./apps/web/.env
    depends_on:
      - db
    ports:
      - 3002:3000
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@db:5432/${POSTGRES_DB:-inboxzero}?schema=public
      NODE_OPTIONS: "--max_old_space_size=512"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.3'
        reservations:
          memory: 128M
          cpus: '0.15'

volumes:
  minimal-db-data:
EOF
        
        # Stop existing containers
        docker-compose down
        
        # Start minimal environment
        docker-compose -f docker-compose.minimal.yml up -d
        
        echo ""
        echo "📊 Minimal Resource Usage:"
        sleep 5
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        
        echo ""
        echo "✅ Minimal environment optimized!"
        echo "🌐 App available at: http://localhost:3002"
        echo "🗄️  Database available at: localhost:5434"
        ;;
        
    "benchmark")
        echo "📈 Running resource benchmark..."
        
        echo "Starting benchmark test..."
        
        # Test with current setup
        echo "Testing current setup..."
        docker-compose up -d
        sleep 30
        
        echo "Current setup resource usage:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" > current_usage.txt
        cat current_usage.txt
        
        docker-compose down
        
        # Test with optimized setup
        echo "Testing optimized setup..."
        docker-compose -f docker-compose.optimized.yml up -d
        sleep 30
        
        echo "Optimized setup resource usage:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" > optimized_usage.txt
        cat optimized_usage.txt
        
        docker-compose -f docker-compose.optimized.yml down
        
        echo ""
        echo "📊 Benchmark Results:"
        echo "Current usage saved to: current_usage.txt"
        echo "Optimized usage saved to: optimized_usage.txt"
        
        # Calculate memory savings
        CURRENT_MEM=$(grep -E "(web|db|redis)" current_usage.txt | awk '{sum+=$3} END {print sum}' | sed 's/MiB//')
        OPTIMIZED_MEM=$(grep -E "(web|db|redis)" optimized_usage.txt | awk '{sum+=$3} END {print sum}' | sed 's/MiB//')
        
        if [[ -n "$CURRENT_MEM" && -n "$OPTIMIZED_MEM" ]]; then
            SAVINGS=$((CURRENT_MEM - OPTIMIZED_MEM))
            PERCENTAGE=$((SAVINGS * 100 / CURRENT_MEM))
            echo "💾 Memory savings: ${SAVINGS}MiB (${PERCENTAGE}%)"
        fi
        ;;
        
    *)
        echo "Usage: $0 [development|production|minimal|benchmark]"
        echo ""
        echo "Environments:"
        echo "  development  - Optimized development setup"
        echo "  production   - Optimized production setup"
        echo "  minimal      - Minimal resource usage"
        echo "  benchmark    - Compare current vs optimized"
        exit 1
        ;;
esac

echo ""
echo "🎯 Environment optimization complete!"
echo "💡 Tips:"
echo "   - Use 'docker stats' to monitor real-time usage"
echo "   - Use './docker-monitor.sh' for continuous monitoring"
echo "   - Run './scripts/optimize-docker.sh cleanup' to free up space"