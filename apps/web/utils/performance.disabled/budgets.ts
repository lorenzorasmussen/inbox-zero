/**
 * Performance budgets and thresholds for Inbox Zero
 * Defines performance budgets and validation rules
 */

export interface PerformanceBudget {
  bundle: {
    maxSize: number; // bytes
    maxChunkSize: number; // bytes
    maxIncremental: number; // bytes
    maxChunks: number;
  };
  webVitals: {
    firstContentfulPaint: number; // ms
    largestContentfulPaint: number; // ms
    cumulativeLayoutShift: number; // CLS score
    firstInputDelay: number; // ms
    timeToFirstByte: number; // ms
  };
  api: {
    responseTime: number; // ms
    throughput: number; // requests/minute
    errorRate: number; // percentage
  };
  database: {
    queryTime: number; // ms
    connectionCount: number;
    slowQueries: number; // ms threshold
  };
}

export interface BudgetValidation {
  budget: PerformanceBudget;
  actual: PerformanceMetrics;
  violations: BudgetViolation[];
  passed: boolean;
  score: number; // 0-100
}

export interface BudgetViolation {
  type: 'bundle' | 'web-vital' | 'api' | 'database';
  metric: string;
  budget: number;
  actual: number;
  percentageOver: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

// Performance budgets for different environments
export const performanceBudgets: Record<string, PerformanceBudget> = {
  development: {
    bundle: {
      maxSize: 1024 * 1024, // 1MB
      maxChunkSize: 512 * 1024, // 512KB
      maxIncremental: 50 * 1024, // 50KB
      maxChunks: 20,
    },
    webVitals: {
      firstContentfulPaint: 2000, // 2s
      largestContentfulPaint: 3000, // 3s
      cumulativeLayoutShift: 0.25, // CLS score
      firstInputDelay: 200, // 200ms
      timeToFirstByte: 800, // 800ms
    },
    api: {
      responseTime: 300, // 300ms
      throughput: 500, // 500 req/min
      errorRate: 0.02, // 2%
    },
    database: {
      queryTime: 100, // 100ms
      connectionCount: 50, // max connections
      slowQueries: 2000, // 2s
    },
  },
  staging: {
    bundle: {
      maxSize: 750 * 1024, // 750KB
      maxChunkSize: 256 * 1024, // 256KB
      maxIncremental: 25 * 1024, // 25KB
      maxChunks: 15,
    },
    webVitals: {
      firstContentfulPaint: 1500, // 1.5s
      largestContentfulPaint: 2500, // 2.5s
      cumulativeLayoutShift: 0.1, // CLS score
      firstInputDelay: 150, // 150ms
      timeToFirstByte: 600, // 600ms
    },
    api: {
      responseTime: 200, // 200ms
      throughput: 800, // 800 req/min
      errorRate: 0.01, // 1%
    },
    database: {
      queryTime: 50, // 50ms
      connectionCount: 100, // max connections
      slowQueries: 1000, // 1s
    },
  },
  production: {
    bundle: {
      maxSize: 500 * 1024, // 500KB
      maxChunkSize: 128 * 1024, // 128KB
      maxIncremental: 10 * 1024, // 10KB
      maxChunks: 10,
    },
    webVitals: {
      firstContentfulPaint: 1200, // 1.2s
      largestContentfulPaint: 2000, // 2s
      cumulativeLayoutShift: 0.1, // CLS score
      firstInputDelay: 100, // 100ms
      timeToFirstByte: 400, // 400ms
    },
    api: {
      responseTime: 150, // 150ms
      throughput: 1000, // 1000 req/min
      errorRate: 0.005, // 0.5%
    },
    database: {
      queryTime: 30, // 30ms
      connectionCount: 200, // max connections
      slowQueries: 500, // 500ms
    },
  },
};

// Budget validation
export class BudgetValidator {
  static validate(
    budget: PerformanceBudget,
    actual: PerformanceMetrics
  ): BudgetValidation {
    const violations: BudgetViolation[] = [];

    // Bundle validation
    if (actual.frontend.bundleSize.totalSize) {
      const bundleViolation = BudgetValidator.validateMetric(
        'bundle',
        'totalSize',
        budget.bundle.maxSize,
        actual.frontend.bundleSize.totalSize,
        budget.bundle.maxSize
      );
      if (bundleViolation) violations.push(bundleViolation);

      if (
        actual.frontend.bundleSize.largestChunk > budget.bundle.maxChunkSize
      ) {
        const chunkViolation = BudgetValidator.validateMetric(
          'bundle',
          'maxChunkSize',
          budget.bundle.maxChunkSize,
          actual.frontend.bundleSize.largestChunk
        );
        if (chunkViolation) violations.push(chunkViolation);
      }
    }

    // Web Vitals validation
    const vitals = actual.frontend.webVitals;

    if (vitals.fcp && vitals.fcp > budget.webVitals.firstContentfulPaint) {
      violations.push(
        BudgetValidator.validateMetric(
          'web-vital',
          'firstContentfulPaint',
          budget.webVitals.firstContentfulPaint,
          vitals.fcp
        )
      );
    }

    if (vitals.lcp && vitals.lcp > budget.webVitals.largestContentfulPaint) {
      violations.push(
        BudgetValidator.validateMetric(
          'web-vital',
          'largestContentfulPaint',
          budget.webVitals.largestContentfulPaint,
          vitals.lcp
        )
      );
    }

    if (vitals.cls && vitals.cls > budget.webVitals.cumulativeLayoutShift) {
      violations.push(
        BudgetValidator.validateMetric(
          'web-vital',
          'cumulativeLayoutShift',
          budget.webVitals.cumulativeLayoutShift,
          vitals.cls
        )
      );
    }

    if (vitals.fid && vitals.fid > budget.webVitals.firstInputDelay) {
      violations.push(
        BudgetValidator.validateMetric(
          'web-vital',
          'firstInputDelay',
          budget.webVitals.firstInputDelay,
          vitals.fid
        )
      );
    }

    // API validation
    if (actual.api.responseTime.length > 0) {
      const avgResponseTime =
        actual.api.responseTime.reduce((a, b) => a + b, 0) /
        actual.api.responseTime.length;

      if (avgResponseTime > budget.api.responseTime) {
        violations.push(
          BudgetValidator.validateMetric(
            'api',
            'responseTime',
            budget.api.responseTime,
            avgResponseTime
          )
        );
      }
    }

    if (actual.api.errorRate > budget.api.errorRate) {
      violations.push(
        BudgetValidator.validateMetric(
          'api',
          'errorRate',
          budget.api.errorRate,
          actual.api.errorRate
        )
      );
    }

    // Database validation
    if (actual.database.queryTime.length > 0) {
      const avgQueryTime =
        actual.database.queryTime.reduce((a, b) => a + b, 0) /
        actual.database.queryTime.length;

      if (avgQueryTime > budget.database.queryTime) {
        violations.push(
          BudgetValidator.validateMetric(
            'database',
            'queryTime',
            budget.database.queryTime,
            avgQueryTime
          )
        );
      }
    }

    // Calculate score
    const score = BudgetValidator.calculateBudgetScore(violations, budget);

    return {
      budget,
      actual,
      violations,
      passed: violations.length === 0,
      score,
    };
  }

