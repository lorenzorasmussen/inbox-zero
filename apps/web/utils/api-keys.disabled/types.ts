import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'crypto';

// Types for API keys
export interface ApiKey {
  id: string;
  keyId: string;
  keyType: 'dev' | 'prod' | 'svc';
  name: string;
  description?: string;
  hashedKey: string;
  salt: string;
  scopes: string[];
  permissions: Record<string, boolean>;
  userId: string;
  emailAccountId?: string;
  isActive: boolean;
  expiresAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  rateLimitPerHour: number;
  ipRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface ApiKeyUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  requestSizeBytes?: number;
  responseSizeBytes?: number;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  timestamp: Date;
}

export interface ApiKeyAuditTrail {
  id: string;
  apiKeyId: string;
  action: 'create' | 'rotate' | 'revoke' | 'suspend' | 'reactivate' | 'update_permissions' | 'view';
  performedBy: string;
  reason?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
}

export interface ApiKeyRotationSchedule {
  id: string;
  apiKeyId: string;
  rotationType: 'scheduled' | 'usage_based' | 'security_triggered' | 'manual';
  nextRotationAt: Date;
  gracePeriodHours: number;
  notificationSent: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ApiKeyRole {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyRoleAssignment {
  id: string;
  apiKeyId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
}

export interface ApiKeySecurityEvent {
  id: string;
  apiKeyId?: string;
  eventType: 'failed_auth' | 'rate_limit_exceeded' | 'ip_blocked' | 'unusual_usage' | 'compromise_suspected' | 'access_revoked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  resolved: boolean;
  resolvedAt?: Date;
  timestamp: Date;
}

export interface ApiKeyGenerationOptions {
  type: 'dev' | 'prod' | 'svc';
  purpose: string;
  scopes?: string[];
  expires?: number; // days
  ipRestrict?: string[];
  rateLimit?: number; // per hour
  name?: string;
  description?: string;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  keyInfo?: Partial<ApiKey>;
  error?: string;
}

export interface ApiKeyPermissions {
  admin: boolean;
  read: boolean;
  write: boolean;
  delete: boolean;
  service: boolean;
  internal: boolean;
  [key: string]: boolean;
}

export interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  usage24h: number;
  usage7d: number;
  usage30d: number;
  mostUsedKey?: string;
  lastRotation?: Date;
}

// Default permissions by key type
export const DEFAULT_PERMISSIONS = {
  dev: {
    admin: true,
    read: true,
    write: true,
    delete: true,
    service: true,
    internal: true,
  },
  prod: {
    admin: false,
    read: true,
    write: true,
    delete: false,
    service: false,
    internal: false,
  },
  svc: {
    admin: false,
    read: true,
    write: false,
    delete: false,
    service: true,
    internal: true,
  },
};

// Default expiration periods
export const DEFAULT_EXPIRATION_DAYS = {
  dev: 90,
  prod: 365,
  svc: 1825, // 5 years
};

// Key generation configuration
export const KEY_GENERATION_CONFIG = {
  entropy: 256, // bits
  iterations: 10000, // for PBKDF2
  saltLength: 32,
  keyIdLength: 16,
  keyPrefixLength: 4,
};

// API key validation
export class ApiKeyValidator {
  private static readonly keyPattern = /^[a-zA-Z0-9_]{16,32}$/;
  private static readonly typePattern = /^(dev|prod|svc)_/;
  private static readonly scopePattern = /^[a-zA-Z0-9_:,]+$/;

  static generateSalt(): string {
    return randomBytes(KEY_GENERATION_CONFIG.saltLength).toString('hex');
  }

  static generateKeyId(type: string): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(KEY_GENERATION_CONFIG.keyIdLength - timestamp.length).toString('hex');
    return `${type}_${timestamp}${random}`;
  }

