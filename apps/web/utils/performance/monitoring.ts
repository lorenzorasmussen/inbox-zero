/**
 * Performance monitoring utilities for Inbox Zero
 * Provides comprehensive performance tracking, metrics collection, and alerting
 */

import React from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
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

export interface WebVitalsMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunk: number;
}

export interface ResourceTimingMetrics {
  resourceCount: number;
  totalSize: number;
  cachedResources: number;
  slowResources: number;
}

export interface PerformanceThresholds {
  api: {
    responseTimeP95: number;
    responseTimeP99: number;
    errorRate: number;
    throughput: number;
  };
  database: {
    queryTime: number;
    connectionCount: number;
    slowQueries: number;
  };
  frontend: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
}

export interface Alert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  message?: string;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  config: Record<string, any>;
}

export interface EscalationPolicy {
  levels: AlertLevel[];
  autoEscalation: boolean;
  escalationTimes: number[]; // minutes
}

export interface AlertLevel {
  level: string;
  threshold: number;
  channels: string[];
}

// Performance thresholds
export const performanceThresholds: PerformanceThresholds = {
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
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    cumulativeLayoutShift: 0.1, // CLS score
    firstInputDelay: 100, // 100ms
  },
};

// Performance metrics collector
class PerformanceCollector {
  private metrics: PerformanceMetrics = {
    api: { responseTime: [], throughput: 0, errorRate: 0, statusCode: {} },
    database: { queryTime: [], connectionCount: 0, slowQueries: 0 },
    frontend: {
      webVitals: {},
      bundleSize: {
        totalSize: 0,
        gzippedSize: 0,
        chunkCount: 0,
        largestChunk: 0,
      },
      resourceTiming: {
        resourceCount: 0,
        totalSize: 0,
        cachedResources: 0,
        slowResources: 0,
      },
    },
    business: { conversionRate: 0, userSatisfaction: 0, featureUsage: {} },
  };

  private static instance: PerformanceCollector;

  private constructor() {}

  public static getInstance(): PerformanceCollector {
    if (!PerformanceCollector.instance) {
      PerformanceCollector.instance = new PerformanceCollector();
    }
    return PerformanceCollector.instance;
  }

  // API metrics
  recordApiMetric(
    responseTime: number,
    statusCode: number,
    endpoint?: string
  ): void {
    this.metrics.api.responseTime.push(responseTime);
    this.metrics.api.statusCode[statusCode] =
      (this.metrics.api.statusCode[statusCode] || 0) + 1;

    // Calculate error rate
    const totalRequests = Object.values(this.metrics.api.statusCode).reduce(
      (a, b) => a + b,
      0
    );
    const errorRequests = Object.entries(this.metrics.api.statusCode)
      .filter(([code]) => code >= 400)
      .reduce((a, [, count]) => a + count, 0);
    this.metrics.api.errorRate = errorRequests / totalRequests;

    // Send to monitoring service
    this.sendMetric('api_response_time', responseTime, {
      endpoint,
      statusCode,
    });
  }

  recordApiThroughput(requestsPerMinute: number): void {
    this.metrics.api.throughput = requestsPerMinute;
    this.sendMetric('api_throughput', requestsPerMinute);
  }

  // Database metrics
  recordDatabaseMetric(queryTime: number, queryType?: string): void {
    this.metrics.database.queryTime.push(queryTime);
    if (queryTime > performanceThresholds.database.slowQueries) {
      this.metrics.database.slowQueries++;
    }
    this.sendMetric('database_query_time', queryTime, { queryType });
  }

  recordDatabaseConnections(count: number): void {
    this.metrics.database.connectionCount = count;
    this.sendMetric('database_connections', count);
  }

  // Frontend metrics
  recordWebVital(vital: WebVitalsMetrics): void {
    Object.assign(this.metrics.frontend.webVitals, vital);

    // Send individual vitals
    Object.entries(vital).forEach(([name, value]) => {
      if (value !== undefined) {
        this.sendMetric(`web_vital_${name}`, value);
      }
    });
  }

  recordBundleMetrics(metrics: Partial<BundleMetrics>): void {
    this.metrics.frontend.bundleSize = {
      totalSize: metrics.totalSize || 0,
      gzippedSize: metrics.gzippedSize || 0,
      chunkCount: metrics.chunkCount || 0,
      largestChunk: metrics.largestChunk || 0,
    };
    this.sendMetric('bundle_size', this.metrics.frontend.bundleSize.totalSize, {
      gzippedSize: this.metrics.frontend.bundleSize.gzippedSize,
      chunkCount: this.metrics.frontend.bundleSize.chunkCount,
    });
  }

