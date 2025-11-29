---
description: "Execute comprehensive deployment with Docker, CI/CD, and production setup"
agent: build
subtask: true
---

# 🚀 Deployment Generator

Comprehensive deployment setup with Docker optimization, CI/CD pipelines, and production configuration.

## Phase 1: Deployment Type Selection

**What type of deployment are you setting up?**

- `docker` - Docker containerization and optimization
- `production` - Production environment setup and configuration
- `staging` - Staging environment setup
- `ci-cd` - CI/CD pipeline setup
- `monitoring` - Monitoring and observability setup
- `security` - Security hardening and compliance

**User provided:** $1

## Phase 2: Deployment Configuration

**Deployment Details:**

- **Environment:** $2 (development, staging, production)
- **Provider:** $3 (aws, gcp, azure, digitalocean, vercel, railway)
- **Domain:** $4 (custom domain or auto-generated)
- **Database:** $5 (postgresql, mysql, mongodb)
- **SSL/TLS:** $6 (letsencrypt, custom, managed)

**Generated Files:**

- Docker configurations
- CI/CD pipeline files
- Environment configurations
- Monitoring and logging setup
- Security configurations

## Phase 3: Docker Configuration

### Multi-Stage Dockerfile

```dockerfile
# Multi-stage Dockerfile for production optimization
FROM node:22-alpine AS base

# Install dependencies only for production
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Build application
FROM base AS builder
COPY --from=base /app/node_modules /app/node_modules
COPY . .
RUN npm run build

# Production image with security optimizations
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --group 1001 nodejs && \
    adduser --system --uid 1001 --gid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set security headers and optimizations
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Start application with security optimizations
CMD ["node", "server.js"]
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    image: inboxzero:latest
    container_name: inboxzero-app
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - NEXT_TELEMETRY_DISABLED=1
    env_file:
      - .env.production
    volumes:
      - app_data:/app/.next/cache
    networks:
      - inboxzero-network
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
        failure_action: rollback

  postgres:
    image: postgres:15-alpine
    container_name: inboxzero-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=inboxzero
      - POSTGRES_USER=inboxzero
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8
    env_file:
      - .env.production
    secrets:
      - postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - postgres_logs:/var/log/postgresql
    networks:
      - inboxzero-network
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: inboxzero-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD_FILE=/run/secrets/redis_password
    env_file:
      - .env.production
    secrets:
      - redis_password
    volumes:
      - redis_data:/data
    networks:
      - inboxzero-network
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 256M
        reservations:
          cpus: "0.125"
          memory: 128M
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: inboxzero-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - inboxzero-network
    depends_on:
      - app
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 128M

volumes:
  postgres_data:
  postgres_logs:
  redis_data:
  nginx_logs:
  nginx_ssl:

networks:
  inboxzero-network:
    driver: bridge

secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
```

### Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr$limit_zone_addr 10m;
    limit_req_zone $server_name$limit_zone_server 10m;

    limit_req_status $limit_zone_addr 10m;
    limit_req_log $limit_zone_addr;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!3DES;
    ssl_prefer_server_ciphers on;

    # Upstream to app
    upstream app {
        server app:3001;
        keepalive 32;
    }

    server {
        listen 80;
        listen 443 ssl http2;
        server_name inboxzero.com www.inboxzero.com;

        ssl_certificate /etc/nginx/ssl/inboxzero.com.crt;
        ssl_certificate_key /etc/nginx/ssl/inboxzero.com.key;

        # Rate limiting
        limit_req zone=$limit_zone_addr burst=20 nodelay;
        limit_req_status $limit_zone_addr;

        # Security
        client_max_body_size 10M;
        client_body_timeout 60s;
        client_header_timeout 60s;

        # Proxy to app
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
        }

        # Health check endpoint
        location /api/health {
            access_log off;
            return 200 "healthy";
            add_header Content-Type text/plain;
        }

        # Static file caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }
    }
}
```

## Phase 4: CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ["v*"]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: inboxzero

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{date}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha
          build-args: |
            BUILDKIT_INLINE_CACHE=1
            BUILDKIT_MULTI_PLATFORM=1

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/inboxzero
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -f

      - name: Health check
        run: |
          sleep 30
          curl -f https://inboxzero.com/api/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          text: |
            Deployment to production ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
```

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_BASE_URL=https://inboxzero.com
NEXT_PUBLIC_APP_NAME=Inbox Zero
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://inboxzero:${POSTGRES_PASSWORD}@postgres:5432/inboxzero
POSTGRES_DB=inboxzero
POSTGRES_USER=inboxzero

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=your-secure-redis-password

