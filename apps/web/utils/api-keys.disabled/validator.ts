import { ApiKey, ApiKeyValidationResult } from './types';
import { timingSafeEqual } from '@/lib/timing';

/**
 * API Key validation utilities
 * Provides secure validation, authentication, and permission checking
 */

export class ApiKeyValidator {
  private static readonly cache = new Map<
    string,
    { key: ApiKey; expires: number }
  >();

  /**
   * Validate API key format and basic properties
   */
  static async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    // Check cache first (1 minute TTL)
    const cached = this.cache.get(apiKey);
    if (cached && Date.now() - cached.expires < 60000) {
      return {
        valid: true,
        keyInfo: cached.key,
      };
    }

    try {
      // Import validator class
      const { ApiKeyValidator: Validator } = await import('./validator');
      const validator = new ApiKeyValidator();

      // Basic format validation
      if (!validator.isValid(apiKey)) {
        return {
          valid: false,
          error: 'Invalid API key format',
        };
      }

      // Extract key information
      const keyInfo = validator.extractKeyInfo(apiKey);
      if (!keyInfo) {
        return {
          valid: false,
          error: 'Unable to extract key information',
        };
      }

      // Cache the validated key
      this.cache.set(apiKey, {
        key: keyInfo,
        expires: Date.now() + 300000, // 5 minutes
      });

      return {
        valid: true,
        keyInfo,
      };
    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error.message}`,
      };
    }
  }

  /**
   * Check if an API key has specific permissions
   */
  static async checkPermissions(
    apiKey: string,
    requiredPermission: string
  ): Promise<boolean> {
    const validation = await this.validateApiKey(apiKey);
    if (!validation.valid || !validation.keyInfo) {
      return false;
    }

    return this.hasPermission(
      validation.keyInfo.permissions,
      requiredPermission
    );
  }

  /**
   * Check if an API key has any of the required permissions
   */
  static async checkAnyPermissions(
    apiKey: string,
    requiredPermissions: string[]
  ): Promise<boolean> {
    const validation = await this.validateApiKey(apiKey);
    if (!validation.valid || !validation.keyInfo) {
      return false;
    }

    return requiredPermissions.every((permission) =>
      this.hasPermission(validation.keyInfo.permissions, permission)
    );
  }

  /**
   * Check if an API key is active and not expired
   */
  static async isActive(apiKey: string): Promise<boolean> {
    const validation = await this.validateApiKey(apiKey);
    if (!validation.valid || !validation.keyInfo) {
      return false;
    }

    return (
      validation.keyInfo.isActive &&
      !this.isExpired(validation.keyInfo.expiresAt)
    );
  }

  /**
   * Check if an API key is expired
   */
  static isExpired(expiresAt: Date): boolean {
    return timingSafeEqual(() => expiresAt.getTime() <= Date.now());
  }

  /**
   * Check if an API key is expiring soon
   */
  static isExpiringSoon(expiresAt: Date, daysThreshold: number = 30): boolean {
    const thresholdTime = Date.now() + daysThreshold * 24 * 60 * 60 * 1000;
    return expiresAt.getTime() <= thresholdTime;
  }

  /**
   * Get rate limit status for an API key
   */
  static getRateLimitStatus(
    currentUsage: number,
    limit: number,
    windowMs: number = 3600000 // 1 hour
  ): { allowed: boolean; resetTime: number } {
    return {
      allowed: currentUsage < limit,
      resetTime: Date.now() + windowMs,
    };
  }

  /**
   * Check IP restrictions for an API key
   */
  static checkIpRestriction(
    ipAddress: string,
    restrictions: string[]
  ): boolean {
    if (restrictions.length === 0) {
      return true;
    }

    return this.checkIpInRestrictions(ipAddress, restrictions);
  }

  /**
   * Check if IP is in any of the restriction lists
   */
  private static checkIpInRestrictions(
    ipAddress: string,
    restrictions: string[]
  ): boolean {
    for (const restriction of restrictions) {
      if (this.isIpMatch(ipAddress, restriction)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if IP matches a restriction (supports CIDR and wildcards)
   */
  private static isIpMatch(ipAddress: string, restriction: string): boolean {
    // Exact match
    if (ipAddress === restriction) {
      return true;
    }

    // CIDR notation check
    if (restriction.includes('/')) {
      const [restrictionNetwork, restrictionMask] = restriction.split('/');
      if (this.isIpInCidr(ipAddress, restrictionNetwork, restrictionMask)) {
        return true;
      }
    }

    // Wildcard check
    if (restriction.includes('*')) {
      const restrictionBase = restriction.replace('*', '');
      if (ipAddress.endsWith(restrictionBase)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if IP is in CIDR range
   */
  private static isIpInCidr(
    ipAddress: string,
    network: string,
    mask: string
  ): boolean {
    const ip = ipAddress.split('.').map(Number);
    const networkParts = network.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);

    if (
      ip.length !== 4 ||
      networkParts.length !== 4 ||
      maskParts.length !== 4
    ) {
      return false;
    }

    // Convert to 32-bit integers
    const ipNum = (ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3];
    const networkNum =
      (networkParts[0] << 24) |
      (networkParts[1] << 16) |
      (networkParts[2] << 8) |
      networkParts[3];
    const maskNum =
      (maskParts[0] << 24) |
      (maskParts[1] << 16) |
      (maskParts[2] << 8) |
      maskParts[3];

    // Apply mask and check if network matches
    return (ipNum & maskNum) === networkNum;
  }

  /**
   * Clear the validation cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Import validator class dynamically to avoid circular dependencies
class Validator {
  private static readonly keyPattern = /^[a-zA-Z0-9_]{16,32}$/;
  private static readonly typePattern = /^(dev|prod|svc)_/;

  isValid(key: string): boolean {
    return this.keyPattern.test(key);
  }

  extractKeyInfo(
    key: string
  ): { keyId: string; keyType: 'dev' | 'prod' | 'svc' } | null {
    const match = key.match(this.keyPattern);
    if (!match) {
      return null;
    }

    const [, type, keyId] = match;
    if (!this.typePattern.test(type)) {
      return null;
    }

    return { keyId, keyType: type as 'dev' | 'prod' | 'svc' };
  }
}

export default ApiKeyValidator;
