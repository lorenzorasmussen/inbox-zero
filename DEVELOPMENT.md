# Development Environment Setup Guide

## Quick Start

### 🚀 One-Command Setup

```bash
./scripts/quick-start.sh
```

### 🔧 Manual Setup

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Environment Setup

```bash
# Copy environment template
cp apps/web/.env.example .env

# Create local overrides
cat >> .env.local << 'EOF'
# Local environment overrides
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3001
EOF
```

#### 3. Database Setup

```bash
# Start development containers
docker compose -f docker-compose.dev.yml up -d

# Generate Prisma client
cd apps/web && DATABASE_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" DIRECT_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" npx prisma generate

# Run migrations (if needed)
DATABASE_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" DIRECT_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" npx prisma migrate dev
```

#### 4. Start Development

```bash
pnpm dev
```

## Development Commands

### 🌐 Development Server

```bash
pnpm dev                    # Start development server
pnpm dev:docker            # Start with Docker containers
```

### 🧪 Testing

```bash
pnpm test                   # Run tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Run tests with coverage
pnpm test-ai               # Run AI-specific tests
pnpm test-e2e              # Run end-to-end tests
```

### 🔍 Code Quality

```bash
pnpm lint                   # Run linter
pnpm lint:fix               # Run linter with auto-fix
pnpm format-and-lint         # Format and lint code
pnpm format-and-lint:fix     # Format and lint with auto-fix
pnpm type-check             # Run TypeScript type checking
```

### 🗄️ Database

```bash
pnpm prisma migrate dev      # Run migrations
pnpm prisma studio           # Open Prisma Studio
pnpm db:reset               # Reset database
```

### 🛠️ Utilities

```bash
pnpm build                  # Build project
pnpm clean                  # Clean build artifacts
pnpm ncu                    # Update dependencies
./scripts/dev-health-check.sh # Check environment health
```

## Environment Configuration

### 📁 Environment Files

- **`.env`** - Main environment variables (copy from `.env.example`)
- **`.env.local`** - Local development overrides
- **`.env.example`** - Template with all available variables

### 🔗 Service URLs

- **Web App**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555
- **Database**: localhost:5433
- **Redis**: localhost:6379
- **Redis HTTP**: localhost:8079

### 🐳 Docker Services

```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# Stop all services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart specific service
docker compose -f docker-compose.dev.yml restart db
```

## IDE Configuration

### VS Code

- **Settings**: `.vscode/settings.json` configured for Biome, TypeScript, and Prisma
- **Extensions**: Recommended extensions in `.vscode/extensions.json`
- **Tasks**: Development tasks in `.vscode/tasks.json`

### Cursor

- **Rules**: Development environment rules in `.cursor/rules/development-setup.mdc`
- **Auto-completion**: Configured for project structure and commands

## Troubleshooting

### 🔧 Common Issues

#### Port Conflicts

```bash
# Check what's using port 3001
lsof -i :3001

# Kill process on port
kill -9 $(lsof -t -i :3001)
```

#### Database Issues

```bash
# Reset database
cd apps/web && DATABASE_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" DIRECT_URL="postgresql://postgres:password@localhost:5433/inboxzero?schema=public" npx prisma migrate reset

# Check database status
docker compose -f docker-compose.dev.yml ps
```

#### Dependency Issues

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install

# Clear cache
pnpm store prune
```

#### Docker Issues

```bash
# Restart Docker Desktop
# Check Docker status
docker info

# Rebuild containers
docker compose -f docker-compose.dev.yml up --build
```

### 🏥 Health Check

Run the health check script to verify your environment:

```bash
./scripts/dev-health-check.sh
```

Expected output:

```
🔍 Development Environment Health Check
==================================
Node.js: v25.1.0
Package Manager: pnpm 10.22.0
Database: ✅ Connected
Redis: ✅ Connected
Environment: ✅ .env exists
Environment: ✅ .env.local exists
Dependencies: ✅ Installed
Docker: ✅ Running
Git: ✅ Repository
==================================
✅ Health check completed
```

## Project Structure

### 📁 Key Directories

```
inbox-zero-google-migration/
├── apps/
│   └── web/                 # Main web application
├── packages/                  # Shared packages
├── scripts/                   # Development scripts
├── docker-compose.dev.yml      # Development containers
├── .vscode/                  # VS Code configuration
├── .cursor/                  # Cursor configuration
├── .env                      # Environment variables
├── .env.local                 # Local overrides
└── package.json               # Root package.json
```

### 📋 Package Scripts

- **`dev`**: Start development server with Turbopack
- **`build`**: Build production version with migrations
- **`test`**: Run test suite with Vitest
- **`lint`**: Run Biome linter
- **`prepare`**: Install Git hooks with Husky

## Development Workflow

### 🔄 Daily Development

1. **Start**: `./scripts/quick-start.sh`
2. **Develop**: Make changes to code
3. **Test**: `pnpm test` to verify changes
4. **Lint**: `pnpm lint` to check code quality
5. **Commit**: Git commit with automated hooks

### 🧪 Testing Strategy

- **Unit Tests**: Fast, isolated component tests
- **Integration Tests**: API and database interaction tests
- **E2E Tests**: Full user workflow tests
- **AI Tests**: Specialized AI functionality tests

### 📊 Code Quality

- **Biome**: Fast linting and formatting
- **TypeScript**: Strict type checking
- **Husky**: Pre-commit hooks for quality
- **Turbo**: Monorepo build orchestration

## Performance Optimization

### ⚡ Development Performance

- **Turbopack**: Fast development bundling
- **pnpm**: Efficient package management
- **Docker**: Isolated development environment
- **Hot Reload**: Fast development iteration

### 🧹 Memory Management

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=2048"

# Clean up large node_modules
find . -name "node_modules" -type d -exec rm -rf {} +
```

## Security Notes

### 🔒 Environment Security

- **Never commit** `.env` files with real secrets
- **Use example files** for templates
- **Generate secrets** with OpenSSL commands provided in `.env.example`
- **Local overrides** in `.env.local` for development

### 🛡️ Development Security

- **Docker isolation** for dependencies
- **Database credentials** are local only
- **API keys** should be environment-specific
- **Git hooks** enforce quality and security checks

## Getting Help

### 📚 Resources

- **Project README**: `./README.md`
- **Architecture**: `./ARCHITECTURE.md`
- **Constitutional Standards**: `./CONSTITUTION.md`
- **Development Workflow**: `./DEVELOPMENT_WORKFLOW_GUIDE.md`

### 🆘 Support

- **Health Check**: Run `./scripts/dev-health-check.sh`
- **Logs**: Check Docker logs and application logs
- **Issues**: Check existing GitHub issues or create new ones

---

_Last updated: $(date +%Y-%m-%d)_
