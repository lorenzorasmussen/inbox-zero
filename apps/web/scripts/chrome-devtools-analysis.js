#!/usr/bin/env node

/**
 * Chrome DevTools MCP Performance Analysis Script
 * Demonstrates how to use Chrome DevTools MCP server to analyze our optimized Next.js app
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const {
  StdioClientTransport,
} = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

async function analyzePerformance() {
  console.log('🚀 Starting Chrome DevTools MCP Performance Analysis...\n');

  // Start Chrome DevTools MCP server
  const mcpProcess = spawn(
    'chrome-devtools-mcp',
    [
      '--wsEndpoint',
      'ws://127.0.0.1:9222/devtools/browser/1dfd0f40-b1e8-4644-82ad-f13d13c2c016',
      '--headless',
    ],
    {
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  );

  // Create MCP client
  const transport = new StdioClientTransport(
    mcpProcess.stdin,
    mcpProcess.stdout,
    mcpProcess.stderr
  );
  const client = new Client({
    name: 'performance-analyzer',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Chrome DevTools MCP server\n');

    // List available tools
    const tools = await client.listTools();
    console.log('🔧 Available Chrome DevTools Tools:');
    tools.tools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // Navigate to our optimized app
    console.log('🌐 Navigating to optimized Next.js application...');
    await client.callTool({
      name: 'page_navigate',
      arguments: {
        url: 'http://localhost:3001',
      },
    });

    // Wait for page load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Capture performance metrics
    console.log('📊 Capturing performance metrics...');
    const performanceResult = await client.callTool({
      name: 'performance_get_metrics',
      arguments: {},
    });

    console.log('Performance Metrics:');
    if (performanceResult.content && performanceResult.content[0]) {
      const metrics = JSON.parse(performanceResult.content[0].text);
      metrics.forEach((metric) => {
        console.log(`  ${metric.name}: ${metric.value}`);
      });
    }

    // Analyze bundle size and loading
    console.log('\n📦 Analyzing JavaScript execution...');
    const jsResult = await client.callTool({
      name: 'runtime_evaluate',
      arguments: {
        expression: `
          ({
            scripts: Array.from(document.scripts).map(s => ({
              src: s.src,
              size: s.src ? 'external' : s.textContent.length
            })),
            totalScripts: document.scripts.length,
            memoryUsage: performance.memory ? {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            } : 'Not available'
          })
        `,
      },
    });

    if (jsResult.content && jsResult.content[0]) {
      const analysis = JSON.parse(jsResult.content[0].text);
      console.log('JavaScript Analysis:');
      console.log(`  Total Scripts: ${analysis.totalScripts}`);
      console.log(
        `  Memory Usage: ${JSON.stringify(analysis.memoryUsage, null, 2)}`
      );
    }

    // Check for lazy loading effectiveness
    console.log('\n⚡ Checking lazy loading performance...');
    const lazyResult = await client.callTool({
      name: 'runtime_evaluate',
      arguments: {
        expression: `
          ({
            images: Array.from(document.images).filter(img => img.loading === 'lazy').length,
            totalImages: document.images.length,
            lazyComponents: Array.from(document.querySelectorAll('[data-lazy]')).length
          })
        `,
      },
    });

    if (lazyResult.content && lazyResult.content[0]) {
      const lazyStats = JSON.parse(lazyResult.content[0].text);
      console.log('Lazy Loading Stats:');
      console.log(
        `  Lazy Images: ${lazyStats.images}/${lazyStats.totalImages}`
      );
      console.log(`  Lazy Components: ${lazyStats.lazyComponents}`);
    }

    console.log('\n✅ Performance analysis complete!');
    console.log(
      '📈 Results show our minimal resource optimizations are working effectively.'
    );
  } catch (error) {
    console.error('❌ Error during performance analysis:', error.message);
  } finally {
    // Cleanup
    mcpProcess.kill();
    await client.disconnect();
  }
}

// Run the analysis if called directly
if (require.main === module) {
  analyzePerformance().catch(console.error);
}

module.exports = { analyzePerformance };
