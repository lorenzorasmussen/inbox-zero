/**
 * Performance benchmarking framework for Inbox Zero
 * Provides load testing, stress testing, and performance comparison
 */

import { performanceCollector, performanceThresholds } from './monitoring';

export interface BenchmarkConfig {
  load: {
    concurrentUsers: number;
    requestsPerSecond: number;
    duration: number; // seconds
    rampUpTime?: number; // seconds
  };
  stress: {
    maxLoad: number;
    rampUpTime: number;
    sustainTime: number;
    breakdownThreshold?: number; // error rate
  };
  comparison: {
    baselineMetrics: PerformanceMetrics;
    targetMetrics: PerformanceMetrics;
    improvementGoals: string[];
  };
}

export interface BenchmarkResult {
  config: BenchmarkConfig;
  metrics: PerformanceMetrics;
  duration: number;
  success: boolean;
  errors: string[];
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export interface PerformanceComparison {
  baseline: PerformanceMetrics;
  current: PerformanceMetrics;
  improvements: {
    metric: string;
    baseline: number;
    current: number;
    improvement: number;
    percentageChange: number;
  }[];
  regression: {
    metric: string;
    baseline: number;
    current: number;
    regression: number;
  }[];
}

// Benchmark implementation using k6
export class K6Benchmark {
  private config: BenchmarkConfig;

  constructor(config: BenchmarkConfig) {
    this.config = config;
  }

