---
description: "Execute comprehensive project cleanup and maintenance tasks"
agent: "build"
subtask: true
---

# 🧹 Project Cleanup & Maintenance

Comprehensive project cleanup, dependency management, and maintenance operations.

## Phase 1: Cleanup Type Selection

**What type of cleanup are you performing?**

- `dependencies` - Update and clean package dependencies
- `cache` - Clear build caches and temporary files
- `git` - Git repository cleanup and optimization
- `database` - Database cleanup and maintenance
- `logs` - Log file cleanup and rotation
- `docker` - Docker cleanup and optimization
- `code` - Code quality and formatting cleanup
- `security` - Security audit and vulnerability cleanup
- `full` - Complete project cleanup and maintenance

**User provided:** $1

## Phase 2: Cleanup Configuration

**Cleanup Details:**

- **Target:** $2 (specific directory, file, or component)
- **Scope:** $3 (shallow vs deep cleanup)
- **Dry Run:** $4 (preview changes without executing)
- **Backup:** $5 (create backup before cleanup)

**Generated Actions:**

- Cleanup operations with safety checks
- Dependency updates and vulnerability fixes
- Cache clearing and optimization
- Git repository maintenance
- Database optimization and cleanup
- Log rotation and archival

## Phase 3: Dependency Cleanup

### Package Manager Optimization

```bash
# Dependency cleanup and optimization
echo "📦 Cleaning up dependencies..."

# Check for outdated packages
echo "🔍 Checking for outdated packages..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm outdated
else
  npm outdated
fi

# Remove unused dependencies
echo "🗑️ Removing unused dependencies..."
echo "Analyzing dependency usage..."

# Check for unused dependencies with depcheck
if command -v npx >/dev/null 2>&1; then
  npx depcheck
fi

# Update to latest secure versions
echo "⬆️ Updating to latest secure versions..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm update --latest
else
  npm update
fi

# Clean package lock
echo "🧹 Cleaning package lock files..."
rm -f pnpm-lock.yaml
rm -f package-lock.json

# Reinstall with fresh lock
echo "📦 Reinstalling dependencies..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
else
  npm ci
fi

echo "✅ Dependency cleanup completed"
```

### Security Audit

```bash
# Security audit of dependencies
echo "🔒 Running security audit..."

# Audit npm packages
if command -v pnpm >/dev/null 2>&1; then
  pnpm audit --audit-level moderate
else
  npm audit --audit-level moderate
fi

# Check for known vulnerabilities
echo "🔍 Checking for known vulnerabilities..."
if command -v snyk >/dev/null 2>&1; then
  snyk test --all-projects
fi

# Update vulnerable packages
echo "🛡️ Updating vulnerable packages..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm audit fix
else
  npm audit fix
fi

echo "✅ Security audit completed"
```

## Phase 4: Cache Cleanup

### Build Cache Removal

```bash
# Build cache cleanup
echo "🗑️ Cleaning build caches..."

# Next.js build cache
rm -rf .next
rm -rf apps/web/.next

# Turborepo cache
rm -rf .turbo
rm -rf node_modules/.cache

# Package manager cache
if command -v pnpm >/dev/null 2>&1; then
  pnpm store prune
else
  npm cache clean --force
fi

# TypeScript cache
find . -name "*.tsbuildinfo" -delete

# ESLint cache
find . -name ".eslintcache" -type d -exec rm -rf {} +

# Vite cache
rm -rf node_modules/.vite

echo "✅ Build cache cleanup completed"
```

### Runtime Cache Cleanup

```bash
# Runtime cache cleanup
echo "🧹 Cleaning runtime caches..."

# Redis cache cleanup
if command -v redis-cli >/dev/null 2>&1; then
  echo "🔍 Flushing Redis cache..."
  redis-cli FLUSHDB
  echo "✅ Redis cache flushed"
fi

# Application cache cleanup
echo "🗑️ Cleaning application caches..."
rm -rf apps/web/cache
rm -rf apps/web/tmp
rm -rf .cache

# Browser cache cleanup (development)
echo "🌐 Cleaning browser caches..."
rm -rf .chrome
rm -rf .firefox

echo "✅ Runtime cache cleanup completed"
```

## Phase 5: Git Repository Cleanup

### Git Repository Optimization

```bash
# Git repository cleanup
echo "🔧 Optimizing Git repository..."

# Cleanup untracked files
echo "🗑️ Removing untracked files..."
git clean -fd

# Remove stale branches
echo "🌿 Removing stale branches..."
git branch --merged | grep -v "\*" | xargs git branch -d

# Cleanup remote branches
echo "🌐 Cleaning up remote branches..."
git remote prune origin

# Optimize repository
echo "⚡ Optimizing Git repository..."
git gc --aggressive --prune=now

# Repack repository
echo "📦 Repacking repository..."
git repack -ad

# Cleanup reflogs
echo "🧹 Cleaning up reflogs..."
git reflog expire --expire=now --all

echo "✅ Git repository optimized"
```

### Git History Cleanup

```bash
# Git history cleanup
echo "📚 Cleaning Git history..."

# Interactive rebase for last N commits
echo "🔄 Starting interactive rebase..."
git rebase -i HEAD~10

# Filter sensitive information from history
echo "🔒 Filtering sensitive information..."
git filter-branch --force --index-filter 'rm -rf --cached --ignore-unmatch *.env* --prune-empty HEAD' --prune-empty merge

# Rewrite history to remove large files
echo "📦 Removing large files from history..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch 'large-files/*' --prune-empty merge HEAD' --prune-empty merge

echo "✅ Git history cleaned"
```

## Phase 6: Database Cleanup

### Database Optimization

