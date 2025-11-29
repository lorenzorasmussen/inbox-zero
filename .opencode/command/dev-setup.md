---
description: "Setup development environment with dependencies, configuration, and tools"
agent: "build"
subtask: true
---

# 🛠️ Development Environment Setup

Configure development environment for Inbox Zero with proper dependencies, configuration, and development tools.

## Phase 1: Environment Analysis

**Current Environment Status:**

- **Node.js Version:** !`node --version`
- **Package Manager:** !`which pnpm >/dev/null 2>&1 && echo "pnpm" || (which npm >/dev/null 2>&1 && echo "npm" || echo "unknown")`
- **Git Status:** !`git rev-parse --git-dir >/dev/null 2>&1 && echo "Initialized" || echo "Not initialized"`
- **Docker Status:** !`docker --version 2>/dev/null || echo "Not installed"`

**Project Dependencies Check:**

- **Dependencies Installed:** !`test -f package.json && echo "package.json exists" || echo "package.json not found"`
- **Node Modules:** !`test -d node_modules && echo "node_modules exists" || echo "node_modules not found"`
- **Environment Files:** !`ls -la .env* 2>/dev/null | wc -l || echo "0"`

## Phase 2: Dependency Installation

### Package Manager Selection

**Install/Update package manager:**

```bash
# Install pnpm if not available
if ! command -v pnpm >/dev/null 2>&1; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
  echo "✅ pnpm installed successfully"
fi

# Set pnpm as preferred package manager
echo "🔧 Setting pnpm as default package manager..."
npm config set package-manager pnpm
```

### Project Dependencies Installation

```bash
# Install project dependencies
echo "📦 Installing project dependencies..."

if [ -f "package.json" ]; then
  if command -v pnpm >/dev/null 2>&1; then
    echo "Using pnpm..."
    pnpm install
  elif command -v npm >/dev/null 2>&1; then
    echo "Using npm..."
    npm install
  else
    echo "❌ No package manager found. Please install npm or pnpm."
    exit 1
  fi

  echo "✅ Dependencies installed successfully"
else
  echo "❌ package.json not found. Please run from project root."
  exit 1
fi
```

### Development Tools Installation

```bash
# Install essential development tools
echo "🛠️ Installing development tools..."

# Install global tools
tools_to_install=(
  "typescript-language-server"
  "typescript"
  "vitest"
  "@biomejs/biome"
  "prettier"
  "eslint"
  "prisma"
)

for tool in "${tools_to_install[@]}"; do
  if command -v pnpm >/dev/null 2>&1; then
    echo "Installing $tool with pnpm..."
    pnpm add -g $tool
  else
    echo "Installing $tool with npm..."
    npm install -g $tool
  fi
done

echo "✅ Development tools installed"
```

## Phase 3: Environment Configuration

### Environment Variables Setup

```bash
# Create environment configuration
echo "⚙️ Setting up environment configuration..."

# Check if .env.example exists
if [ -f ".env.example" ]; then
  if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update with your values."
  else
    echo "ℹ️ .env already exists"
  fi
else
  echo "⚠️ .env.example not found"
fi

# Create .env.local for local overrides
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
```

### Database Setup

```bash
# Setup database for development
echo "🗄️ Setting up database..."

# Check if Docker is available
if command -v docker >/dev/null 2>&1; then
  echo "🐳 Using Docker for database..."

  # Start PostgreSQL and Redis containers
  if [ -f "docker-compose.dev.yml" ]; then
    echo "Starting development containers..."
    docker compose -f docker-compose.dev.yml up -d

    # Wait for containers to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10

    echo "✅ Database containers started"
  else
    echo "⚠️ docker-compose.dev.yml not found"
  fi
else
  echo "⚠️ Docker not found. Please install Docker or set up local database."
fi

# Run database migrations
if [ -f "package.json" ]; then
  echo "🔄 Running database migrations..."

  if command -v pnpm >/dev/null 2>&1; then
    pnpm prisma migrate dev
  else
    npm run prisma migrate dev
  fi

  echo "✅ Database migrations completed"
fi
```

## Phase 4: Development Tools Configuration

### Git Configuration

```bash
# Setup Git configuration
echo "🔧 Setting up Git configuration..."

# Configure Git user if not set
if [ -z "$(git config --global user.name)" ]; then
  echo "Setting Git user name..."
  git config --global user.name "Inbox Zero Developer"
fi

if [ -z "$(git config --global user.email)" ]; then
  echo "Setting Git user email..."
  git config --global user.email "developer@inboxzero.dev"
fi

# Configure Git settings
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf input

echo "✅ Git configuration completed"
```

