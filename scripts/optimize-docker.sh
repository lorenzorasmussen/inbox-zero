#!/bin/bash
# Docker Resource Optimization Script

set -e

echo "🐳 Docker Resource Optimization Script"
echo "====================================="

# Function to show current resource usage
show_resource_usage() {
    echo "📊 Current Docker Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""
}

# Function to clean up Docker resources
cleanup_docker() {
    echo "🧹 Cleaning up Docker resources..."
    
    # Remove stopped containers
    echo "Removing stopped containers..."
    docker container prune -f
    
    # Remove unused images
    echo "Removing unused images..."
    docker image prune -f
    
    # Remove unused build cache
    echo "Cleaning build cache..."
    docker builder prune -f
    
    # Remove unused volumes (be careful with this)
    echo "Removing unused volumes..."
    docker volume prune -f
    
    echo "✅ Cleanup completed!"
}

# Function to optimize Docker daemon settings
optimize_docker_daemon() {
    echo "⚙️ Optimizing Docker daemon settings..."
    
    # Create or update Docker daemon config
    DOCKER_CONFIG_DIR="$HOME/.docker"
    DAEMON_CONFIG_FILE="$DOCKER_CONFIG_DIR/daemon.json"
    
    mkdir -p "$DOCKER_CONFIG_DIR"
    
    # Create optimized daemon configuration
    cat > "$DAEMON_CONFIG_FILE" << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 3,
  "live-restore": true,
  "userland-proxy": false,
  "experimental": false,
  "metrics-addr": "127.0.0.1:9323",
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF
    
    echo "✅ Docker daemon configuration updated!"
    echo "⚠️  Please restart Docker for changes to take effect."
}

# Function to set up resource monitoring
setup_monitoring() {
    echo "📈 Setting up resource monitoring..."
    
    # Create a monitoring script
    cat > ./docker-monitor.sh << 'EOF'
#!/bin/bash
# Docker Resource Monitoring Script

while true; do
    clear
    echo "🐳 Docker Resource Monitor - $(date)"
    echo "=========================================="
    
    # System resources
    echo "💻 System Resources:"
    echo "CPU Usage: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')%"
    echo "Memory Usage: $(vm_stat | perl -ne '/page size of (\d+)/ and $ps=$1; /Pages\s+([^ ]+)\s+free/ and printf "%.2f%%\n", ((1 - $2/($1+$2))*100))')"
    echo ""
    
    # Docker container resources
    echo "📦 Container Resources:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    
    # Docker system info
    echo ""
    echo "🔧 Docker System Info:"
    docker system df
    
    sleep 5
done
EOF
    
    chmod +x ./docker-monitor.sh
    echo "✅ Monitoring script created as ./docker-monitor.sh"
    echo "🚀 Run './docker-monitor.sh' to start monitoring"
}

# Function to optimize build process
optimize_builds() {
    echo "🔨 Optimizing Docker build process..."
    
    # Create .dockerignore for better build context
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next
out
build
dist

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Documentation
README.md
docs/

# Scripts
scripts/
*.sh

# Cache
.cache
*.log

# Testing
coverage
.nyc_output
__tests__
*.test.js
*.spec.js

# Temporary files
tmp
temp
.tmp
EOF
    
    echo "✅ .dockerignore created for optimized builds"
}

# Main execution
case "${1:-all}" in
    "usage")
        show_resource_usage
        ;;
    "cleanup")
        cleanup_docker
        ;;
    "daemon")
        optimize_docker_daemon
        ;;
    "monitor")
        setup_monitoring
        ;;
    "build")
        optimize_builds
        ;;
    "all")
        show_resource_usage
        cleanup_docker
        optimize_docker_daemon
        setup_monitoring
        optimize_builds
        ;;
    *)
        echo "Usage: $0 [usage|cleanup|daemon|monitor|build|all]"
        echo ""
        echo "Commands:"
        echo "  usage    - Show current resource usage"
        echo "  cleanup  - Clean up Docker resources"
        echo "  daemon   - Optimize Docker daemon settings"
        echo "  monitor  - Set up resource monitoring"
        echo "  build    - Optimize Docker build process"
        echo "  all      - Run all optimizations"
        exit 1
        ;;
esac

echo ""
echo "🎉 Docker optimization completed!"
echo "📋 Next steps:"
echo "   1. Restart Docker daemon for daemon settings to take effect"
echo "   2. Use docker-compose.optimized.yml for production"
echo "   3. Use docker-compose.dev-ultra-optimized.yml for development"
echo "   4. Run './docker-monitor.sh' to monitor resources"