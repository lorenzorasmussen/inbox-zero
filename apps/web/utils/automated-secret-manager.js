#!/usr/bin/env node

/**
 * Automated Secret Management System
 * Prevents .env overwrites and manages secrets via Bitwarden
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomatedSecretManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.envPath = path.join(this.projectRoot, '.env');
    this.backupDir = path.join(this.projectRoot, '.env-backups');
    this.secretsCache = new Map();
    this.lastBackupTime = 0;
  }

  /**
   * Initialize the automated secret management system
   */
  async initialize() {
    console.log('🔐 Initializing Automated Secret Management...');

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Create initial backup
    await this.createBackup();

    // Set up file watchers
    this.setupFileWatcher();

    // Load secrets from Bitwarden
    await this.loadSecretsFromBitwarden();

    console.log('✅ Automated Secret Management initialized');
  }

  /**
   * Create automatic backup of .env file
   */
  async createBackup() {
    const now = Date.now();

    // Only backup if it's been more than 5 minutes since last backup
    if (now - this.lastBackupTime < 5 * 60 * 1000) {
      return;
    }

    if (fs.existsSync(this.envPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `.env.backup.${timestamp}`);

      try {
        fs.copyFileSync(this.envPath, backupPath);
        this.lastBackupTime = now;
        console.log(
          `💾 .env file backed up to: ${path.relative(this.projectRoot, backupPath)}`
        );
      } catch (error) {
        console.error('❌ Failed to create backup:', error.message);
      }
    }
  }

  /**
   * Set up file watcher to automatically backup .env on changes
   */
  setupFileWatcher() {
    try {
      fs.watchFile(this.envPath, { interval: 5000 }, async (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          console.log('📝 .env file modified, creating automatic backup...');
          await this.createBackup();
        }
      });
      console.log('👀 File watcher active for .env changes');
    } catch (error) {
      console.error('❌ Failed to setup file watcher:', error.message);
    }
  }

  /**
   * Load all secrets from Bitwarden vault
   */
  async loadSecretsFromBitwarden() {
    console.log('🔑 Loading secrets from Bitwarden...');

    try {
      // Get all items from project secrets folder
      const folderId = await this.getOrCreateSecretsFolder();
      const items = await this.getBitwardenItems(folderId);

      // Cache secrets for fast access
      for (const item of items) {
        this.secretsCache.set(item.name, item.fields || {});
      }

      console.log(`✅ Loaded ${items.length} secret items from Bitwarden`);
    } catch (error) {
      console.error('❌ Failed to load secrets from Bitwarden:', error.message);
    }
  }

  /**
   * Get or create the project secrets folder
   */
  async getOrCreateSecretsFolder() {
    try {
      const folders = JSON.parse(
        execSync('bw list folders', {
          encoding: 'utf8',
          env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
        })
      );

      const projectFolder = folders.find(
        (f) => f.name === 'Inbox Zero Secrets'
      );

      if (projectFolder) {
        return projectFolder.id;
      }

      // Create folder if it doesn't exist
      const result = JSON.parse(
        execSync('bw create folder "Inbox Zero Secrets"', {
          encoding: 'utf8',
          env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
        })
      );

      console.log('📁 Created Bitwarden folder: Inbox Zero Secrets');
      return result.id;
    } catch (error) {
      console.error('❌ Failed to get/create secrets folder:', error.message);
      throw error;
    }
  }

  /**
   * Get all items from the secrets folder
   */
  async getBitwardenItems(folderId) {
    try {
      const items = JSON.parse(
        execSync(`bw list items --folderid ${folderId}`, {
          encoding: 'utf8',
          env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
        })
      );

      return items;
    } catch (error) {
      console.error('❌ Failed to get Bitwarden items:', error.message);
      return [];
    }
  }

  /**
   * Get a secret value from cache or Bitwarden
   */
  async getSecret(itemName, fieldName) {
    // Check cache first
    const item = this.secretsCache.get(itemName);
    if (item && item[fieldName]) {
      return item[fieldName];
    }

    // Fallback to direct Bitwarden query
    try {
      const value = execSync(
        `bw get item "${itemName}" --field "${fieldName}"`,
        {
          encoding: 'utf8',
          env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
        }
      ).trim();

      // Update cache
      if (!item) {
        this.secretsCache.set(itemName, { [fieldName]: value });
      } else {
        item[fieldName] = value;
      }

      return value;
    } catch (error) {
      console.error(
        `❌ Failed to get secret ${itemName}.${fieldName}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * Set a secret value in Bitwarden
   */
  async setSecret(itemName, fieldName, value, folderId = null) {
    try {
      // Check if item exists
      const existingItems = JSON.parse(
        execSync(`bw list items --search "${itemName}"`, {
          encoding: 'utf8',
          env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
        })
      );

      const existingItem = existingItems.find((item) => item.name === itemName);

      if (existingItem) {
        // Update existing item
        const updateData = {
          fields: existingItem.fields || [],
        };

        // Update or add field
        const fieldIndex = updateData.fields.findIndex(
          (f) => f.name === fieldName
        );
        if (fieldIndex >= 0) {
          updateData.fields[fieldIndex].value = value;
        } else {
          updateData.fields.push({ name: fieldName, value });
        }

        execSync(
          `bw edit item ${existingItem.id} '${JSON.stringify(updateData)}'`,
          {
            env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
          }
        );
      } else {
        // Create new item
        const createData = {
          name: itemName,
          fields: [{ name: fieldName, value }],
          folderId,
        };

        execSync(`bw create item '${JSON.stringify(createData)}'`, {
          env: { ...process.env, BW_SESSION: process.env.BW_SESSION },
        });
      }

      // Update cache
      const item = this.secretsCache.get(itemName) || {};
      item[fieldName] = value;
      this.secretsCache.set(itemName, item);

      console.log(`✅ Secret ${itemName}.${fieldName} saved to Bitwarden`);
    } catch (error) {
      console.error(
        `❌ Failed to set secret ${itemName}.${fieldName}:`,
        error.message
      );
    }
  }

  /**
   * Automatically migrate .env secrets to Bitwarden
   */
  async migrateEnvToBitwarden() {
    console.log('🚀 Starting automated .env to Bitwarden migration...');

    if (!fs.existsSync(this.envPath)) {
      console.log('ℹ️  No .env file found to migrate');
      return;
    }

    const folderId = await this.getOrCreateSecretsFolder();
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const lines = envContent.split('\n');

    let migratedCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');

      if (key && value) {
        // Categorize secrets
        let itemName;
        if (key.includes('GOOGLE') || key.includes('OAUTH')) {
          itemName = 'Google OAuth';
        } else if (key.includes('DATABASE') || key.includes('DB')) {
          itemName = 'Database';
        } else if (
          key.includes('API') ||
          key.includes('KEY') ||
          key.includes('SECRET')
        ) {
          itemName = 'API Keys';
        } else if (key.includes('AUTH') || key.includes('JWT')) {
          itemName = 'Auth Secrets';
        } else {
          itemName = 'Environment Variables';
        }

        await this.setSecret(itemName, key, value, folderId);
        migratedCount++;
      }
    }

    console.log(`✅ Migrated ${migratedCount} secrets from .env to Bitwarden`);

    // Create backup before modifying
    await this.createBackup();

    // Comment out sensitive lines in .env
    const updatedContent = envContent
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;

        const [key] = trimmed.split('=');
        if (
          key &&
          (key.includes('SECRET') ||
            key.includes('KEY') ||
            key.includes('PASSWORD'))
        ) {
          return `# ${line} # Moved to Bitwarden`;
        }
        return line;
      })
      .join('\n');

    fs.writeFileSync(this.envPath, updatedContent);
    console.log('📝 .env file updated (sensitive values commented out)');
  }

  /**
   * Generate .env file from Bitwarden secrets
   */
  async generateEnvFromBitwarden() {
    console.log('🔄 Generating .env file from Bitwarden secrets...');

    const folderId = await this.getOrCreateSecretsFolder();
    const items = await this.getBitwardenItems(folderId);

    let envContent = `# Generated from Bitwarden - $(date)\n`;
    envContent += `# DO NOT EDIT DIRECTLY - Use Bitwarden or the secret manager\n\n`;

    for (const item of items) {
      envContent += `# ${item.name}\n`;
      if (item.fields) {
        for (const field of item.fields) {
          envContent += `${field.name}=${field.value}\n`;
        }
      }
      envContent += '\n';
    }

    // Backup existing .env
    await this.createBackup();

    // Write new .env
    fs.writeFileSync(this.envPath, envContent);
    console.log('✅ .env file generated from Bitwarden secrets');
  }

  /**
   * Start the automated secret management system
   */
  async start() {
    await this.initialize();

    // Set up periodic sync
    setInterval(
      async () => {
        await this.loadSecretsFromBitwarden();
      },
      5 * 60 * 1000
    ); // Refresh every 5 minutes

    console.log('🔄 Automated secret management system running...');
    console.log('💡 Use: npm run secrets -- [command]');
  }
}