### VS Code Configuration

```bash
# Setup VS Code workspace
echo "💻 Setting up VS Code configuration..."

# Create .vscode directory
mkdir -p .vscode

# Create VS Code settings
cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.fixAll.biomejs.biome": "explicit"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
EOF

# Create VS Code extensions
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
EOF

# Create VS Code tasks
cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development Server",
      "type": "shell",
      "command": "pnpm dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "pnpm test",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Build Project",
      "type": "shell",
      "command": "pnpm build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Database Migrate",
      "type": "shell",
      "command": "pnpm prisma migrate dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
EOF

echo "✅ VS Code configuration completed"
```

## Phase 5: Development Scripts

### Package.json Scripts Update

```bash
# Update package.json with development scripts
echo "📝 Updating package.json scripts..."

# Check if jq is available for JSON manipulation
if command -v jq >/dev/null 2>&1; then
  echo "Updating package.json with jq..."

  # Add development scripts
  jq '.scripts += {
    "dev:setup": "pnpm install && pnpm prisma migrate dev",
    "dev:docker": "docker compose -f docker-compose.dev.yml up -d && pnpm dev",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint:fix": "biome check . --write",
    "type-check": "tsc --noEmit",
    "db:reset": "pnpm prisma migrate reset",
    "db:studio": "pnpm prisma studio",
    "clean": "rm -rf .next node_modules",
    "clean:full": "rm -rf .next node_modules pnpm-lock.yaml && pnpm install"
  }' package.json > package.json.tmp && mv package.json.tmp package.json

  echo "✅ package.json updated"
else
  echo "⚠️ jq not found. Please manually update package.json scripts"
fi
```

### Husky Setup

```bash
# Setup Git hooks with Husky
echo "🪝 Setting up Git hooks..."

# Initialize Husky
if command -v pnpm >/dev/null 2>&1; then
  pnpm prepare
else
  npm run prepare
fi

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting and type checking
echo "🔍 Running pre-commit checks..."

# Lint code
echo "🔧 Running linter..."
pnpm lint

# Run tests
echo "🧪 Running tests..."
pnpm test --run

echo "✅ Pre-commit checks passed"
EOF

# Create pre-push hook
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite before push
echo "🧪 Running full test suite..."
pnpm test

echo "✅ Pre-push checks passed"
EOF

# Make hooks executable
chmod +x .husky/pre-commit .husky/pre-push

echo "✅ Git hooks configured"
```

## Phase 6: Development Server Setup

### Local Development

```bash
# Start development server
echo "🚀 Starting development server..."

# Check if database is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "⚠️ Database is not running. Starting Docker containers..."
  docker compose -f docker-compose.dev.yml up -d
  sleep 10
fi

# Start development server
if command -v pnpm >/dev/null 2>&1; then
  echo "Starting with pnpm..."
  pnpm dev
else
  echo "Starting with npm..."
  npm run dev
fi
```

### Docker Development

```bash
# Start development with Docker
echo "🐳 Starting Docker development environment..."

# Build and start all services
docker compose -f docker-compose.dev.yml up --build

echo "✅ Docker development environment started"
echo "📊 Services available at:"
echo "  - Web App: http://localhost:3001"
echo "  - Database: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - Prisma Studio: http://localhost:5555"
```

## Phase 7: Environment Validation

### Health Check Script

```bash
# Create development health check
echo "🏥 Creating development health check..."

cat > scripts/dev-health-check.sh << 'EOF'
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
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "Database: ✅ Connected"
else
  echo "Database: ❌ Not connected"
fi

# Check Redis connection
if redis-cli ping >/dev/null 2>&1; then
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

# Check dependencies
if [ -d "node_modules" ]; then
  echo "Dependencies: ✅ Installed"
else
  echo "Dependencies: ❌ Not installed"
fi

echo "=================================="
echo "✅ Health check completed"
EOF

chmod +x scripts/dev-health-check.sh

echo "✅ Health check script created"
```

## Phase 8: Development Workflow

### Quick Start Script

```bash
# Create quick start script
echo "⚡ Creating quick start script..."

cat > scripts/quick-start.sh << 'EOF'
#!/bin/bash

echo "🚀 Quick Start Development Environment"
echo "===================================="

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "📝 .env created from example"
fi

# Start database
echo "🗄️ Starting database..."
docker compose -f docker-compose.dev.yml up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🔄 Running migrations..."
pnpm prisma migrate dev

# Start development server
echo "🌐 Starting development server..."
pnpm dev

echo "✅ Development environment ready!"
echo "📊 Available at: http://localhost:3001"
EOF

chmod +x scripts/quick-start.sh

echo "✅ Quick start script created"
```

