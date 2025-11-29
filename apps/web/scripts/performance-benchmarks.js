/**
 * Performance benchmarking script for Inbox Zero
 * Runs load tests and stress tests using k6
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Benchmark configuration
const config = {
  targetUrl: process.env.BENCHMARK_TARGET_URL || 'https://api.inboxzero.com/health',
  loadTest: {
    vus: 100, // virtual users
    duration: '5m', // 5 minutes
    stages: [
      { duration: '1m', target: 50 },
      { duration: '1m', target: 75 },
      { duration: '1m', target: 100 },
      { duration: '2m', target: 100 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<200'],
      http_req_failed: ['rate<1%'],
    },
  },
  stressTest: {
    vus: 500,
    duration: '10m',
    stages: [
      { duration: '2m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '2m', target: 400 },
      { duration: '2m', target: 500 },
      { duration: '2m', target: 600 },
      { duration: '2m', target: 800 },
      { duration: '2m', target: 1000 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<2%'],
    },
  },
};

// Generate k6 script
const generateK6Script = (testType: 'load' | 'stress'): string => {
  const testConfig = testType === 'load' ? config.loadTest : config.stressTest;
  
  return `
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: ${testConfig.vus},
  duration: '${testConfig.duration}',
  thresholds: ${JSON.stringify(testConfig.thresholds)},
};

export default function () {
  const responses = http.get('${config.targetUrl}', {
    timeout: '10s',
  });

  check(responses, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
  `;
};

// Run benchmark
const runBenchmark = async (testType: 'load' | 'stress'): Promise<void> => {
  console.log(`Starting ${testType} test...`);
  
  const script = generateK6Script(testType);
  const scriptPath = path.join(__dirname, 'benchmark.js');
  
  // Write script to file
  fs.writeFileSync(scriptPath, script);
  
  // Run k6
  return new Promise((resolve, reject) => {
    const k6 = spawn('k6', ['run', scriptPath], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    let output = '';
    let hasError = false;

    k6.stdout.on('data', (data) => {
      output += data;
    });

    k6.stderr.on('data', (data) => {
      console.error('k6 error:', data);
      hasError = true;
    });

    k6.on('close', (code) => {
      if (hasError) {
        reject(new Error(`Benchmark failed with code ${code}`));
      } else {
        console.log(`${testType} test completed successfully`);
        console.log('Output:', output);
        resolve();
      }
    });

    k6.on('error', (error) => {
      reject(new Error(`k6 process error: ${error.message}`));
    });
  });
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'load':
      runBenchmark('load').catch(console.error);
      break;
    case 'stress':
      runBenchmark('stress').catch(console.error);
      break;
    case 'both':
      await runBenchmark('load');
      await runBenchmark('stress');
      break;
    default:
      console.log('Usage: node benchmark.js [load|stress|both]');
      process.exit(1);
  }
}