# Authentication
AUTH_SECRET=${AUTH_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
MICROSOFT_CLIENT_ID=${MICROSOFT_CLIENT_ID}
MICROSOFT_CLIENT_SECRET=${MICROSOFT_CLIENT_SECRET}

# AI Services
OPENAI_API_KEY=${OPENAI_API_KEY}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOGTAIL_API_KEY=${LOGTAIL_API_KEY}

# Email Services
RESEND_API_KEY=${RESEND_API_KEY}
POSTMARK_API_TOKEN=${POSTMARK_API_TOKEN}

# Security
CRON_SECRET=${CRON_SECRET}
ENCRYPTION_SECRET=${ENCRYPTION_SECRET}
ENCRYPTION_SALT=${ENCRYPTION_SALT}
```

## Phase 5: Monitoring Setup

### Application Monitoring

```typescript
// monitoring/metrics.ts
import { createPrometheusMetrics } from "prom-client";

export const metrics = {
  httpRequestsTotal: new createPrometheusMetrics({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
  }),

  httpRequestDuration: new createPrometheusMetrics({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route"],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),

  activeUsers: new createPrometheusMetrics({
    name: "active_users_total",
    help: "Total number of active users",
  }),

  emailProcessingQueue: new createPrometheusMetrics({
    name: "email_processing_queue_size",
    help: "Current size of email processing queue",
  }),
};

// Metrics middleware
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;

    metrics.httpRequestsTotal
      .inc({ method: req.method, route: req.path, status_code: res.statusCode })
      .inc();

    metrics.httpRequestDuration
      .observe({ method: req.method, route: req.path })
      .set(duration);
  });

  next();
};
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import redis from "@/utils/redis";

export const GET = async () => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    checks: {} as Record<string, boolean>,
  };

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = true;
  } catch (error) {
    health.checks.database = false;
    health.status = "unhealthy";
    health.error = "Database connection failed";
  }

  try {
    // Redis health check
    await redis.ping();
    health.checks.redis = true;
  } catch (error) {
    health.checks.redis = false;
    health.status = "unhealthy";
    health.error = "Redis connection failed";
  }

  // Check if all services are healthy
  const allHealthy = Object.values(health.checks).every((check) => check);
  health.status = allHealthy ? "healthy" : "unhealthy";

  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
};
```

## Phase 6: Security Hardening

### Security Configuration

```typescript
// security/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createSecureHeaders } from "@/utils/security";

export const securityMiddleware = (req: NextRequest) => {
  const response = NextResponse.next();

  // Add security headers
  const secureHeaders = createSecureHeaders({
    nonce: await generateNonce(),
    csp: createCSP(),
  });

  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting
  const clientIP = req.ip || "unknown";
  const rateLimitResult = await checkRateLimit(clientIP);

  if (rateLimitResult.blocked) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": rateLimitResult.retryAfter,
        "X-RateLimit-Limit": rateLimitResult.limit,
        "X-RateLimit-Remaining": rateLimitResult.remaining,
      },
    });
  }

  return response;
};

