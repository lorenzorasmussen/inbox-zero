#!/bin/bash

echo "🔍 Development Environment Health Check"
echo "=================================="

# Check Node.js version
node_version=$(node --version)
echo "Node.js: $node_version"

# Check package manager
if command -v pnpm >/dev/null 2>&1; then
  echo "Package Manager: pnpm $(pnpm --version)"
elif command -v npm >/dev/null 2>&1; then
  echo "Package Manager: npm $(npm --version)"
else
  echo "Package Manager: Not found"
fi

# Check database connection
if pg_isready -h localhost -p 5433 >/dev/null 2>&1; then
  echo "Database: ✅ Connected"
else
  echo "Database: ❌ Not connected"
fi

# Check Redis connection
if redis-cli -p 6379 ping >/dev/null 2>&1; then
  echo "Redis: ✅ Connected"
else
  echo "Redis: ❌ Not connected"
fi

# Check environment files
if [ -f ".env" ]; then
  echo "Environment: ✅ .env exists"
else
  echo "Environment: ❌ .env missing"
fi

if [ -f ".env.local" ]; then
  echo "Environment: ✅ .env.local exists"
else
  echo "Environment: ⚠️ .env.local missing"
fi

# Check dependencies
if [ -d "node_modules" ]; then
  echo "Dependencies: ✅ Installed"
else
  echo "Dependencies: ❌ Not installed"
fi

# Check Docker
if docker info >/dev/null 2>&1; then
  echo "Docker: ✅ Running"
else
  echo "Docker: ❌ Not running"
fi

# Check Git status
if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Git: ✅ Repository"
else
  echo "Git: ❌ Not a repository"
fi

echo "=================================="
echo "✅ Health check completed"