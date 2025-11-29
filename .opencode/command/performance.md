---
description: "Execute performance optimization and monitoring setup"
agent: "build"
subtask: true
---

# ⚡ Performance Optimization & Monitoring

Comprehensive performance optimization, monitoring setup, and benchmarking for Inbox Zero application.

## Phase 1: Performance Analysis

**Current Performance Status:**

- **Bundle Size Analysis:** !`find apps/web/.next -name "*.js" -exec ls -lh {} \; | awk '{sum+=$5} END {print "Total: " sum/1024 "MB"}'`
- **Database Query Performance:** !`cd apps/web && pnpm prisma db pull --preview 2>/dev/null || echo "No recent queries"`
- **API Response Times:** !`echo "Run: pnpm dev:api-benchmarks for performance testing"`
- **Memory Usage:** !`ps aux | head -10 | awk '{print $4, $11}' | sort -nr | head -5`

**Performance Targets:**

- **API Response Time:** <200ms (95th percentile)
- **Database Query Time:** <50ms (average)
- **Bundle Size:** <500KB (main bundle)
- **Memory Usage:** <512MB (production)
- **CPU Usage:** <70% (average)

## Phase 2: Optimization Strategy

### Frontend Optimization

```typescript
// Performance optimization configuration
interface PerformanceConfig {
  bundling: {
    codeSplitting: boolean;
    treeShaking: boolean;
    minification: boolean;
    compression: boolean;
  };
  runtime: {
    lazyLoading: boolean;
    imageOptimization: boolean;
    caching: boolean;
    prefetching: boolean;
  };
  monitoring: {
    webVitals: boolean;
    bundleAnalysis: boolean;
    performanceBudgets: boolean;
  };
}

// Optimization implementation
const performanceOptimizations = {
  // Bundle Optimization
  codeSplitting: {
    routeLevel: true, // Dynamic imports for routes
    componentLevel: true, // Lazy load heavy components
    vendorSeparation: true, // Separate vendor bundles
  },
  treeShaking: {
    enabled: true, // Remove unused code
    sideEffects: false, // Mark pure modules
    analysis: true, // Analyze bundle composition
  },
  minification: {
    enabled: true, // Minify production builds
    mangle: true, // Obfuscate variable names
  },

  // Runtime Optimization
  lazyLoading: {
    components: true, // React.lazy for heavy components
    routes: true, // Dynamic imports for routes
    images: true, // Lazy load images below fold
  },
  caching: {
    apiResponses: true, // Cache API responses
    staticAssets: true, // Long-term asset caching
    databaseQueries: true, // Query result caching
  },

  // Monitoring
  webVitals: {
    enabled: true, // Track Core Web Vitals
    reporting: true, // Send to analytics
    thresholds: true, // Set performance budgets
  },
};
```

### Backend Optimization

```typescript
// Backend performance optimization
interface BackendPerformanceConfig {
  database: {
    indexing: boolean;
    queryOptimization: boolean;
    connectionPooling: boolean;
    caching: boolean;
  };
  api: {
    responseCompression: boolean;
    rateLimiting: boolean;
    caching: boolean;
    pagination: boolean;
  };
  server: {
    compression: boolean;
    loadBalancing: boolean;
    monitoring: boolean;
  };
}

// Database optimization
const databaseOptimizations = {
  indexing: {
    compositeIndexes: true, // Multi-column indexes
    partialIndexes: true, // Cover common query patterns
    indexMaintenance: true, // Regular index analysis
  },
  queryOptimization: {
    selectSpecificFields: true, // Avoid SELECT *
    queryNPlusOne: true, // Prevent N+1 problems
    batchOperations: true, // Batch inserts/updates
    connectionPooling: true, // Reuse database connections
  },
  caching: {
    queryResults: true, // Cache frequent queries
    computedFields: true, // Cache expensive computations
    sessionData: true, // Cache user sessions
  },
};
```

## Phase 3: Monitoring Setup

### Application Performance Monitoring

