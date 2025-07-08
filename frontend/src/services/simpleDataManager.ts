export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  accessCount: number;
  lastAccessed: number;
}

export interface DataManagerConfig {
  maxCacheSize: number;
  defaultTTL: number;
  enablePersistence: boolean;
}

class SimpleDataManager {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0
  };

  private config: DataManagerConfig = {
    maxCacheSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enablePersistence: true
  };

  constructor(config?: Partial<DataManagerConfig>) {
    this.config = { ...this.config, ...config };
    this.initializePersistence();
    this.startCleanupTimer();
  }

  private initializePersistence() {
    if (!this.config.enablePersistence) return;

    try {
      const persistedData = localStorage.getItem('dataManager_cache');
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        Object.entries(parsed).forEach(([key, entry]: [string, any]) => {
          if (Date.now() - entry.timestamp < entry.ttl) {
            this.cache.set(key, entry);
          }
        });
        console.debug('DataManager: Restored cache from persistence', { entries: this.cache.size });
      }
    } catch (error) {
      console.error('DataManager: Failed to restore cache from persistence', error);
    }
  }

  private persistCache() {
    if (!this.config.enablePersistence) return;

    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      localStorage.setItem('dataManager_cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('DataManager: Failed to persist cache', error);
    }
  }

  private startCleanupTimer() {
    // Cache cleanup every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private evictLRU() {
    if (this.cache.size <= this.config.maxCacheSize) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // Sort by priority first, then by last accessed time
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a[1].priority];
      const bPriority = priorityWeight[b[1].priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Lower priority first
      }
      
      return a[1].lastAccessed - b[1].lastAccessed; // Older first
    });

    const toEvict = entries.slice(0, Math.floor(this.config.maxCacheSize * 0.1));
    toEvict.forEach(([key]) => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });

    console.debug('DataManager: Evicted cache entries', { count: toEvict.length });
  }

  private cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.debug('DataManager: Cleaned up expired cache entries', { count: expiredKeys.length });
      this.persistCache();
    }

    this.evictLRU();
  }

  async get<T>(key: string, priority: CacheEntry<T>['priority'] = 'medium'): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.metrics.hits++;

    return entry.data;
  }

  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: CacheEntry<T>['priority'];
    } = {}
  ): Promise<void> {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    const priority = options.priority || 'medium';

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      priority,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    this.metrics.sets++;

    this.evictLRU();
    this.persistCache();
  }

  async invalidate(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern) || key.match(new RegExp(pattern))) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.debug('DataManager: Invalidated cache entries', { pattern, count: keysToDelete.length });
      this.persistCache();
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    
    if (this.config.enablePersistence) {
      localStorage.removeItem('dataManager_cache');
    }
    
    console.debug('DataManager: Cache cleared completely');
  }

  getMetrics() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0;
    return {
      ...this.metrics,
      hitRate,
      cacheSize: this.cache.size
    };
  }

  // Advanced query methods
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async key => {
        results[key] = await this.get<T>(key);
      })
    );
    
    return results;
  }

  async setMultiple<T>(entries: Array<{ key: string; data: T; options?: any }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, data, options }) => this.set(key, data, options))
    );
  }

  // Memory usage estimation
  getMemoryUsage(): { estimated: number; entries: number } {
    let estimatedSize = 0;
    
    this.cache.forEach(entry => {
      estimatedSize += new Blob([JSON.stringify(entry)]).size;
    });
    
    return {
      estimated: estimatedSize,
      entries: this.cache.size
    };
  }
}

// Singleton instance
export const dataManager = new SimpleDataManager();

// React hook for using data manager
export const useDataManager = () => {
  const get = async <T>(key: string, priority?: CacheEntry<T>['priority']) => {
    return dataManager.get<T>(key, priority);
  };

  const set = async <T>(key: string, data: T, options?: any) => {
    return dataManager.set(key, data, options);
  };

  const invalidate = async (pattern: string) => {
    return dataManager.invalidate(pattern);
  };

  const getMetrics = () => dataManager.getMetrics();

  return {
    get,
    set,
    invalidate,
    getMetrics,
    clear: () => dataManager.clear()
  };
};

export default SimpleDataManager; 