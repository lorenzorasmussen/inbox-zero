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