// CLI Interface
const secretManager = new AutomatedSecretManager();

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      await secretManager.initialize();
      break;

    case 'migrate':
      await secretManager.migrateEnvToBitwarden();
      break;

    case 'generate':
      await secretManager.generateEnvFromBitwarden();
      break;

    case 'backup':
      await secretManager.createBackup();
      break;

    case 'get':
      const itemName = process.argv[3];
      const fieldName = process.argv[4];
      if (!itemName || !fieldName) {
        console.error('Usage: npm run secrets -- get <itemName> <fieldName>');
        process.exit(1);
      }
      const value = await secretManager.getSecret(itemName, fieldName);
      console.log(value || 'Secret not found');
      break;

    case 'set':
      const setItemName = process.argv[3];
      const setFieldName = process.argv[4];
      const setValue = process.argv[5];
      if (!setItemName || !setFieldName || !setValue) {
        console.error(
          'Usage: npm run secrets -- set <itemName> <fieldName> <value>'
        );
        process.exit(1);
      }
      await secretManager.setSecret(setItemName, setFieldName, setValue);
      break;

    default:
      console.log(`
🔐 Automated Secret Management System

Commands:
  init      - Initialize the secret management system
  migrate   - Migrate .env secrets to Bitwarden
  generate  - Generate .env from Bitwarden secrets
  backup    - Create manual backup of .env file
  get <item> <field> - Get a secret value
  set <item> <field> <value> - Set a secret value

Examples:
  npm run secrets -- init
  npm run secrets -- migrate
  npm run secrets -- get "Google OAuth" "CLIENT_ID"
  npm run secrets -- set "API Keys" "OPENROUTER_API_KEY" "your_key"
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AutomatedSecretManager };