```typescript
// Performance monitoring configuration
interface MonitoringConfig {
  metrics: {
    responseTime: boolean;
    throughput: boolean;
    errorRate: boolean;
    resourceUsage: boolean;
  };
  alerting: {
    thresholds: PerformanceThresholds;
    notifications: NotificationChannel[];
    escalation: EscalationPolicy;
  };
  visualization: {
    dashboards: DashboardConfig[];
    reports: ReportConfig[];
    alerts: AlertConfig[];
  };
}

// Performance thresholds
const performanceThresholds = {
  api: {
    responseTimeP95: 200, // ms
    responseTimeP99: 500, // ms
    errorRate: 0.01, // 1%
    throughput: 1000, // requests/minute
  },
  database: {
    queryTime: 50, // ms
    connectionCount: 100, // max connections
    slowQueries: 1000, // ms
  },
  frontend: {
    firstContentfulPaint: 1.5, // seconds
    largestContentfulPaint: 2.5, // seconds
    cumulativeLayoutShift: 0.1, // CLS score
    firstInputDelay: 100, // ms
  },
};
```

### Real User Monitoring

```typescript
// Real User Monitoring (RUM) setup
interface RUMConfig {
  webVitals: {
    enabled: boolean;
    sampleRate: number; // 0-1
    endpoint: string;
  };
  userExperience: {
    errorTracking: boolean;
    sessionTracking: boolean;
    performanceTracking: boolean;
  };
  business: {
    conversionTracking: boolean;
    featureUsage: boolean;
    userSatisfaction: boolean;
  };
}

// RUM implementation
const rumImplementation = {
  webVitals: {
    enabled: true,
    sampleRate: 0.1, // 10% of users
    endpoint: "/api/analytics/web-vitals",
    metrics: ["FCP", "LCP", "CLS", "FID"],
  },
  errorTracking: {
    enabled: true,
    grouping: true, // Group similar errors
    context: true, // Include browser, OS, user info
    stacktraces: true, // Include full stack traces
  },
  performanceTracking: {
    enabled: true,
    customMetrics: true, // Track business-specific metrics
    userTimings: true, // Track user interaction timing
  },
};
```

## Phase 4: Benchmarking Framework

### Performance Benchmarking

```typescript
// Benchmark configuration
interface BenchmarkConfig {
  load: {
    concurrentUsers: number;
    requestsPerSecond: number;
    duration: number; // seconds
  };
  stress: {
    maxLoad: number;
    rampUpTime: number;
    sustainTime: number;
  };
  comparison: {
    baselineMetrics: PerformanceMetrics;
    targetMetrics: PerformanceMetrics;
    improvementGoals: string[];
  };
}

// Benchmark implementation
const benchmarkImplementation = {
  loadTesting: {
    tool: "k6", // or artillery, jmeter
    scenarios: [
      {
        name: "API Load Test",
        weight: 70,
        flow: "api-flow",
      },
      {
        name: "Web App Load Test",
        weight: 30,
        flow: "web-app-flow",
      },
    ],
    thresholds: {
      http_req_duration: ["p(95)<200"],
      http_req_failed: ["rate<0.01"],
    },
  },
  stressTesting: {
    tool: "k6",
    maxLoad: 5000, // concurrent users
    rampUpTime: 300, // seconds
    sustainTime: 600, // seconds
    breakdownThreshold: 5, // error rate
  },
  performanceComparison: {
    baseline: {
      bundleSize: "450KB",
      apiResponseTime: "150ms",
      databaseQueryTime: "30ms",
    },
    target: {
      bundleSize: "350KB", // 22% reduction
      apiResponseTime: "100ms", // 33% improvement
      databaseQueryTime: "20ms", // 33% improvement
    },
  },
};
```

## Phase 5: Optimization Implementation

### Bundle Optimization

```javascript
// next.config.js optimizations
module.exports = {
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "date-fns",
    ],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "async",
            enforce: true,
          },
        },
      };

      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
```

### Database Optimization

```sql
-- Database optimization queries

-- Add composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_email_user_date
ON emails (user_id, received_at DESC);

-- Add partial indexes for filtering
CREATE INDEX CONCURRENTLY idx_rules_enabled_account
ON email_rules (email_account_id, enabled)
WHERE enabled = true;

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

-- Update table statistics
ANALYZE emails;
ANALYZE email_rules;
ANALYZE users;
```

### API Optimization

