/**
 * Caching utilities for Inbox Zero performance optimization
 * Implements multi-layer caching strategy with Redis and browser cache
 */

import Redis from 'ioredis';

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number; // Maximum size for client-side cache
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

// Default cache configurations
export const cacheConfigs: Record<string, CacheConfig> = {
  api: {
    ttl: 300, // 5 minutes
    strategy: 'cache-first',
  },
  static: {
    ttl: 86400, // 24 hours
    strategy: 'cache-first',
  },
  user: {
    ttl: 1800, // 30 minutes
    strategy: 'cache-first',
  },
  email: {
    ttl: 600, // 10 minutes
    strategy: 'network-first',
  },
  search: {
    ttl: 1800, // 30 minutes
    strategy: 'stale-while-revalidate',
  },
};

// Redis client (singleton)
let redisClient: Redis | null = null;

const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redisClient;
};

// Client-side cache (in-memory with localStorage persistence)
class ClientCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private storageKey: string;

  constructor(maxSize: number = 100, storageKey: string = 'inboxzero_cache') {
    this.maxSize = maxSize;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  // Cache operations
  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordMiss();
      return null;
    }

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    if (age > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      this.recordMiss();
      return null;
    }

    this.recordHit();
    return entry.data as T;
  }

  async set<T = any>(key: string, data: T, ttl?: number): Promise<void> {
    const config = cacheConfigs.api; // Default config
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || config.ttl,
    };

    // Ensure cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    this.saveToStorage();
    this.recordSet();
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.saveToStorage();
    this.recordDelete();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.saveToStorage();
  }

  // Cache statistics
  getStats(): CacheStats {
    const values = Array.from(this.cache.values());
    const size = values.reduce((total, entry) => {
      return total + JSON.stringify(entry.data).length;
    }, 0);

    return {
      hits: this.getHits(),
      misses: this.getMisses(),
      sets: this.getSets(),
      deletes: this.getDeletes(),
      size,
    };
  }

  // Private helper methods
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Statistics tracking (simplified)
  private getHits(): number {
    return parseInt(localStorage.getItem(`${this.storageKey}_hits`) || '0');
  }

  private getMisses(): number {
    return parseInt(localStorage.getItem(`${this.storageKey}_misses`) || '0');
  }

  private getSets(): number {
    return parseInt(localStorage.getItem(`${this.storageKey}_sets`) || '0');
  }

  private getDeletes(): number {
    return parseInt(localStorage.getItem(`${this.storageKey}_deletes`) || '0');
  }

  private recordHit(): void {
    const hits = this.getHits() + 1;
    localStorage.setItem(`${this.storageKey}_hits`, hits.toString());
  }

  private recordMiss(): void {
    const misses = this.getMisses() + 1;
    localStorage.setItem(`${this.storageKey}_misses`, misses.toString());
  }

  private recordSet(): void {
    const sets = this.getSets() + 1;
    localStorage.setItem(`${this.storageKey}_sets`, sets.toString());
  }

  private recordDelete(): void {
    const deletes = this.getDeletes() + 1;
    localStorage.setItem(`${this.storageKey}_deletes`, deletes.toString());
  }
}

// Server-side Redis cache
class ServerCache {
  private redis: Redis;
  private prefix: string;

  constructor(prefix: string = 'inboxzero:') {
    this.redis = getRedisClient();
    this.prefix = prefix;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = `${this.prefix}${key}`;
      const value = await this.redis.get(fullKey);

      if (value === null) {
        return null;
      }

      const parsed = JSON.parse(value);
      return parsed as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const fullKey = `${this.prefix}${key}`;
      const config = cacheConfigs.api; // Default config
      const expiry = ttl || config.ttl;

      await this.redis.setex(fullKey, expiry, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = `${this.prefix}${key}`;
      await this.redis.del(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const fullPattern = `${this.prefix}${pattern}`;
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        const keys = await this.redis.keys(`${this.prefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Cache factory
export const createCache = (type: 'client' | 'server' = 'client') => {
  if (type === 'client') {
    return new ClientCache();
  } else {
    return new ServerCache();
  }
};

// Cache hooks
export const useClientCache = (maxSize?: number, storageKey?: string) => {
  return React.useMemo(
    () => new ClientCache(maxSize, storageKey),
    [maxSize, storageKey]
  );
};

export const useServerCache = (prefix?: string) => {
  return React.useMemo(() => new ServerCache(prefix), [prefix]);
};

// Cache middleware for API routes
export const withCache = (config?: CacheConfig) => {
  return (handler: Function) => {
    return async (request: Request) => {
      const cacheKey = `cache:${request.url}:${JSON.stringify(request.body)}`;
      const cache = createCache('server');
      const cacheConfig = config || cacheConfigs.api;

      // Check cache first for cache-first strategy
      if (cacheConfig.strategy === 'cache-first') {
        const cached = await (cache as ServerCache).get(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': `public, max-age=${cacheConfig.ttl}`,
            },
          });
        }
      }

      // Execute handler
      const startTime = Date.now();
      const response = await handler(request);
      const responseTime = Date.now() - startTime;

      // Cache successful responses
      if (response.status === 200 && cacheConfig.strategy !== 'network-first') {
        const responseData = await response.json();
        await (cache as ServerCache).set(
          cacheKey,
          responseData,
          cacheConfig.ttl
        );

        return new Response(JSON.stringify(responseData), {
          status: response.status,
          headers: {
            ...response.headers,
            'X-Cache': 'MISS',
            'Cache-Control': `public, max-age=${cacheConfig.ttl}`,
          },
        });
      }

      return response;
    };
  };
};

// Cache invalidation utilities
export const invalidateCache = async (patterns: string[]): Promise<void> => {
  const cache = createCache('server');

  for (const pattern of patterns) {
    await (cache as ServerCache).clear(pattern);
  }
};

// Cache warming utilities
export const warmCache = async (
  keys: string[],
  dataFetcher: (key: string) => Promise<any>
): Promise<void> => {
  const cache = createCache('server');

  const promises = keys.map(async (key) => {
    const cached = await (cache as ServerCache).get(key);
    if (!cached) {
      try {
        const data = await dataFetcher(key);
        await (cache as ServerCache).set(key, data);
      } catch (error) {
        console.warn(`Failed to warm cache for key ${key}:`, error);
      }
    }
  });

  await Promise.allSettled(promises);
};

// Export default instances
export const clientCache = new ClientCache();
export const serverCache = new ServerCache();

export default {
  createCache,
  useClientCache,
  useServerCache,
  withCache,
  invalidateCache,
  warmCache,
  clientCache,
  serverCache,
  cacheConfigs,
};
