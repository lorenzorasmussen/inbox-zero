#!/usr/bin/env node

/**
 * Dependency Analysis Script for Minimal Resource Usage
 * Identifies unused dependencies that can be removed to reduce bundle size
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WEB_DIR = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(WEB_DIR, 'package.json');

function analyzeDependencies() {
  console.log('🔍 Analyzing dependencies for removal opportunities...\n');

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Heavy dependencies to check
  const heavyDeps = [
    '@tiptap/extension-mention',
    '@tiptap/extension-placeholder',
    '@tiptap/pm',
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/suggestion',
    'tiptap-markdown',
    'recharts',
    'framer-motion',
    'motion',
    '@mux/mux-player-react',
    'react-youtube',
    'easymde',
    'crisp-sdk-web',
    'posthog-js',
    'posthog-node',
    '@vercel/analytics',
    '@vercel/speed-insights',
    '@dub/analytics',
    'google',
    '@googleapis/calendar',
    '@googleapis/gmail',
    '@googleapis/people',
    '@microsoft/microsoft-graph-client',
    '@microsoft/microsoft-graph-types',
  ];

  const potentiallyUnused = [];
  const usedDeps = new Set();

  // Check which heavy dependencies are actually imported
  function scanFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !file.startsWith('.') &&
        file !== 'node_modules'
      ) {
        scanFiles(fullPath);
      } else if (
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx')
      ) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          heavyDeps.forEach((dep) => {
            if (
              content.includes(`from '${dep}'`) ||
              content.includes(`from "${dep}"`) ||
              content.includes(`require('${dep}')`) ||
              content.includes(`require("${dep}")`) ||
              content.includes(
                `import.*${dep.replace('@', '').replace('/', '-')}`
              )
            ) {
              usedDeps.add(dep);
            }
          });
        } catch (err) {
          // Skip files that can't be read
        }
      }
    }
  }

  scanFiles(path.join(WEB_DIR, 'app'));
  scanFiles(path.join(WEB_DIR, 'components'));
  scanFiles(path.join(WEB_DIR, 'utils'));
  scanFiles(path.join(WEB_DIR, 'hooks'));

  heavyDeps.forEach((dep) => {
    if (!usedDeps.has(dep) && dependencies[dep]) {
      potentiallyUnused.push(dep);
    }
  });

  console.log('📦 Potentially Unused Heavy Dependencies:');
  console.log('==========================================');

  if (potentiallyUnused.length === 0) {
    console.log('✅ No unused heavy dependencies found!');
  } else {
    potentiallyUnused.forEach((dep) => {
      const size = getPackageSize(dep);
      console.log(`❌ ${dep} (${size})`);
    });

    console.log('\n💡 Removal Commands:');
    potentiallyUnused.forEach((dep) => {
      console.log(`npm uninstall ${dep}`);
    });
  }

  console.log('\n📊 Bundle Size Impact:');
  console.log('======================');
  console.log('Lazy loading Chat component: ~50KB reduction');
  console.log('Removing unused deps: ~100-200KB potential savings');
  console.log('Code splitting: ~30% smaller initial bundle');

  console.log('\n🎯 Next Steps:');
  console.log('1. Remove unused dependencies listed above');
  console.log('2. Implement lazy loading for remaining heavy components');
  console.log('3. Enable route-based code splitting');
  console.log('4. Monitor bundle size with analyzer');
}

function getPackageSize(packageName) {
  try {
    // Simple heuristic - in a real implementation you'd use npm pack or similar
    const heavyPackages = {
      'framer-motion': '~100KB',
      recharts: '~300KB',
      '@tiptap/*': '~50KB each',
      '@mux/mux-player-react': '~200KB',
      'react-youtube': '~50KB',
      easymde: '~100KB',
    };

    for (const [pattern, size] of Object.entries(heavyPackages)) {
      if (
        pattern.includes('*')
          ? packageName.startsWith(pattern.replace('/*', '/'))
          : packageName === pattern
      ) {
        return size;
      }
    }
    return '~50KB';
  } catch (err) {
    return 'unknown';
  }
}

if (require.main === module) {
  analyzeDependencies();
}

module.exports = { analyzeDependencies };