  recordResourceTiming(resource: PerformanceResourceTiming): void {
    const timing = resource.responseEnd - resource.requestStart;
    const size = resource.transferSize || 0;

    // Update resource timing metrics
    this.metrics.frontend.resourceTiming.resourceCount++;
    this.metrics.frontend.resourceTiming.totalSize += size;

    if (resource.transferSize === 0) {
      this.metrics.frontend.resourceTiming.cachedResources++;
    }

    if (timing > 2000) {
      // Slow resource threshold
      this.metrics.frontend.resourceTiming.slowResources++;
    }

    this.sendMetric('resource_timing', timing, {
      size,
      cached: resource.transferSize === 0,
      type: this.getResourceType(resource.name),
    });
  }

  // Business metrics
  recordConversion(event: string, value: number = 1): void {
    this.metrics.business.conversionRate += value;
    this.sendMetric('conversion', value, { event });
  }

  recordFeatureUsage(feature: string, usage: number = 1): void {
    this.metrics.business.featureUsage[feature] =
      (this.metrics.business.featureUsage[feature] || 0) + usage;
    this.sendMetric('feature_usage', usage, { feature });
  }

  recordUserSatisfaction(score: number): void {
    this.metrics.business.userSatisfaction = score;
    this.sendMetric('user_satisfaction', score);
  }

  // Metrics collection
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      api: { responseTime: [], throughput: 0, errorRate: 0, statusCode: {} },
      database: { queryTime: [], connectionCount: 0, slowQueries: 0 },
      frontend: {
        webVitals: {},
        bundleSize: {
          totalSize: 0,
          gzippedSize: 0,
          chunkCount: 0,
          largestChunk: 0,
        },
        resourceTiming: {
          resourceCount: 0,
          totalSize: 0,
          cachedResources: 0,
          slowResources: 0,
        },
      },
      business: { conversionRate: 0, userSatisfaction: 0, featureUsage: {} },
    };
  }

  // Private helper methods
  private sendMetric(
    name: string,
    value: number,
    tags?: Record<string, any>
  ): void {
    // Send to Axiom/PostHog/Sentry
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        value,
        custom_map: tags,
      });
    }

    // Also send to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, value, tags);
    }
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|css|woff2?|ttf|otf)$/)) return 'asset';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) return 'image';
    if (url.match(/\.(mp4|webm|mp3|wav)$/)) return 'media';
    return 'other';
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }

  // Performance analysis
  analyzePerformance(): Alert[] {
    const alerts: Alert[] = [];

    // API performance analysis
    if (this.metrics.api.responseTime.length > 0) {
      const p95 = this.calculatePercentile(this.metrics.api.responseTime, 95);
      if (p95 > performanceThresholds.api.responseTimeP95) {
        alerts.push({
          type: 'PERFORMANCE_DEGRADATION',
          severity: 'HIGH',
          metric: 'api_response_time_p95',
          value: p95,
          threshold: performanceThresholds.api.responseTimeP95,
          timestamp: new Date(),
          message: `API response time P95 (${p95}ms) exceeds threshold (${performanceThresholds.api.responseTimeP95}ms)`,
        });
      }
    }

    // Error rate analysis
    if (this.metrics.api.errorRate > performanceThresholds.api.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        severity: 'CRITICAL',
        metric: 'api_error_rate',
        value: this.metrics.api.errorRate,
        threshold: performanceThresholds.api.errorRate,
        timestamp: new Date(),
        message: `API error rate (${(this.metrics.api.errorRate * 100).toFixed(2)}%) exceeds threshold (${(performanceThresholds.api.errorRate * 100).toFixed(2)}%)`,
      });
    }

    // Database performance analysis
    if (this.metrics.database.queryTime.length > 0) {
      const avgQueryTime =
        this.metrics.database.queryTime.reduce((a, b) => a + b, 0) /
        this.metrics.database.queryTime.length;
      if (avgQueryTime > performanceThresholds.database.queryTime) {
        alerts.push({
          type: 'DATABASE_PERFORMANCE',
          severity: 'HIGH',
          metric: 'database_query_time_avg',
          value: avgQueryTime,
          threshold: performanceThresholds.database.queryTime,
          timestamp: new Date(),
          message: `Average database query time (${avgQueryTime.toFixed(2)}ms) exceeds threshold (${performanceThresholds.database.queryTime}ms)`,
        });
      }
    }

    // Slow queries analysis
    if (this.metrics.database.slowQueries > 0) {
      alerts.push({
        type: 'SLOW_QUERIES',
        severity: 'MEDIUM',
        metric: 'database_slow_queries',
        value: this.metrics.database.slowQueries,
        threshold: 0,
        timestamp: new Date(),
        message: `${this.metrics.database.slowQueries} slow database queries detected`,
      });
    }

    // Frontend performance analysis
    const vitals = this.metrics.frontend.webVitals;

    if (
      vitals.fcp &&
      vitals.fcp > performanceThresholds.frontend.firstContentfulPaint
    ) {
      alerts.push({
        type: 'FRONTEND_PERFORMANCE',
        severity: 'MEDIUM',
        metric: 'first_contentful_paint',
        value: vitals.fcp,
        threshold: performanceThresholds.frontend.firstContentfulPaint,
        timestamp: new Date(),
        message: `First Contentful Paint (${vitals.fcp}ms) exceeds threshold (${performanceThresholds.frontend.firstContentfulPaint}ms)`,
      });
    }

    if (
      vitals.lcp &&
      vitals.lcp > performanceThresholds.frontend.largestContentfulPaint
    ) {
      alerts.push({
        type: 'FRONTEND_PERFORMANCE',
        severity: 'MEDIUM',
        metric: 'largest_contentful_paint',
        value: vitals.lcp,
        threshold: performanceThresholds.frontend.largestContentfulPaint,
        timestamp: new Date(),
        message: `Largest Contentful Paint (${vitals.lcp}ms) exceeds threshold (${performanceThresholds.frontend.largestContentfulPaint}ms)`,
      });
    }

    if (
      vitals.cls &&
      vitals.cls > performanceThresholds.frontend.cumulativeLayoutShift
    ) {
      alerts.push({
        type: 'FRONTEND_PERFORMANCE',
        severity: 'MEDIUM',
        metric: 'cumulative_layout_shift',
        value: vitals.cls,
        threshold: performanceThresholds.frontend.cumulativeLayoutShift,
        timestamp: new Date(),
        message: `Cumulative Layout Shift (${vitals.cls}) exceeds threshold (${performanceThresholds.frontend.cumulativeLayoutShift})`,
      });
    }

    return alerts;
  }
}

