#!/usr/bin/env node

/**
 * Simple API Key Management CLI Tool
 * Basic command-line interface for managing API keys
 */

import { Command } from 'commander';
import { generateSecureToken, hashApiKey } from '../utils/api-key';
import prisma from '../utils/prisma';

const program = new Command()
  .name('api-key')
  .description('Simple API Key Management CLI')
  .version('1.0.0')
  .addCommand(
    new Command('generate')
      .description('Generate a new API key')
      .option('-n, --name <name>', 'Key name')
      .action(async (options) => {
        try {
          const keyId = `key_${Date.now()}`;
          const secretKey = generateSecureToken();
          const hashedKey = hashApiKey(secretKey);

          const apiKey = await prisma.apiKey.create({
            data: {
              name: options.name || 'Generated Key',
              keyId,
              hashedKey,
              isActive: true,
            },
          });

          console.log('✅ API Key Generated Successfully!');
          console.log(`🔑 Key ID: ${apiKey.keyId}`);
          console.log(`🔑 Name: ${apiKey.name}`);
          console.log(
            `🔑 Key: ${hashedKey.substring(0, 8)}...${hashedKey.substring(8, 12)}...`
          );
          console.log(`📋 Created: ${apiKey.createdAt.toISOString()}`);
          console.log('');
          console.log('💡 Use this key in your applications:');
          console.log(`   Authorization: Bearer ${hashedKey}`);
          console.log(`   X-API-Key-ID: ${apiKey.keyId}`);
        } catch (error) {
          console.error('❌ Error generating key:', error.message);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list').description('List API keys').action(async () => {
      try {
        const keys = await prisma.apiKey.findMany({
          select: {
            id: true,
            keyId: true,
            name: true,
            isActive: true,
            createdAt: true,
            usageCount: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        console.log('📋 API Keys:');
        console.log(
          '┌─────────────────────────────────────────────────────────┐'
        );
        console.log(
          '│ Key ID              │ Name                │ Status    │ Usage │'
        );
        console.log('├──────────────────────┼──────────────┼──────────────┤');

        if (keys.length === 0) {
          console.log('│ No keys found                                    │');
        } else {
          keys.forEach((key, index) => {
            const status = key.isActive ? 'Active' : 'Inactive';
            console.log(
              `│ ${key.keyId.padEnd(20)} │ ${key.name.padEnd(18)} │ ${status.padEnd(9)} │ ${key.usageCount || 0} │`
            );
          });
        }

        console.log(
          '└──────────────────────┴─────────────────────────────────────────┘'
        );
      } catch (error) {
        console.error('❌ Error listing keys:', error.message);
        process.exit(1);
      }
    })
  )
  .addCommand(
    new Command('revoke')
      .description('Revoke an API key')
      .argument('<key-id>', 'Key ID to revoke')
      .action(async (keyId) => {
        try {
          const result = await prisma.apiKey.updateMany({
            where: { keyId },
            data: { isActive: false },
          });

          if (result.count === 0) {
            console.log(`❌ Key not found: ${keyId}`);
            process.exit(1);
          }

          console.log(`✅ Key revoked: ${keyId}`);
        } catch (error) {
          console.error('❌ Error revoking key:', error.message);
          process.exit(1);
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
  console.log('  list      - List API keys');
  console.log('  revoke    - Revoke an API key');
  console.log('');
  console.log('💡 Examples:');
  console.log('  api-key generate --name="Development Key"');
  console.log('  api-key list');
  console.log('  api-key revoke abc123def456');
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