// Security utilities
export const createSecureHeaders = (options: {
  nonce?: string;
  csp?: string;
}) => {
  return {
    "Content-Security-Policy":
      options.csp ||
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    ...(options.nonce && {
      "Content-Security-Policy": `script-src 'self' 'nonce-${options.nonce}'`,
    }),
  };
};
```

## Phase 7: Production Optimization

### Performance Optimization

```typescript
// optimization/performance.ts
export const performanceConfig = {
  // Caching strategy
  caching: {
    apiResponses: {
      ttl: 300, // 5 minutes
      maxSize: 1000, // Max cached items
    },
    staticAssets: {
      ttl: 86400, // 24 hours
      maxSize: 10000, // Max cached items
    },
    databaseQueries: {
      ttl: 600, // 10 minutes
      maxSize: 500, // Max cached queries
    },
  },

  // Rate limiting
  rateLimiting: {
    api: {
      windowMs: 60000, // 1 minute
      maxRequests: 100,
    },
    auth: {
      windowMs: 900000, // 15 minutes
      maxRequests: 10,
    },
    uploads: {
      windowMs: 3600000, // 1 hour
      maxRequests: 5,
    },
  },

  // Resource limits
  resources: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 3,
    maxRequestSize: 50 * 1024 * 1024, // 50MB
    timeout: 30000, // 30 seconds
  },

  // Monitoring
  monitoring: {
    slowQueryThreshold: 1000, // 1 second
    memoryThreshold: 0.8, // 80% of available memory
    cpuThreshold: 0.8, // 80% of available CPU
    diskThreshold: 0.9, // 90% of available disk
  },
};
```

## Phase 8: File Generation

**Generate the following files:**

1. `Dockerfile.prod` - Optimized production Dockerfile
2. `docker-compose.prod.yml` - Production Docker Compose
3. `nginx/nginx.conf` - Nginx reverse proxy configuration
4. `.github/workflows/deploy.yml` - CI/CD pipeline
5. `.env.production` - Production environment variables
6. `monitoring/metrics.ts` - Application metrics
7. `app/api/health/route.ts` - Health check endpoint
8. `security/middleware.ts` - Security middleware
9. `optimization/performance.ts` - Performance configuration

## Phase 9: Deployment Scripts

### Deployment Automation

```bash
#!/bin/bash
# scripts/deploy.sh
set -e

echo "🚀 Starting deployment process..."

# Environment validation
if [ -z "$ENVIRONMENT" ]; then
  echo "❌ ENVIRONMENT not set"
  exit 1
fi

# Backup current deployment
echo "💾 Creating backup..."
./scripts/backup.sh

# Run tests
echo "🧪 Running tests..."
npm run test
npm run test:e2e

# Security scan
echo "🔒 Running security scan..."
npm audit
npm run security:scan

# Build application
echo "🔨 Building application..."
npm run build

# Deploy to environment
case $ENVIRONMENT in
  "production")
    echo "🌐 Deploying to production..."
    ./scripts/deploy-production.sh
    ;;
  "staging")
    echo "🧪 Deploying to staging..."
    ./scripts/deploy-staging.sh
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Health check
echo "🏥 Running health check..."
sleep 30
curl -f $DEPLOYMENT_URL/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

## Phase 10: Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract deployment type, environment, provider, and configuration
2. **Select Configuration**: Choose appropriate deployment setup and optimizations
3. **Generate Docker Files**: Create optimized Docker configurations
4. **Setup CI/CD**: Create automated deployment pipelines
5. **Configure Monitoring**: Set up performance monitoring and alerting
6. **Security Hardening**: Implement security best practices and configurations
7. **Create Scripts**: Generate deployment and maintenance scripts
8. **File Creation**: Write all configuration files to appropriate locations

**Examples:**

```bash
/deploy docker production aws "inboxzero.com" "postgresql" "letsencrypt"
/deploy production vercel "inboxzero.com" "" "" "managed"
/deploy ci-cd github "main" "production" "docker" "aws"
/deploy monitoring production "comprehensive" "prometheus,grafana,sentry"
/deploy security production "hardening" "owasp,nist,iso27001"
```

Execute comprehensive deployment setup now.
