#!/bin/bash

echo "🚀 Quick Start Development Environment"
echo "===================================="

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
  cp apps/web/.env.example .env
  echo "📝 .env created from example"
fi

if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local for local overrides..."
  cat > .env.local << 'EOF'
# Local environment overrides
# These values override .env for local development
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3001
EOF
  echo "✅ .env.local created"
fi

# Start database
echo "🗄️ Starting database..."
docker compose -f docker-compose.dev.yml up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/web && DATABASE_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" DIRECT_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" npx prisma generate

# Start development server
echo "🌐 Starting development server..."
pnpm dev

echo "✅ Development environment ready!"
echo "📊 Available at: http://localhost:3001"