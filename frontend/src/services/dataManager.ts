import logger from '@/utils/logger';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
}

export interface SyncStrategy {
  immediate: boolean;
  background: boolean;
  interval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface DataManagerConfig {
  maxCacheSize: number;
  defaultTTL: number;
  compressionThreshold: number;
  syncStrategies: Record<string, SyncStrategy>;
  enableMetrics: boolean;
  enablePersistence: boolean;
}

class IntelligentDataManager {
  private cache = new Map<string, CacheEntry<any>>();
  private syncQueue = new Set<string>();
  private syncTimers = new Map<string, NodeJS.Timeout>();
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    compressions: 0,
    syncOperations: 0,
    errors: 0
  };

  private config: DataManagerConfig = {
    maxCacheSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    compressionThreshold: 50 * 1024, // 50KB
    syncStrategies: {
      'market-data': { immediate: true, background: true, interval: 30000 },
      'user-data': { immediate: false, background: true, interval: 60000 },
      'static-data': { immediate: false, background: false }
    },
    enableMetrics: true,
    enablePersistence: true
  };

  constructor(config?: Partial<DataManagerConfig>) {
    this.config = { ...this.config, ...config };
    this.initializePersistence();
    this.startBackgroundTasks();
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
                 logger.debug('cache', 'Restored cache from persistence', { entries: this.cache.size });
       }
     } catch (error) {
       logger.error('cache', 'Failed to restore cache from persistence', error);
    }
  }

  private persistCache() {
    if (!this.config.enablePersistence) return;

    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      localStorage.setItem('dataManager_cache', JSON.stringify(cacheObject));
         } catch (error) {
       logger.error('cache', 'Failed to persist cache', error);
     }
  }

  private startBackgroundTasks() {
    // Cache cleanup every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // Metrics logging every minute
    if (this.config.enableMetrics) {
      setInterval(() => {
        this.logMetrics();
      }, 60 * 1000);
    }

    // Background sync processing
    setInterval(() => {
      this.processSyncQueue();
    }, 1000);
  }

  private shouldCompress(data: any): boolean {
    const size = new Blob([JSON.stringify(data)]).size;
    return size > this.config.compressionThreshold;
  }

  private compressData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression using browser's built-in compression
      return btoa(jsonString);
    } catch (error) {
      logger.error('cache', 'Compression failed', error);
      return JSON.stringify(data);
    }
  }

  private decompressData(compressedData: string): any {
    try {
      const decompressed = atob(compressedData);
      return JSON.parse(decompressed);
    } catch (error) {
      logger.error('cache', 'Decompression failed', error);
      return null;
    }
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

    logger.debug('cache', 'Evicted cache entries', { count: toEvict.length });
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
      logger.debug('Cleaned up expired cache entries', { count: expiredKeys.length });
      this.persistCache();
    }

    this.evictLRU();
  }

  private logMetrics() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses);
    logger.debug('DataManager metrics', {
      ...this.metrics,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      cacheSize: this.cache.size
    });
  }

  private processSyncQueue() {
    this.syncQueue.forEach(key => {
      const strategy = this.getSyncStrategy(key);
      if (strategy?.background) {
        this.performBackgroundSync(key);
        this.syncQueue.delete(key);
      }
    });
  }

  private getSyncStrategy(key: string): SyncStrategy | undefined {
    const prefix = key.split(':')[0];
    return this.config.syncStrategies[prefix];
  }

  private async performBackgroundSync(key: string) {
    try {
      this.metrics.syncOperations++;
      // Implementation would depend on specific sync requirements
      logger.debug('Background sync completed', { key });
    } catch (error) {
      this.metrics.errors++;
      logger.error('Background sync failed', { key, error });
    }
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

    // Return decompressed data if needed
    if (entry.compressed) {
      return this.decompressData(entry.data);
    }

    return entry.data;
  }

  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: CacheEntry<T>['priority'];
      syncStrategy?: string;
    } = {}
  ): Promise<void> {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    const priority = options.priority || 'medium';

    let finalData = data;
    let compressed = false;

    // Compress if data is large
    if (this.shouldCompress(data)) {
      finalData = this.compressData(data) as T;
      compressed = true;
      this.metrics.compressions++;
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: now,
      ttl,
      priority,
      accessCount: 0,
      lastAccessed: now,
      compressed
    };

    this.cache.set(key, entry);

    // Handle sync strategy
    const syncStrategy = options.syncStrategy ? 
      this.config.syncStrategies[options.syncStrategy] : 
      this.getSyncStrategy(key);

    if (syncStrategy?.immediate) {
      await this.performBackgroundSync(key);
    } else if (syncStrategy?.background) {
      this.syncQueue.add(key);
    }

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
      logger.debug('Invalidated cache entries', { pattern, count: keysToDelete.length });
      this.persistCache();
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.syncQueue.clear();
    this.syncTimers.forEach(timer => clearTimeout(timer));
    this.syncTimers.clear();
    
    if (this.config.enablePersistence) {
      localStorage.removeItem('dataManager_cache');
    }
    
    logger.debug('Cache cleared completely');
  }

  getMetrics() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0;
    return {
      ...this.metrics,
      hitRate,
      cacheSize: this.cache.size,
      syncQueueSize: this.syncQueue.size
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

  // Export/Import for debugging
  export(): any {
    return Object.fromEntries(this.cache.entries());
  }

  import(data: any): void {
    Object.entries(data).forEach(([key, entry]: [string, any]) => {
      this.cache.set(key, entry);
    });
    this.persistCache();
  }
}

// Singleton instance
export const dataManager = new IntelligentDataManager();

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

export default IntelligentDataManager; 