  static async hashKey(key: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      scrypt(key, salt, KEY_GENERATION_CONFIG.iterations, KEY_GENERATION_CONFIG.entropy, (err, derivedKey) => {
        if (err) {
          reject(new Error(`Key hashing failed: ${err.message}`));
        } else {
          resolve(derivedKey.toString('hex'));
        }
      });
    });
  }

  static generateApiKey(type: string, options: ApiKeyGenerationOptions): Promise<ApiKey> {
    const {
      purpose,
      scopes = [],
      expires = DEFAULT_EXPIRATION_DAYS[type],
      ipRestrict = [],
      rateLimit = 1000,
      name,
      description,
    } = options;

    const salt = this.generateSalt();
    const keyId = this.generateKeyId(type);
    const rawKey = randomBytes(32).toString('hex');
    const hashedKey = await this.hashKey(rawKey, salt);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires);

    return {
      id: randomUUID(),
      keyId,
      keyType: type,
      name: name || `${type} API Key`,
      description,
      hashedKey,
      salt,
      scopes: scopes.length > 0 ? scopes : Object.keys(DEFAULT_PERMISSIONS[type]),
      permissions: DEFAULT_PERMISSIONS[type],
      userId: '', // Will be set when created
      emailAccountId: undefined, // Will be set when created
      isActive: true,
      expiresAt,
      usageCount: 0,
      rateLimitPerHour: rateLimit,
      ipRestrictions: ipRestrict,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static validateKeyFormat(key: string): boolean {
    return this.keyPattern.test(key);
  }

  static validateKeyType(type: string): boolean {
    return ['dev', 'prod', 'svc'].includes(type);
  }

  static validateScopes(scopes: string[]): boolean {
    return scopes.every(scope => this.scopePattern.test(scope));
  }

  static async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    // Check format
    if (!this.validateKeyFormat(apiKey)) {
      return {
        valid: false,
        error: 'Invalid API key format',
      };
    }

    // Extract type and key ID
    const match = apiKey.match(/^([a-z]+)_([a-zA-Z0-9_]{16,32})$/);
    if (!match) {
      return {
        valid: false,
        error: 'Invalid API key format',
      };
    }

    const [, type, keyId] = match;
    
    // Validate type
    if (!this.validateKeyType(type)) {
      return {
        valid: false,
        error: 'Invalid API key type',
      };
    }

    // This would typically query the database to get full key info
    // For now, return basic validation
    return {
      valid: true,
      keyInfo: {
        keyId,
        keyType: type as 'dev' | 'prod' | 'svc',
      },
    };
  }

  static generateSecureToken(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(16).toString('hex');
    return `${timestamp}${random}`;
  }

  static maskApiKey(apiKey: string): string {
    if (apiKey.length < 8) {
      return apiKey;
    }
    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    return `${start}...${end}`;
  }

  static extractPermissions(permissions: Record<string, boolean>): string[] {
    return Object.entries(permissions)
      .filter(([, permission]) => permission)
      .map(([permission]) => permission);
  }

  static hasPermission(permissions: Record<string, boolean>, permission: string): boolean {
    return permissions[permission] === true;
  }

  static checkRateLimit(
    currentUsage: number,
    limit: number,
    windowMs: number = 3600000 // 1 hour
  ): { allowed: boolean; resetTime: number } {
    return {
      allowed: currentUsage < limit,
      resetTime: Date.now() + windowMs,
    };
  }

  static checkIpRestriction(ipAddress: string, restrictions: string[]): boolean {
    if (restrictions.length === 0) {
      return true;
    }

    return restrictions.some(restriction => {
      if (restriction.includes('/')) {
        // CIDR notation
        const [network, mask] = restriction.split('/');
        if (mask.length !== 32) return false;
        
        try {
          const ip = ipAddress.split('.').map(Number);
          const [networkParts] = network.split('.').map(Number);
          const [maskParts] = mask.split('.').map(Number);
          
          for (let i = 0; i < 4; i++) {
            if ((ip[i]! & maskParts[i]!) !== maskParts[i]!) {
              return false;
            }
          }
          
          for (let i = 4; i < 8; i++) {
            if (i < networkParts.length && 
                (ip[i]! & maskParts[i - 4]!) !== networkParts[i - 4]!) {
              return false;
            }
          }
          
          return true;
        } catch {
          return false;
        }
      } else {
        // Exact match or wildcard
        return restriction === ipAddress || restriction === '*';
      }
    });
  }

  static isExpired(expiresAt: Date): boolean {
    return expiresAt.getTime() <= Date.now();
  }

  static isExpiringSoon(
    expiresAt: Date,
    daysThreshold: number = 30
  ): boolean {
    const thresholdTime = Date.now() + (daysThreshold * 24 * 60 * 60 * 1000);
    return expiresAt.getTime() <= thresholdTime;
  }

  static generateUsageStats(usageLogs: ApiKeyUsage[]): {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const usage24h = usageLogs.filter(log => log.timestamp >= oneDayAgo).length;
    const usage7d = usageLogs.filter(log => log.timestamp >= sevenDaysAgo).length;
    const usage30d = usageLogs.filter(log => log.timestamp >= thirtyDaysAgo).length;
    
    return {
      usage24h,
      usage7d,
      usage30d,
    };

    return {
      usage24h,
      usage7d,
      usage30d,
    };
  }

  static calculateSecurityScore(events: ApiKeySecurityEvent[]): number {
    if (events.length === 0) return 100;

    const weights = {
      failed_auth: 10,
      rate_limit_exceeded: 5,
      ip_blocked: 8,
      unusual_usage: 3,
      compromise_suspected: 25,
      access_revoked: 15,
    };

    const severityWeights = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const event of events) {
      const eventWeight = weights[event.eventType] || 1;
      const severityWeight = severityWeights[event.severity] || 1;
      
      totalScore += eventWeight * severityWeight;
      totalWeight += eventWeight * severityWeight;
    }

    return Math.max(0, 100 - Math.round((totalScore / totalWeight) * 100));
  }
}

// Export constants
export const API_KEY_CONSTANTS = {
  KEY_GENERATION_CONFIG,
  DEFAULT_PERMISSIONS,
  DEFAULT_EXPIRATION_DAYS,
  HEADER_NAME: 'X-API-Key',
  AUTH_SCHEME: 'Bearer',
  USAGE_LOG_RETENTION_DAYS: 90,
  MAX_KEYS_PER_USER: 10,
  ROTATION_GRACE_PERIOD_HOURS: 24,
  SECURITY_SCORE_THRESHOLDS: {
    GOOD: 80,
    WARNING: 60,
    CRITICAL: 40,
  },
};