#!/bin/bash

# Update Base URL Configuration for Google OAuth
# Changes base URL from localhost:3000 to localhost:3001

set -e

echo "🔧 Inbox Zero Base URL Configuration Update"
echo "=========================================="
echo ""

# Function to update base URL in environment files
update_base_url() {
    local target_url="$1"
    local file_pattern="$2"
    
    echo "📝 Updating base URL to: $target_url"
    
    # Find and update .env files
    find . -name ".env*" -type f | while read -r env_file; do
        if [[ -f "$env_file" ]] && grep -q "NEXT_PUBLIC_BASE_URL" "$env_file"; then
            echo "   📋 Updating $env_file"
            
            # Create backup
            backup_file="${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
            cp "$env_file" "$backup_file"
            
            # Update the base URL
            sed -i.bak "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=$target_url|" "$env_file"
            rm "${env_file}.bak"
            
            echo "      ✅ Updated $env_file (backup: $backup_file)"
        fi
    done
}

# Function to update port configuration in Docker files
update_docker_ports() {
    echo "🐳 Updating Docker port configurations..."
    
    # Update docker-compose.dev-optimized.yml to use port 3001
    if [[ -f "docker-compose.dev-optimized.yml" ]]; then
        echo "   📋 Updating docker-compose.dev-optimized.yml"
        cp docker-compose.dev-optimized.yml docker-compose.dev-optimized.yml.backup.$(date +%Y%m%d_%H%M%S)
        
        # Add web service configuration for port 3001
        cat > docker-compose.dev-optimized.yml << 'EOF'
name: inbox-zero-dev-optimized

services:
  db:
    image: postgres:16
    container_name: inbox-zero-dev-db
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-inboxzero}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
      - POSTGRES_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
      - POSTGRES_MAX_CONNECTIONS=25
      - POSTGRES_SHARED_BUFFERS=32MB
      - POSTGRES_EFFECTIVE_CACHE_SIZE=64MB
    command: postgres -c shared_preload_libraries=pg_stat_statements -c max_connections=25 -c shared_buffers=32MB -c effective_cache_size=64MB
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s
    volumes:
      - dev-database-data:/var/lib/postgresql/data
    ports:
      - 5433:5432
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.4'
        reservations:
          memory: 128M
          cpus: '0.2'

  redis:
    image: redis:7
    container_name: inbox-zero-dev-redis
    ports:
      - ${REDIS_PORT:-6380}:6379
    volumes:
      - dev-redis-data:/data
    restart: unless-stopped
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.15'
        reservations:
          memory: 64M
          cpus: '0.1'

  serverless-redis-http:
    image: hiett/serverless-redis-http:latest
    container_name: inbox-zero-dev-redis-http
    ports:
      - "${REDIS_HTTP_PORT:-8079}:80"
    environment:
      SRH_MODE: env
      SRH_TOKEN: ${UPSTASH_REDIS_TOKEN:-dev_token}
      SRH_CONNECTION_STRING: "redis://redis:6379"
    depends_on:
      - redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 64M
          cpus: '0.15'
        reservations:
          memory: 32M
          cpus: '0.05'

  web:
    image: ghcr.io/elie222/inbox-zero:latest
    pull_policy: if_not_present
    build:
      context: .
      dockerfile: ./docker/Dockerfile.prod
    env_file:
      - ./apps/web/.env
    depends_on:
      db:
        condition: service_healthy
        required: false
      redis:
        condition: service_started
        required: false
    ports:
      - 3001:3000
    networks:
      - inbox-zero-network
    environment:
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL:-http://localhost:3001}
      DATABASE_URL: ${DATABASE_URL:-postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@db:5432/${POSTGRES_DB:-inboxzero}?schema=public}
      DIRECT_URL: ${DIRECT_URL:-postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@db:5432/${POSTGRES_DB:-inboxzero}?schema=public}
      UPSTASH_REDIS_URL: ${UPSTASH_REDIS_URL:-http://serverless-redis-http:80}
      UPSTASH_REDIS_TOKEN: "${UPSTASH_REDIS_TOKEN}"
      NODE_OPTIONS: "--max_old_space_size=1024"
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.75'
        reservations:
          memory: 256M
          cpus: '0.25'

volumes:
  dev-database-data:
  dev-redis-data:

networks:
  inbox-zero-network:
EOF
        echo "      ✅ Updated docker-compose.dev-optimized.yml"
    fi
}

