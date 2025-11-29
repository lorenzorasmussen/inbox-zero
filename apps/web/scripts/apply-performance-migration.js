#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the migration SQL
const migrationPath = path.join(
  __dirname,
  '../prisma/migrations/20251129161415_performance_optimization/migration.sql'
);
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Applying Performance Optimization Migration...');
console.log('📄 Migration file:', migrationPath);

// Try to get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable not found');
  console.log('💡 Please ensure DATABASE_URL is set in your environment');
  process.exit(1);
}

try {
  // Apply migration using psql
  console.log('🔧 Executing migration...');
  const result = execSync(`psql "${databaseUrl}" -f "${migrationPath}"`, {
    stdio: 'inherit',
    encoding: 'utf8',
  });

  console.log('✅ Performance optimization migration applied successfully!');
  console.log('📊 Added indexes for:');
  console.log(
    '   • Email queries (user_id, email_account_id, thread_id, received_at)'
  );
  console.log('   • Rule queries (email_account_id, enabled, type)');
  console.log('   • Label queries (user_id, email_account_id)');
  console.log('   • Folder queries (user_id, email_account_id)');
  console.log('   • Session queries (user_id, expires)');
  console.log('   • Account queries (user_id)');
  console.log('   • Category queries (user_id, email_account_id)');
  console.log('   • AI queue queries (status, created_at, type)');
  console.log('   • Archive queue queries (status, created_at)');
  console.log('   • Partial indexes for common filters');
  console.log('   • Materialized view for email statistics');
  console.log('   • Performance monitoring setup');
  console.log('   • Table statistics updated');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('💡 You may need to install psql or check database connection');
  console.log(
    '💡 Alternative: Apply migration manually using your database tool'
  );
  process.exit(1);
}