### Development Commands

```bash
# Create development commands reference
echo "📋 Creating development commands reference..."

cat > DEVELOPMENT.md << 'EOF'
# Development Environment Commands

## Quick Start
\`\`\`bash
./scripts/quick-start.sh
\`\`\`

## Manual Setup

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Environment Setup
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 3. Database Setup
\`\`\`bash
# Start with Docker
docker compose -f docker-compose.dev.yml up -d

# Run migrations
pnpm prisma migrate dev
\`\`\`

### 4. Start Development
\`\`\`bash
pnpm dev
\`\`\`

## Development Commands

### Development Server
\`\`\`bash
pnpm dev                    # Start development server
pnpm dev:docker            # Start with Docker containers
\`\`\`

### Testing
\`\`\`bash
pnpm test                   # Run tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Run tests with coverage
\`\`\`

### Code Quality
\`\`\`bash
pnpm lint                   # Run linter
pnpm lint:fix               # Run linter with auto-fix
pnpm type-check             # Run TypeScript type checking
\`\`\`

### Database
\`\`\`bash
pnpm prisma migrate dev      # Run migrations
pnpm prisma studio           # Open Prisma Studio
pnpm db:reset               # Reset database
\`\`\`

### Utilities
\`\`\`bash
pnpm clean                  # Clean build artifacts
pnpm clean:full             # Full clean and reinstall
./scripts/dev-health-check.sh # Check environment health
\`\`\`

## Environment URLs

- **Web App**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Troubleshooting

### Database Issues
\`\`\`bash
# Reset database
pnpm db:reset

# Check database status
docker compose -f docker-compose.dev.yml ps
\`\`\`

### Dependency Issues
\`\`\`bash
# Clean and reinstall
pnpm clean:full

# Clear cache
pnpm store prune
\`\`\`

### Port Conflicts
\`\`\`bash
# Check what's using port 3001
lsof -i :3001

# Kill process on port
kill -9 \$(lsof -t -i :3001)
\`\`\`
EOF

echo "✅ Development commands reference created"
```

## Phase 9: IDE Integration

### Cursor Integration

```bash
# Setup Cursor integration
echo "🔧 Setting up Cursor integration..."

# Create Cursor configuration
mkdir -p .cursor

cat > .cursor/rules/development-setup.mdc << 'EOF'
---
description: Development environment setup and configuration
globs: ["package.json", "*.env*", "docker-compose*.yml"]
alwaysApply: true
---

# Development Environment Setup

## Required Tools
- Node.js 22+
- pnpm 10+
- Docker & Docker Compose
- Git

## Environment Files
- \`.env\` - Local environment variables
- \`.env.local\` - Local overrides
- \`.env.example\` - Template configuration

## Database Setup
- PostgreSQL via Docker Compose
- Redis via Docker Compose
- Prisma migrations required

## Development Commands
- \`pnpm dev\` - Start development server
- \`pnpm test\` - Run test suite
- \`pnpm lint\` - Run code quality checks
- \`pnpm prisma studio\` - Open database GUI

## Health Check
Run \`./scripts/dev-health-check.sh\` to verify environment.
EOF

echo "✅ Cursor integration configured"
```

## Phase 10: File Creation

**Generate the following files:**

1. `scripts/quick-start.sh` - Quick environment setup
2. `scripts/dev-health-check.sh` - Environment health validation
3. `DEVELOPMENT.md` - Development commands reference
4. `.vscode/settings.json` - VS Code configuration
5. `.vscode/extensions.json` - VS Code extensions
6. `.vscode/tasks.json` - VS Code tasks
7. `.cursor/rules/development-setup.mdc` - Cursor rules

**Update:**

- `package.json` - Add development scripts
- `.husky/pre-commit` - Pre-commit Git hook
- `.husky/pre-push` - Pre-push Git hook

## Execution Protocol

**NOW execute the following:**

1. **Environment Analysis**: Check current environment status and tools
2. **Dependency Installation**: Install/update package manager and dependencies
3. **Environment Configuration**: Setup environment variables and database
4. **Development Tools**: Configure Git, VS Code, and other tools
5. **Scripts Creation**: Create development and utility scripts
6. **IDE Integration**: Setup VS Code and Cursor configurations
7. **Health Validation**: Create health check and validation scripts
8. **Documentation**: Create development documentation and references

**Examples:**

```bash
/dev-setup                    # Full environment setup
/dev-setup quick               # Quick setup with defaults
/dev-setup docker              # Docker-based setup
/dev-setup tools               # Install development tools only
```

Execute development environment setup now.