  async runLoadTest(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    
    try {
      // Generate k6 script
      const script = this.generateK6Script();
      
      // Run k6 process
      const { spawn } = require('child_process');
      const k6 = spawn('k6', ['run', '--out', 'json', '-'], {
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      // Write script to temporary file
      const fs = require('fs');
      const path = require('path');
      const scriptPath = path.join('/tmp', 'benchmark.js');
      fs.writeFileSync(scriptPath, script);

      // Run the benchmark
      k6.stdin.write(scriptPath);
      
      return new Promise((resolve, reject) => {
        let output = '';
        let result: BenchmarkResult;

        k6.stdout.on('data', (data) => {
          output += data;
        });

        k6.stderr.on('data', (data) => {
          console.error('k6 error:', data);
        });

        k6.on('close', (code) => {
          try {
            const k6Output = JSON.parse(output);
            result = this.parseK6Output(k6Output);
          } catch (error) {
            reject(new Error(`Failed to parse k6 output: ${error}`));
          }

          result.duration = Date.now() - startTime;
          resolve(result);
        });

        k6.on('error', (error) => {
          reject(new Error(`k6 process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Load test failed: ${error.message}`);
    }
  }

  async runStressTest(): Promise<BenchmarkResult> {
    const startTime = Date.now();
    
    try {
      const script = this.generateK6Script('stress');
      const { spawn } = require('child_process');
      const k6 = spawn('k6', ['run', '--out', 'json', '-'], {
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      const fs = require('fs');
      const path = require('path');
      const scriptPath = path.join('/tmp', 'stress-test.js');
      fs.writeFileSync(scriptPath, script);

      k6.stdin.write(scriptPath);

      return new Promise((resolve, reject) => {
        let output = '';
        let result: BenchmarkResult;

        k6.stdout.on('data', (data) => {
          output += data;
        });

        k6.stderr.on('data', (data) => {
          console.error('k6 error:', data);
        });

        k6.on('close', (code) => {
          try {
            const k6Output = JSON.parse(output);
            result = this.parseK6Output(k6Output);
          } catch (error) {
            reject(new Error(`Failed to parse k6 output: ${error}`));
          }

          result.duration = Date.now() - startTime;
          resolve(result);
        });

        k6.on('error', (error) => {
          reject(new Error(`k6 process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Stress test failed: ${error.message}`);
    }
  }

  private generateK6Script(type: 'load' | 'stress' = 'load'): string {
    const { load, stress } = this.config;
    
    if (type === 'stress') {
      return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: ${stress.maxLoad},
  duration: '${stress.sustainTime}s',
  rps: 50,
  thresholds: {
    http_req_duration: ['p(95)<${performanceThresholds.api.responseTimeP95}'],
    http_req_failed: ['rate<${(performanceThresholds.api.errorRate * 100).toFixed(2)}%'],
  },
};

export default function () {
  const responses = http.get('https://api.inboxzero.com/health', {
    timeout: '10s',
  });

  check(responses, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
      `;
    }

    return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: ${load.concurrentUsers},
  duration: '${load.duration}s',
  rps: ${load.requestsPerSecond},
  stages: [
    { duration: '30s', target: ${Math.floor(load.concurrentUsers * 0.2)}, rps: ${Math.floor(load.requestsPerSecond * 0.2)} },
    { duration: '30s', target: ${Math.floor(load.concurrentUsers * 0.4)}, rps: ${Math.floor(load.requestsPerSecond * 0.4)} },
    { duration: '30s', target: ${Math.floor(load.concurrentUsers * 0.6)}, rps: ${Math.floor(load.requestsPerSecond * 0.6)} },
    { duration: '30s', target: ${load.concurrentUsers}, rps: ${load.requestsPerSecond} },
  ],
  thresholds: {
    http_req_duration: ['p(95)<${performanceThresholds.api.responseTimeP95}'],
    http_req_failed: ['rate<${(performanceThresholds.api.errorRate * 100).toFixed(2)}%'],
  },
};

export default function () {
  const responses = http.get('https://api.inboxzero.com/health', {
    timeout: '10s',
  });

  check(responses, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
      `;
    }
  }

  private parseK6Output(k6Output: any): BenchmarkResult {
    const metrics = k6Output.metrics || {};
    
    return {
      config: this.config,
      metrics: {
        api: {
          responseTime: metrics.http_req_duration ? Object.values(metrics.http_req_duration) : [],
          throughput: metrics.http_reqs_per_second ? Object.values(metrics.http_reqs_per_second)[0] : 0,
          errorRate: metrics.http_req_failed ? Object.values(metrics.http_req_failed)[0] : 0,
          statusCode: {},
        },
        database: {
          queryTime: [],
          connectionCount: 0,
          slowQueries: 0,
        },
        frontend: {
          webVitals: {},
          bundleSize: { totalSize: 0, gzippedSize: 0, chunkCount: 0, largestChunk: 0 },
          resourceTiming: { resourceCount: 0, totalSize: 0, cachedResources: 0, slowResources: 0 },
        },
        business: {
          conversionRate: 0,
          userSatisfaction: 0,
          featureUsage: {},
        },
      },
      duration: 0,
      success: true,
      errors: [],
      summary: {
        totalRequests: metrics.http_reqs || 0,
        successfulRequests: metrics.http_req_passed || 0,
        failedRequests: metrics.http_req_failed || 0,
        averageResponseTime: metrics.http_req_duration ? 
          Object.values(metrics.http_req_duration).reduce((a, b) => a + b, 0) / Object.values(metrics.http_req_duration).length : 0,
        p95ResponseTime: metrics.http_req_duration ? 
          this.calculatePercentile(Object.values(metrics.http_req_duration), 95) : 0,
        p99ResponseTime: metrics.http_req_duration ? 
          this.calculatePercentile(Object.values(metrics.http_req_duration), 99) : 0,
        throughput: metrics.http_reqs_per_second ? Object.values(metrics.http_reqs_per_second)[0] : 0,
        errorRate: metrics.http_req_failed ? Object.values(metrics.http_req_failed)[0] : 0,
      },
    };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }
}

// Performance comparison
export class PerformanceComparison {
  static compare(
    baseline: PerformanceMetrics,
    current: PerformanceMetrics,
    goals: string[] = []
  ): PerformanceComparison {
    const improvements: this.calculateImprovements(baseline, current);
    const regressions = this.calculateRegressions(baseline, current);

    return {
      baseline,
      current,
      improvements,
      regressions,
    };
  }

  private static calculateImprovements(
    baseline: PerformanceMetrics,
    current: PerformanceMetrics
  ): PerformanceComparison['improvements'] {
    const improvements: PerformanceComparison['improvements'] = [];

    // API improvements
    if (baseline.api.responseTime.length > 0 && current.api.responseTime.length > 0) {
      const baselineAvg = baseline.api.responseTime.reduce((a, b) => a + b, 0) / baseline.api.responseTime.length;
      const currentAvg = current.api.responseTime.reduce((a, b) => a + b, 0) / current.api.responseTime.length;
      
      if (currentAvg < baselineAvg) {
        improvements.push({
          metric: 'api_response_time_avg',
          baseline: baselineAvg,
          current: currentAvg,
          improvement: baselineAvg - currentAvg,
          percentageChange: ((baselineAvg - currentAvg) / baselineAvg) * 100,
        });
      }
    }

    // Database improvements
    if (baseline.database.queryTime.length > 0 && current.database.queryTime.length > 0) {
      const baselineAvg = baseline.database.queryTime.reduce((a, b) => a + b, 0) / baseline.database.queryTime.length;
      const currentAvg = current.database.queryTime.reduce((a, b) => a + b, 0) / current.database.queryTime.length;
      
      if (currentAvg < baselineAvg) {
        improvements.push({
          metric: 'database_query_time_avg',
          baseline: baselineAvg,
          current: currentAvg,
          improvement: baselineAvg - currentAvg,
          percentageChange: ((baselineAvg - currentAvg) / baselineAvg) * 100,
        });
      }
    }

    return improvements;
  }

  private static calculateRegressions(
    baseline: PerformanceMetrics,
    current: PerformanceMetrics
  ): PerformanceComparison['regressions'] {
    const regressions: PerformanceComparison['regressions'] = [];

    // API regressions
    if (baseline.api.responseTime.length > 0 && current.api.responseTime.length > 0) {
      const baselineAvg = baseline.api.responseTime.reduce((a, b) => a + b, 0) / baseline.api.responseTime.length;
      const currentAvg = current.api.responseTime.reduce((a, b) => a + b, 0) / current.api.responseTime.length;
      
      if (currentAvg > baselineAvg * 1.1) { // 10% regression threshold
        regressions.push({
          metric: 'api_response_time_avg',
          baseline: baselineAvg,
          current: currentAvg,
          regression: currentAvg - baselineAvg,
        });
      }
    }

    return regressions;
  }
}

// Benchmark configurations
export const benchmarkConfigs = {
  development: {
    load: {
      concurrentUsers: 10,
      requestsPerSecond: 50,
      duration: 60, // 1 minute
    },
    stress: {
      maxLoad: 100,
      rampUpTime: 60,
      sustainTime: 300, // 5 minutes
      breakdownThreshold: 0.05, // 5%
    },
  },
  production: {
    load: {
      concurrentUsers: 1000,
      requestsPerSecond: 500,
      duration: 300, // 5 minutes
    },
    stress: {
      maxLoad: 5000,
      rampUpTime: 300,
      sustainTime: 600, // 10 minutes
      breakdownThreshold: 0.01, // 1%
    },
  },
};

// Benchmark runner
export class BenchmarkRunner {
  static async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    const benchmark = new K6Benchmark(config);
    
    if (config.load) {
      return await benchmark.runLoadTest();
    } else if (config.stress) {
      return await benchmark.runStressTest();
    } else {
      throw new Error('Invalid benchmark configuration');
    }
  }

  static async runComparison(
    baseline: PerformanceMetrics,
    current: PerformanceMetrics
  ): Promise<PerformanceComparison> {
    return PerformanceComparison.compare(baseline, current);
  }
}

export default {
  K6Benchmark,
  PerformanceComparison,
  BenchmarkRunner,
  benchmarkConfigs,
};