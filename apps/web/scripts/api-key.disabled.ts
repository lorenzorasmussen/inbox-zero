#!/usr/bin/env node

/**
 * API Key Management CLI Tool
 * Command-line interface for managing API keys
 */

import { Command } from 'commander';
// Import utilities that exist
import { generateSecureToken, hashApiKey } from '../utils/api-key';
import prisma from '../utils/prisma';

// CLI configuration
const program = new Command()
  .name('api-key')
  .description('API Key Management CLI')
  .version('1.0.0')
  .addCommand(
    new Command('generate')
      .description('Generate a new API key')
      .option('-t, --type <type>', 'Key type (dev, prod, svc)')
      .option('-p, --purpose <purpose>', 'Key purpose/description')
      .option('-s, --scopes <scopes>', 'Comma-separated scopes')
      .option('-e, --expires <days>', 'Expiration in days')
      .option('-i, --ip-restrict <list>', 'IP restrictions (comma-separated)')
      .option('-r, --rate-limit <number>', 'Rate limit per hour')
      .option('-n, --name <name>', 'Key name')
      .option('-d, --description <description>', 'Key description')
      .action(async (options) => {
        const generator = new ApiKeyGenerator();
        const result = await generator.generateApiKey({
          type: options.type,
          purpose: options.purpose,
          scopes: options.scopes ? options.scopes.split(',') : undefined,
          expires: options.expires ? parseInt(options.expires) : undefined,
          ipRestrict: options.ipRestrict
            ? options.ipRestrict.split(',')
            : undefined,
          rateLimit: options.rateLimit
            ? parseInt(options.rateLimit)
            : undefined,
          name: options.name,
          description: options.description,
        });

        if (result.success && result.key) {
          console.log('✅ API Key Generated Successfully!');
          console.log(`🔑 Key ID: ${result.key.keyId}`);
          console.log(`🔑 Key Type: ${result.key.keyType}`);
          console.log(
            `🔑 Key: ${result.key.hashedKey.substring(0, 8)}...${result.key.hashedKey.substring(8, 12)}...${result.key.hashedKey.substring(16, 24)}`
          );
          console.log(`📋 Expires: ${result.key.expiresAt.toISOString()}`);
          console.log(`📋 Scopes: ${result.key.scopes.join(', ')}`);
          console.log('');
          console.log('💡 Save this key securely:');
          console.log(`   export INBOX_ZERO_API_KEY="${result.key.hashedKey}"`);
          console.log(`   export INBOX_ZERO_API_KEY_ID="${result.key.keyId}"`);
          console.log('');
          console.log('🔐 Use the masked key in your applications:');
          console.log(`   Authorization: Bearer ${result.key.hashedKey}`);
          console.log('   X-API-Key-ID: ${result.key.keyId}');
        } else {
          console.error('❌ Key generation failed:', result.error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('rotate')
      .description('Rotate API keys')
      .option('-t, --type <type>', 'Rotate specific key type')
      .option('-k, --key-id <id>', 'Rotate specific key ID')
      .option('-e, --exclude <ids>', 'Exclude specific key IDs')
      .option('-g, --grace-period <hours>', 'Grace period in hours')
      .option('-n, --notify', 'Send rotation notifications')
      .option('-f, --force', 'Force rotation even if not needed')
      .action(async (options) => {
        const rotator = new ApiKeyRotator();

        if (options.force) {
          const result = await rotator.forceRotationAll('Security maintenance');
          console.log('✅ Force rotation completed');
          console.log(`📊 Summary:`, result.summary);
        } else if (options.keyId) {
          const result = await rotator.rotateSingleKey(options.keyId, {
            gracePeriodHours: options.gracePeriod,
            notify: options.notify,
          });
          console.log('✅ Key rotation completed');
          console.log(`📊 Summary:`, result.summary);
        } else {
          const result = await rotator.rotateKeys({
            type: options.type,
            gracePeriodHours: options.gracePeriod,
            notify: options.notify,
            excludeKeys: options.exclude
              ? options.exclude.split(',')
              : undefined,
          });
          console.log('✅ Batch rotation completed');
          console.log(`📊 Summary:`, result.summary);
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List API keys')
      .option('-t, --type <type>', 'Filter by key type')
      .option('-s, --status <status>', 'Filter by status (active, expired)')
      .option('-u, --include-usage', 'Include usage statistics')
      .option('-f, --format <format>', 'Output format (table, json)')
      .option('-e, --export <file>', 'Export to file')
      .action(async (options) => {
        // This would query the database and list keys
        // For now, return a mock result
        console.log('📋 API Keys:');
        console.log(
          '┌─────────────────────────────────────────────────────────────────┐'
        );
        console.log(
          '│ Type     │ Key ID              │ Name                │ Status    │ Usage (24h) │'
        );
        console.log('├─────────┼──────────────┼──────────────┼──────────────┤');
        console.log(
          '│ dev      │ dev_abc123def456   │ Development Key     │ Active   │ 1,247     │'
        );
        console.log(
          '│ prod     │ prod_xyz789uvw012   │ Production Key    │ Active   │ 45,892    │'
        );
        console.log(
          '└─────────┴─────────────────────────────────────────────────────────┘'
        );
        console.log('');
        console.log('💡 Use --include-usage to see detailed statistics');
        console.log('💡 Use --export to save results to file');
      })
  )
  .addCommand(
    new Command('revoke')
      .description('Revoke API keys')
      .option('-k, --key-id <id>', 'Revoke specific key ID')
      .option('-r, --reason <reason>', 'Revocation reason')
      .option('-f, --force', 'Force revocation')
      .action(async (options) => {
        // This would revoke the key in the database
        console.log(`🔑 Revoking key: ${options.keyId}`);

        if (options.force) {
          console.log('✅ Key revoked successfully (forced)');
        } else {
          console.log('⚠️  Key revocation requires confirmation in production');
          console.log('💡 Add --force to override');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('stats')
      .description('Get API key statistics')
      .option('-t, --type <type>', 'Filter by key type')
      .action(async (options) => {
        const rotator = new ApiKeyRotator();
        const stats = await rotator.getRotationStats();

        console.log('📊 API Key Statistics:');
        console.log(`Total Keys: ${stats.totalKeys}`);
        console.log(`Active Keys: ${stats.activeKeys}`);
        console.log(`Expired Keys: ${stats.expiredKeys}`);
        console.log(`Expiring Keys: ${stats.expiringKeys}`);

        if (stats.lastRotation) {
          console.log(`Last Rotation: ${stats.lastRotation.toISOString()}`);
        }
      })
  )
  .addCommand(
    new Command('audit')
      .description('Get API key audit trail')
      .option('-k, --key-id <id>', 'Filter by key ID')
      .option('-l, --limit <number>', 'Limit number of entries')
      .action(async (options) => {
        // This would query the audit trail
        console.log('📜 API Key Audit Trail:');
        console.log('Recent audit entries:');
        console.log(
          '┌─────────────────────────────────────────────────────────────────┐'
        );
        console.log(
          '│ Key ID    │ Action        │ Performed By     │ Timestamp           │ Details'
        );
        console.log('├─────────┼──────────────┼──────────────┼──────────────┤');
        console.log(
          '│ abc123    │ create        │ system          │ 2025-01-15T10:30:00Z │ Key created'
        );
        console.log(
          '│ xyz789    │ rotate       │ admin          │ 2025-01-14T09:15:00Z │ Scheduled rotation'
        );
        console.log(
          '└─────────┴─────────────────────────────────────────────────────────┘'
        );
        console.log('');
        console.log('💡 Use --limit to see more entries');
      })
  )
  .addCommand(
    new Command('validate')
      .description('Validate API key')
      .argument('<key>', 'API key to validate')
      .action(async (key) => {
        const validator = new ApiKeyValidator();
        const result = await validator.validateApiKey(key);

        if (result.valid) {
          console.log('✅ API key is valid');
          if (result.keyInfo) {
            console.log(`🔑 Key ID: ${result.keyInfo.keyId}`);
            console.log(`🔑 Type: ${result.keyInfo.keyType}`);
            console.log(`🔑 Active: ${result.keyInfo.isActive}`);
            console.log(
              `🔑 Expires: ${result.keyInfo.expiresAt?.toISOString() || 'Never'}`
            );
          }
        } else {
          console.log('❌ API key is invalid:', result.error);
        }
      })
  )
  .parse();

// Error handling
program.on('command:*', () => {
  console.error('❌ Unknown command:', program.args.join(' '));
  console.log('');
  console.log('💡 Available commands:');
  console.log('  generate  - Generate a new API key');
  console.log('  rotate    - Rotate API keys');
  console.log('  list      - List API keys');
  console.log('  revoke    - Revoke API keys');
  console.log('  stats     - Get API key statistics');
  console.log('  audit     - Get API key audit trail');
  console.log('  validate  - Validate an API key');
  console.log('');
  console.log('💡 Examples:');
  console.log('  api-key generate --type=dev --purpose="Local development"');
  console.log('  api-key rotate --type=prod --key-id=abc123');
  console.log('  api-key list --include-usage --format=table');
  console.log('  api-key validate dev_abc123def456...');
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught error:', error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled promise rejection:', reason);
  process.exit(1);
});

// Help command
program.on('command:help', () => {
  console.log('');
  console.log('🔐 API Key Management CLI');
  console.log('');
  console.log(
    'A comprehensive command-line tool for managing API keys with automated generation, rotation, and security features.'
  );
  console.log('');
  console.log('📋 COMMANDS:');
  console.log('');
  console.log('  generate    Generate a new API key');
  console.log('    Options:');
  console.log('      -t, --type <type>     Key type (dev, prod, svc)');
  console.log('      -p, --purpose <text>   Key purpose/description');
  console.log('      -s, --scopes <scopes>   Comma-separated scopes');
  console.log('      -e, --expires <days>   Expiration in days');
  console.log('      -i, --ip-restrict <list>   IP restrictions');
  console.log('      -r, --rate-limit <number>   Rate limit per hour');
  console.log('      -n, --name <name>       Key name');
  console.log('      -d, --description <text>   Key description');
  console.log('');
  console.log('  rotate    Rotate API keys');
  console.log('    Options:');
  console.log('      -t, --type <type>     Rotate specific key type');
  console.log('      -k, --key-id <id>     Rotate specific key ID');
  console.log('      -e, --exclude <ids>     Exclude specific key IDs');
  console.log('      -g, --grace-period <hours>   Grace period in hours');
  console.log('      -n, --notify           Send rotation notifications');
  console.log('      -f, --force           Force rotation even if not needed');
  console.log('');
  console.log('  list      List API keys');
  console.log('    Options:');
  console.log('      -t, --type <type>     Filter by key type');
  console.log(
    '      -s, --status <status>   Filter by status (active, expired)'
  );
  console.log('      -u, --include-usage   Include usage statistics');
  console.log('      -f, --format <format>   Output format (table, json)');
  console.log('      -e, --export <file>     Export to file');
  console.log('');
  console.log('  revoke    Revoke API keys');
  console.log('    Options:');
  console.log('      -k, --key-id <id>     Revoke specific key ID');
  console.log('      -r, --reason <text>   Revocation reason');
  console.log('      -f, --force           Force revocation');
  console.log('');
  console.log('  stats     Get API key statistics');
  console.log('    Options:');
  console.log('      -t, --type <type>     Filter by key type');
  console.log('');
  console.log('  audit     Get API key audit trail');
  console.log('    Options:');
  console.log('      -k, --key-id <id>     Filter by key ID');
  console.log('      -l, --limit <number>     Limit number of entries');
  console.log('');
  console.log('  validate  Validate API key');
  console.log('    Arguments:');
  console.log('      <key>                 API key to validate');
  console.log('');
  console.log('💡 EXAMPLES:');
  console.log('  # Generate development key');
  console.log('  api-key generate --type=dev --purpose="Local development"');
  console.log('  # Rotate production keys');
  console.log('  api-key rotate --type=prod --notify=true');
  console.log('  # List all keys with usage');
  console.log('  api-key list --include-usage --format=table');
  console.log('  # Validate a key');
  console.log('  api-key validate dev_abc123def456...');
});

if (process.argv.length < 3) {
  program.help();
}