# Function to update Google OAuth redirect URIs
update_oauth_redirects() {
    echo "🔐 Updating Google OAuth redirect URIs..."
    
    # Create OAuth setup script
    cat > scripts/setup-oauth-redirects.sh << 'EOF'
#!/bin/bash

echo "🔐 Google OAuth Redirect URI Setup"
echo "================================="
echo ""

echo "📋 Required Redirect URIs for Google OAuth:"
echo "========================================"
echo ""
echo "For Local Development (localhost:3001):"
echo "1. http://localhost:3001/api/auth/callback/google"
echo "2. http://localhost:3001/api/google/linking/callback"
echo ""
echo "For Production (replace with your domain):"
echo "1. https://yourdomain.com/api/auth/callback/google"
echo "2. https://yourdomain.com/api/google/linking/callback"
echo ""
echo "🔧 Google Cloud Console Setup Steps:"
echo "=================================="
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Select your project or create a new one"
echo "3. Create OAuth 2.0 Client ID if not exists"
echo "4. In 'Authorized redirect URIs', add:"
echo "   - http://localhost:3001/api/auth/callback/google"
echo "   - http://localhost:3001/api/google/linking/callback"
echo "5. Copy the Client ID and Client Secret"
echo "6. Update your .env file with:"
echo "   GOOGLE_CLIENT_ID=your_client_id_here"
echo "   GOOGLE_CLIENT_SECRET=your_client_secret_here"
echo ""
echo "🎯 Microsoft OAuth Redirect URIs:"
echo "==============================="
echo "1. http://localhost:3001/api/auth/callback/microsoft"
echo "2. http://localhost:3001/api/outlook/linking/callback"
echo ""
echo "💡 Pro Tips:"
echo "============"
echo "- Use localhost:3001 consistently across all configurations"
echo "- Add both development and production URIs in Google Console"
echo "- Test OAuth flow after configuration"
echo "- Ensure HTTPS for production deployments"
EOF

    chmod +x scripts/setup-oauth-redirects.sh
    echo "   ✅ Created OAuth redirect setup script"
}

# Function to create development startup script for port 3001
create_dev_script() {
    echo "🚀 Creating development startup script..."
    
    cat > scripts/start-dev-3001.sh << 'EOF'
#!/bin/bash

# Inbox Zero Development Setup for Port 3001
# Optimized for Google OAuth with consistent base URL

set -e

echo "🚀 Starting Inbox Zero Development (Port 3001)"
echo "============================================"
echo ""

# Set environment for port 3001
export NEXT_PUBLIC_BASE_URL="http://localhost:3001"
echo "📍 Base URL: $NEXT_PUBLIC_BASE_URL"

# Start Docker services
echo "🐳 Starting Docker services..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev-optimized.yml down 2>/dev/null || true

# Clean up unused resources
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f > /dev/null 2>&1 || true

# Start optimized services
echo "🔧 Starting optimized services..."
docker-compose -f docker-compose.dev-optimized.yml up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🏥 Checking service health..."
docker-compose -f docker-compose.dev-optimized.yml ps

# Check environment configuration
if [[ -f "apps/web/.env" ]]; then
    current_url=$(grep "NEXT_PUBLIC_BASE_URL" apps/web/.env | cut -d'=' -f2)
    echo "📋 Current Base URL in .env: $current_url"
    
    if [[ "$current_url" != "http://localhost:3001" ]]; then
        echo "⚠️  Base URL in .env doesn't match. Please update:"
        echo "   NEXT_PUBLIC_BASE_URL=http://localhost:3001"
    fi
fi

echo ""
echo "🎉 Development environment ready!"
echo "================================"
echo "🌐 Web App: http://localhost:3001"
echo "🗄️ Database: localhost:5433"
echo "🔴 Redis: localhost:6380"
echo "🔍 Redis HTTP: http://localhost:8079"
echo ""
echo "🔧 OAuth Setup:"
echo "   Run: ./scripts/setup-oauth-redirects.sh"
echo ""
echo "📊 Monitor Resources:"
echo "   Run: ./docker/scripts/monitor.sh"
echo ""
echo "⚠️  Remember to configure Google OAuth with these redirect URIs:"
echo "   - http://localhost:3001/api/auth/callback/google"
echo "   - http://localhost:3001/api/google/linking/callback"
EOF

    chmod +x scripts/start-dev-3001.sh
    echo "   ✅ Created development startup script"
}

# Main execution
echo "🎯 Target Configuration: localhost:3001"
echo "=================================="
echo ""

# Update base URL in all environment files
update_base_url "http://localhost:3001"

# Update Docker configurations
update_docker_ports

# Update OAuth redirect URIs
update_oauth_redirects

# Create development script
create_dev_script

echo ""
echo "✅ Base URL Configuration Complete!"
echo "=================================="
echo ""
echo "📋 Changes Made:"
echo "• Updated all .env files to use http://localhost:3001"
echo "• Updated Docker compose to expose port 3001"
echo "• Created OAuth redirect setup script"
echo "• Created development startup script"
echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Start development environment:"
echo "   ./scripts/start-dev-3001.sh"
echo ""
echo "2. Set up Google OAuth:"
echo "   ./scripts/setup-oauth-redirects.sh"
echo ""
echo "3. Configure OAuth credentials in .env:"
echo "   GOOGLE_CLIENT_ID=your_client_id"
echo "   GOOGLE_CLIENT_SECRET=your_client_secret"
echo ""
echo "🔗 Google OAuth Console:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "💡 Port 3001 is now configured for:"
echo "• Consistent Google OAuth redirects"
echo "• Docker production-like setup"
echo "• Easier deployment transitions"