// Web Vitals monitoring setup
export const setupWebVitalsMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  const observer = new (window as any).PerformanceObserver((list: any) => {
    for (const entry of list.getEntries()) {
      switch (entry.entryType) {
        case 'navigation':
          const navEntry = entry as PerformanceNavigationTiming;
          PerformanceCollector.getInstance().recordWebVital({
            fcp: navEntry.loadEventEnd - navEntry.fetchStart,
            lcp: 0, // Will be captured by LargestContentfulPaint
            ttfb: navEntry.responseStart - navEntry.fetchStart,
          });
          break;

        case 'paint':
          const paintEntry = entry as PerformancePaintTiming;
          if (paintEntry.name === 'first-contentful-paint') {
            PerformanceCollector.getInstance().recordWebVital({
              fcp: paintEntry.startTime,
            });
          }
          break;

        case 'largest-contentful-paint':
          const lcpEntry = entry as PerformancePaintTiming;
          PerformanceCollector.getInstance().recordWebVital({
            lcp: lcpEntry.startTime,
          });
          break;

        case 'layout-shift':
          const clsEntry = entry as any;
          PerformanceCollector.getInstance().recordWebVital({
            cls:
              (PerformanceCollector.getInstance().getMetrics().frontend
                .webVitals.cls || 0) + clsEntry.value,
          });
          break;

        case 'first-input':
          const fidEntry = entry as any;
          PerformanceCollector.getInstance().recordWebVital({
            fid: fidEntry.processingStart - fidEntry.startTime,
          });
          break;
      }
    }
  });

  // Observe all relevant entry types
  try {
    observer.observe({
      entryTypes: [
        'navigation',
        'paint',
        'largest-contentful-paint',
        'layout-shift',
        'first-input',
      ],
    });
  } catch (error) {
    console.warn('Performance monitoring not fully supported:', error);

    // Fallback to basic monitoring
    observer.observe({ entryTypes: ['navigation', 'paint'] });
  }
};

// Resource timing monitoring
export const setupResourceTimingMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  const observer = new (window as any).PerformanceObserver((list: any) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        PerformanceCollector.getInstance().recordResourceTiming(
          entry as PerformanceResourceTiming
        );
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.warn('Resource timing monitoring not supported:', error);
  }
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): void => {
  setupWebVitalsMonitoring();
  setupResourceTimingMonitoring();

  // Report metrics periodically
  setInterval(() => {
    const metrics = PerformanceCollector.getInstance().getMetrics();
    const alerts = PerformanceCollector.getInstance().analyzePerformance();

    // Send alerts if any
    if (alerts.length > 0) {
      alerts.forEach((alert) => {
        console.warn(`[Performance Alert] ${alert.type}:`, alert.message);

        // Send to monitoring service
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'performance_alert', {
            alert_type: alert.type,
            severity: alert.severity,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
          });
        }
      });
    }
  }, 30000); // Every 30 seconds
};

// Export singleton instance
export const performanceCollector = PerformanceCollector.getInstance();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    initializePerformanceMonitoring();

    return () => {
      // Cleanup if needed
    };
  }, []);
};

export default PerformanceCollector;
