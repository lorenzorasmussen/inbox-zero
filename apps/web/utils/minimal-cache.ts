'use client';

import { useCallback, useEffect, useRef } from 'react';

// Minimal in-memory cache for frequently accessed data
class MinimalCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private maxSize = 50; // Minimal cache size

  set(key: string, data: any, ttl = 5 * 60 * 1000) {
    // 5 minutes default
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new MinimalCache();

// Minimal SWR cache for API responses
export const minimalSWRCache = {
  get: (key: string) => cache.get(key),
  set: (key: string, data: any) => cache.set(key, data),
  clear: () => cache.clear(),
};

// Minimal localStorage cache for persistent data
export const persistentCache = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  },

  set: (key: string, data: any, ttl = 24 * 60 * 60 * 1000) => {
    // 24 hours default
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl,
        })
      );
    } catch {
      // localStorage full or unavailable
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      // Only clear our cache keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore errors
    }
  },
};

// React hook for minimal caching
export function useMinimalCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    persistent?: boolean;
  } = {}
) {
  const { ttl = 5 * 60 * 1000, persistent = false } = options;
  const cacheRef = useRef<T | null>(null);
  const loadingRef = useRef(false);

  const getCachedData = useCallback(() => {
    if (persistent) {
      return persistentCache.get(`cache_${key}`);
    }
    return minimalSWRCache.get(key);
  }, [key, persistent]);

  const setCachedData = useCallback(
    (data: T) => {
      if (persistent) {
        persistentCache.set(`cache_${key}`, data, ttl);
      } else {
        minimalSWRCache.set(key, data, ttl);
      }
      cacheRef.current = data;
    },
    [key, persistent, ttl]
  );

  const fetchData = useCallback(async () => {
    if (loadingRef.current) return cacheRef.current;

    loadingRef.current = true;
    try {
      const data = await fetcher();
      setCachedData(data);
      return data;
    } finally {
      loadingRef.current = false;
    }
  }, [fetcher, setCachedData]);

  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      cacheRef.current = cached;
    }
  }, [getCachedData]);

  return {
    data: cacheRef.current,
    fetch: fetchData,
    clear: () => {
      if (persistent) {
        persistentCache.clear();
      } else {
        minimalSWRCache.clear();
      }
      cacheRef.current = null;
    },
  };
}

// Minimal image preloading for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Minimal resource hints
export const addResourceHint = (href: string, rel: string, as?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;

  document.head.appendChild(link);
};