```typescript
// API performance optimizations
import { NextResponse } from "next/server";
import { cache } from "@/utils/cache";

// Response compression
export const withCompression = (handler) => {
  return async (request) => {
    const response = await handler(request);

    // Add compression headers
    response.headers.set("Content-Encoding", "gzip");
    response.headers.set("Vary", "Accept-Encoding");

    return response;
  };
};

// Response caching
export const withCache =
  (ttl = 300) =>
  (handler) => {
    return async (request) => {
      const cacheKey = `cache:${request.url}:${JSON.stringify(request.body)}`;

      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return new NextResponse(JSON.stringify(cached), {
          headers: { "X-Cache": "HIT" },
        });
      }

      // Execute handler
      const response = await handler(request);

      // Cache successful responses
      if (response.status === 200) {
        await cache.set(cacheKey, await response.json(), ttl);
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          ...response.headers,
          "X-Cache": "MISS",
        },
      });
    };
  };

// Rate limiting
export const withRateLimit =
  (options = {}) =>
  (handler) => {
    const rateLimitMap = new Map();

    return async (request) => {
      const clientId = request.ip || "unknown";
      const now = Date.now();
      const windowMs = options.windowMs || 60000; // 1 minute
      const maxRequests = options.max || 100;

      // Check rate limit
      const requests = rateLimitMap.get(clientId) || [];
      const validRequests = requests.filter((time) => now - time < windowMs);

      if (validRequests.length >= maxRequests) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests" }),
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": maxRequests.toString(),
              "X-RateLimit-Remaining": Math.max(
                0,
                maxRequests - validRequests.length,
              ).toString(),
              "X-RateLimit-Reset": new Date(now + windowMs).toISOString(),
            },
          },
        );
      }

      // Update request log
      validRequests.push(now);
      rateLimitMap.set(clientId, validRequests);

      // Execute handler
      return await handler(request);
    };
  };
```

## Phase 6: Monitoring Implementation

### Performance Metrics Collection

```typescript
// Performance metrics collection
interface PerformanceMetrics {
  api: {
    responseTime: number[];
    throughput: number;
    errorRate: number;
    statusCode: Record<number, number>;
  };
  database: {
    queryTime: number[];
    connectionCount: number;
    slowQueries: number;
  };
  frontend: {
    webVitals: WebVitalsMetrics;
    bundleSize: BundleMetrics;
    resourceTiming: ResourceTimingMetrics;
  };
  business: {
    conversionRate: number;
    userSatisfaction: number;
    featureUsage: Record<string, number>;
  };
}

// Metrics collection implementation
class PerformanceCollector {
  private metrics: PerformanceMetrics = {
    api: { responseTime: [], throughput: 0, errorRate: 0, statusCode: {} },
    database: { queryTime: [], connectionCount: 0, slowQueries: 0 },
    frontend: { webVitals: {}, bundleSize: {}, resourceTiming: {} },
    business: { conversionRate: 0, userSatisfaction: 0, featureUsage: {} },
  };

  recordApiMetric(responseTime: number, statusCode: number) {
    this.metrics.api.responseTime.push(responseTime);
    this.metrics.api.statusCode[statusCode] =
      (this.metrics.api.statusCode[statusCode] || 0) + 1;

    // Calculate error rate
    const totalRequests = Object.values(this.metrics.api.statusCode).reduce(
      (a, b) => a + b,
      0,
    );
    const errorRequests = Object.entries(this.metrics.api.statusCode)
      .filter(([code]) => code >= 400)
      .reduce((a, [, count]) => a + count, 0);
    this.metrics.api.errorRate = errorRequests / totalRequests;
  }

  recordDatabaseMetric(queryTime: number) {
    this.metrics.database.queryTime.push(queryTime);
    if (queryTime > 1000) {
      this.metrics.database.slowQueries++;
    }
  }

  recordWebVital(vital: WebVitalsEntry) {
    this.metrics.frontend.webVitals[vital.name] = vital;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}
```

### Alerting System