```bash
# Database cleanup and optimization
echo "🗄️ Optimizing database..."

# Connect to database
echo "🔍 Analyzing database performance..."
psql $DATABASE_URL -c "
  -- Analyze slow queries
  SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
  FROM pg_stat_statements
  WHERE mean_time > 100
  ORDER BY mean_time DESC
  LIMIT 10;
"

# Update table statistics
echo "📊 Updating table statistics..."
psql $DATABASE_URL -c "
  -- Update statistics for all tables
  DO \$$
  DECLARE
    table_name TEXT;
  BEGIN
    FOR table_name IN
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    LOOP
      EXECUTE 'ANALYZE ' || table_name || ';';
    END LOOP;
  \$$
"

# Cleanup old data
echo "🧹 Cleaning up old data..."
psql $DATABASE_URL -c "
  -- Clean up old audit logs (older than 90 days)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Clean up old sessions (older than 30 days)
  DELETE FROM sessions
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Clean up old cache entries (older than 7 days)
  DELETE FROM cache_entries
  WHERE created_at < NOW() - INTERVAL '7 days';
"

# Rebuild indexes
echo "🔧 Rebuilding indexes..."
psql $DATABASE_URL -c "
  -- Rebuild indexes for better performance
  REINDEX DATABASE;
"

echo "✅ Database optimization completed"
```

## Phase 7: Code Quality Cleanup

### Code Formatting and Linting

```bash
# Code quality cleanup
echo "🧹 Cleaning up code quality..."

# Run code formatter
echo "🎨 Formatting code..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm format --write .
else
  npm run format
fi

# Run linter and fix issues
echo "🔍 Running linter with auto-fix..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm lint --fix .
else
  npm run lint --fix
fi

# Type checking
echo "📝 Running TypeScript type checking..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm type-check
else
  npx tsc --noEmit
fi

echo "✅ Code quality cleanup completed"
```

### Dead Code Elimination

```bash
# Dead code elimination
echo "🔍 Finding and removing dead code..."

# Find unused imports
if command -v ts-prune >/dev/null 2>&1; then
  echo "🔍 Finding unused imports..."
  ts-prune --no-error --unused
fi

# Find unused exports
echo "🔍 Finding unused exports..."
npx ts-unused-exports tsconfig.json

# Find unreachable code
echo "🔍 Finding unreachable code..."
npx unimported apps/web/src

# Remove unused files
echo "🗑️ Removing unused files..."
find apps/web/src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "export" "$file" && ! grep -q "import.*$file" apps/web/src/**/*.ts*; then
    echo "Removing unused file: $file"
    rm "$file"
  fi
done

echo "✅ Dead code elimination completed"
```

## Phase 8: Log Management

### Log Rotation and Cleanup

```bash
# Log management
echo "📋 Managing logs..."

# Rotate application logs
echo "🔄 Rotating application logs..."
find . -name "*.log" -type f -mtime +7d -exec gzip {} \;
find . -name "*.log" -type f -mtime +30d -delete

# Archive old logs
echo "📦 Archiving old logs..."
mkdir -p logs/archive
find . -name "*.log.gz" -mtime +90d -exec mv {} logs/archive/ \;

# Cleanup error logs
echo "🧹 Cleaning error logs..."
find . -name "error*.log" -mtime +7d -exec rm {} \;

# Setup log rotation
echo "⚙️ Setting up log rotation..."
cat > logrotate.conf << 'EOF'
logs/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 644
  postrotate
    /usr/bin/kill -USR1 \`cat /var/run/app.pid\`
}
EOF

echo "✅ Log management completed"
```

## Phase 9: Docker Cleanup

### Docker System Cleanup

```bash
# Docker cleanup
echo "🐳 Cleaning up Docker..."

# Remove unused images
echo "🗑️ Removing unused Docker images..."
docker image prune -f

# Remove unused containers
echo "🗑️ Removing unused Docker containers..."
docker container prune -f

# Remove unused volumes
echo "💾 Removing unused Docker volumes..."
docker volume prune -f

# Remove unused networks
echo "🌐 Removing unused Docker networks..."
docker network prune -f

# Cleanup build cache
echo "🔧 Cleaning Docker build cache..."
docker builder prune -f

# Get Docker system usage
echo "📊 Docker system usage..."
docker system df
docker system events --since 24h

echo "✅ Docker cleanup completed"
```

## Phase 10: File Generation

**Generate the following files:**

1. `scripts/cleanup.sh` - Main cleanup script
2. `scripts/maintenance.sh` - Regular maintenance script
3. `scripts/backup.sh` - Backup automation script
4. `scripts/health-check.sh` - Health monitoring script

## Phase 11: Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract cleanup type, target, scope, and options
2. **Safety Checks**: Perform backup and dry run validation
3. **Execute Cleanup**: Run appropriate cleanup operations
4. **Validation**: Verify cleanup was successful and no damage done
5. **Optimization**: Apply performance and maintenance optimizations
6. **Documentation**: Log cleanup actions and results
7. **File Creation**: Generate maintenance and automation scripts

**Examples:**

```bash
/cleanup dependencies "Update and clean package dependencies" "shallow" "false" "true"
/cleanup cache "Clear all build and runtime caches" "deep" "false" "true"
/cleanup git "Optimize Git repository and history" "shallow" "false" "true"
/cleanup database "Optimize database performance and cleanup old data" "deep" "false" "true"
/cleanup code "Format code and remove dead code" "shallow" "false" "true"
/cleanup logs "Rotate and archive log files" "shallow" "false" "true"
/cleanup docker "Clean up Docker system" "deep" "false" "true"
/cleanup full "Complete project cleanup and maintenance" "deep" "true" "true"
```

Execute comprehensive cleanup and maintenance now.