  private static validateMetric(
    type: BudgetViolation['type'],
    metric: string,
    budget: number,
    actual: number
  ): BudgetViolation | null {
    const percentageOver = ((actual - budget) / budget) * 100;

    if (percentageOver <= 0) return null;

    const severity = BudgetValidator.getViolationSeverity(percentageOver);

    return {
      type,
      metric,
      budget,
      actual,
      percentageOver,
      severity,
      recommendation: BudgetValidator.getRecommendation(
        type,
        metric,
        percentageOver
      ),
    };
  }

  private static getViolationSeverity(
    percentageOver: number
  ): BudgetViolation['severity'] {
    if (percentageOver >= 50) return 'CRITICAL';
    if (percentageOver >= 25) return 'HIGH';
    if (percentageOver >= 10) return 'MEDIUM';
    return 'LOW';
  }

  private static getRecommendation(
    type: BudgetViolation['type'],
    metric: string,
    percentageOver: number
  ): string {
    switch (type) {
      case 'bundle':
        if (metric === 'totalSize') {
          return `Bundle size is ${percentageOver.toFixed(1)}% over budget. Consider code splitting, tree shaking, or removing unused dependencies.`;
        }
        if (metric === 'maxChunkSize') {
          return `Largest chunk is ${percentageOver.toFixed(1)}% over budget. Consider splitting large components or implementing lazy loading.`;
        }
        break;
      case 'web-vital':
        if (metric === 'firstContentfulPaint') {
          return `FCP is ${percentageOver.toFixed(1)}% over budget. Optimize server response time, reduce render-blocking resources, or implement lazy loading.`;
        }
        if (metric === 'largestContentfulPaint') {
          return `LCP is ${percentageOver.toFixed(1)}% over budget. Optimize image loading, reduce JavaScript execution time, or improve critical rendering path.`;
        }
        break;
      case 'api':
        if (metric === 'responseTime') {
          return `API response time is ${percentageOver.toFixed(1)}% over budget. Optimize database queries, add caching, or implement request batching.`;
        }
        if (metric === 'errorRate') {
          return `Error rate is ${percentageOver.toFixed(1)}% over budget. Improve error handling, add input validation, or fix underlying issues.`;
        }
        break;
      case 'database':
        if (metric === 'queryTime') {
          return `Database query time is ${percentageOver.toFixed(1)}% over budget. Add proper indexes, optimize queries, or implement query result caching.`;
        }
        break;
      default:
        return `${metric} is ${percentageOver.toFixed(1)}% over budget. Review and optimize the implementation.`;
    }
  }

  private static calculateBudgetScore(
    violations: BudgetViolation[],
    budget: PerformanceBudget
  ): number {
    if (violations.length === 0) return 100;

    let score = 100;

    // Deduct points for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case 'CRITICAL':
          score -= 25;
          break;
        case 'HIGH':
          score -= 15;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
        case 'LOW':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }
}

// Budget enforcement
export class BudgetEnforcer {
  static enforceBudgets(
    budget: PerformanceBudget,
    actual: PerformanceMetrics
  ): { passed: boolean; violations: BudgetViolation[] } {
    const validation = BudgetValidator.validate(budget, actual);

    // Log violations
    if (validation.violations.length > 0) {
      console.warn('Performance budget violations:', validation.violations);

      // Send alerts for critical violations
      const criticalViolations = validation.violations.filter(
        (v) => v.severity === 'CRITICAL'
      );
      if (criticalViolations.length > 0) {
        // Trigger build failure in CI
        if (process.env.CI) {
          process.exit(1);
        }
      }
    }

    return validation;
  }
}

// Performance budget hooks
export const usePerformanceBudget = (
  environment: keyof typeof performanceBudgets = 'development'
) => {
  return React.useMemo(() => performanceBudgets[environment], [environment]);
};

export const validatePerformanceBudgets = (
  environment: keyof typeof performanceBudgets,
  metrics: PerformanceMetrics
): BudgetValidation => {
  const budget = performanceBudgets[environment];
  return BudgetValidator.validate(budget, metrics);
};

export default {
  performanceBudgets,
  BudgetValidator,
  BudgetEnforcer,
  usePerformanceBudget,
  validatePerformanceBudgets,
};