```typescript
// Performance alerting
interface AlertConfig {
  thresholds: PerformanceThresholds;
  channels: NotificationChannel[];
  escalation: EscalationPolicy;
}

interface NotificationChannel {
  type: "email" | "slack" | "webhook" | "pagerduty";
  config: Record<string, any>;
}

interface EscalationPolicy {
  levels: AlertLevel[];
  autoEscalation: boolean;
  escalationTimes: number[]; // minutes
}

// Alerting implementation
class PerformanceAlerting {
  private config: AlertConfig;
  private alertHistory: Alert[] = [];

  constructor(config: AlertConfig) {
    this.config = config;
  }

  checkThresholds(metrics: PerformanceMetrics): Alert[] {
    const alerts: Alert[] = [];

    // Check API performance
    if (metrics.api.responseTime.length > 0) {
      const p95 = this.calculatePercentile(metrics.api.responseTime, 95);
      if (p95 > this.config.thresholds.api.responseTimeP95) {
        alerts.push({
          type: "PERFORMANCE_DEGRADATION",
          severity: "HIGH",
          metric: "api_response_time_p95",
          value: p95,
          threshold: this.config.thresholds.api.responseTimeP95,
          timestamp: new Date(),
        });
      }
    }

    // Check error rate
    if (metrics.api.errorRate > this.config.thresholds.api.errorRate) {
      alerts.push({
        type: "HIGH_ERROR_RATE",
        severity: "CRITICAL",
        metric: "api_error_rate",
        value: metrics.api.errorRate,
        threshold: this.config.thresholds.api.errorRate,
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  async sendAlert(alert: Alert): Promise<void> {
    for (const channel of this.config.channels) {
      switch (channel.type) {
        case "email":
          await this.sendEmailAlert(channel.config, alert);
          break;
        case "slack":
          await this.sendSlackAlert(channel.config, alert);
          break;
        case "webhook":
          await this.sendWebhookAlert(channel.config, alert);
          break;
      }
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }
}
```

## Phase 7: Performance Budgets

### Budget Configuration

```typescript
// Performance budgets
interface PerformanceBudgets {
  bundle: {
    maxSize: number; // bytes
    maxSize: number; // bytes
    maxIncremental: number; // bytes
  };
  webVitals: {
    firstContentfulPaint: number; // ms
    largestContentfulPaint: number; // ms
    cumulativeLayoutShift: number; // CLS score
    firstInputDelay: number; // ms
  };
  api: {
    responseTime: number; // ms
    throughput: number; // requests/minute
    errorRate: number; // percentage
  };
}

// Budget implementation
const performanceBudgets = {
  bundle: {
    maxSize: 500 * 1024, // 500KB
    maxIncremental: 10 * 1024, // 10KB
    maxChunks: 50, // maximum number of chunks
  },
  webVitals: {
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    cumulativeLayoutShift: 0.1, // CLS score
    firstInputDelay: 100, // 100ms
  },
  api: {
    responseTime: 200, // 200ms
    throughput: 1000, // 1000 req/min
    errorRate: 0.01, // 1%
  },
};
```

## Phase 8: File Generation

**Generate the following files:**

1. `apps/web/next.config.optimized.js` - Optimized Next.js configuration
2. `apps/web/utils/performance/monitoring.ts` - Performance monitoring utilities
3. `apps/web/utils/performance/caching.ts` - Caching utilities
4. `apps/web/utils/performance/metrics.ts` - Metrics collection
5. `apps/web/utils/performance/alerting.ts` - Alerting system
6. `scripts/performance-benchmarks.js` - Benchmarking scripts
7. `docs/performance-optimization.md` - Performance optimization guide
8. `monitoring/performance-dashboard.json` - Dashboard configuration

## Phase 9: Execution Protocol

**NOW execute the following:**

1. **Analyze Performance**: Check current performance metrics and bottlenecks
2. **Implement Optimizations**: Apply frontend, backend, and database optimizations
3. **Setup Monitoring**: Configure performance monitoring and alerting
4. **Establish Budgets**: Define performance budgets and thresholds
5. **Create Benchmarks**: Implement automated performance testing
6. **Generate Reports**: Create performance documentation and dashboards
7. **Validate Improvements**: Measure and validate optimization effectiveness

**Examples:**

```bash
/performance optimize frontend "bundle optimization" "code-splitting,lazy-loading"
/performance optimize backend "database optimization" "indexing,query-optimization"
/performance monitor setup "comprehensive" "web-vitals,api-metrics"
/performance benchmark api "load testing" "1000-concurrent-users"
/performance budget set "production" "bundle-size,web-vitals"
```

Execute performance optimization and monitoring setup now.
