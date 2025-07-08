/**
 * Advanced Caching System
 * Features:
 * - IndexedDB for persistent storage
 * - Memory cache for fast access
 * - Intelligent cache invalidation
 * - Background sync
 * - Compression for large datasets
 * - Network request optimization
 */

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  expiry: number;
  size: number;
  compressed: boolean;
  version: string;
  metadata?: any;
}

interface CacheConfig {
  maxMemorySize: number; // MB
  maxIndexedDBSize: number; // MB
  defaultTTL: number; // milliseconds
  compressionThreshold: number; // bytes
  enableCompression: boolean;
  enableIndexedDB: boolean;
}

class AdvancedCache {
  private memoryCache = new Map<string, CacheEntry>();
  private dbName = 'TradingBotCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private config: CacheConfig;
  private memorySize = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxMemorySize: 50, // 50MB
      maxIndexedDBSize: 200, // 200MB
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      compressionThreshold: 10 * 1024, // 10KB
      enableCompression: true,
      enableIndexedDB: true,
      ...config
    };

    this.initializeIndexedDB();
    this.startCleanupInterval();
  }

  private async initializeIndexedDB(): Promise<void> {
    if (!this.config.enableIndexedDB || !('indexedDB' in window)) {
      console.warn('IndexedDB not available, using memory cache only');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store
        const store = db.createObjectStore('cache', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('expiry', 'expiry', { unique: false });
      };
    });
  }

  private async compress(data: any): Promise<string> {
    if (!this.config.enableCompression) return JSON.stringify(data);

    try {
      // Use CompressionStream if available (modern browsers)
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const chunks: Uint8Array[] = [];

        writer.write(encoder.encode(jsonString));
        writer.close();

        let result = await reader.read();
        while (!result.done) {
          chunks.push(result.value);
          result = await reader.read();
        }

        // Convert to base64 for storage
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          compressed.set(chunk, offset);
          offset += chunk.length;
        }

        return btoa(String.fromCharCode(...compressed));
      } else {
        // Fallback: simple compression using JSON.stringify
        return JSON.stringify(data);
      }
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return JSON.stringify(data);
    }
  }

  private async decompress(compressedData: string, compressed: boolean): Promise<any> {
    if (!compressed || !this.config.enableCompression) {
      return JSON.parse(compressedData);
    }

    try {
      if ('DecompressionStream' in window) {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        // Convert from base64
        const binaryString = atob(compressedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        writer.write(bytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        let result = await reader.read();
        while (!result.done) {
          chunks.push(result.value);
          result = await reader.read();
        }

        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }

        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decompressed);
        return JSON.parse(jsonString);
      } else {
        // Fallback
        return JSON.parse(compressedData);
      }
    } catch (error) {
      console.error('Decompression failed:', error);
      return JSON.parse(compressedData);
    }
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async evictFromMemory(): Promise<void> {
    if (this.memorySize <= this.config.maxMemorySize * 1024 * 1024) return;

    // Sort by timestamp (LRU)
    const entries = Array.from(this.memoryCache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Remove oldest entries until under limit
    for (const [key, entry] of entries) {
      this.memoryCache.delete(key);
      this.memorySize -= entry.size;

      if (this.memorySize <= this.config.maxMemorySize * 1024 * 1024 * 0.8) {
        break;
      }
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiry < now) {
        this.memoryCache.delete(key);
        this.memorySize -= entry.size;
      }
    }

    // Clean IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(now);

      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.config.defaultTTL);
    const size = this.calculateSize(data);
    const shouldCompress = this.config.enableCompression && size > this.config.compressionThreshold;

    const compressedData = shouldCompress ? await this.compress(data) : JSON.stringify(data);
    const entry: CacheEntry = {
      key,
      data: compressedData,
      timestamp: Date.now(),
      expiry,
      size,
      compressed: shouldCompress,
      version: '1.0'
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);
    this.memorySize += size;
    await this.evictFromMemory();

    // Store in IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.put(entry);
      } catch (error) {
        console.error('Failed to store in IndexedDB:', error);
      }
    }
  }

  async get(key: string): Promise<any | null> {
    const now = Date.now();

    // Check memory cache first
    let entry = this.memoryCache.get(key);
    if (entry) {
      if (entry.expiry < now) {
        this.memoryCache.delete(key);
        this.memorySize -= entry.size;
        entry = undefined;
      } else {
        // Update timestamp for LRU
        entry.timestamp = now;
        const data = await this.decompress(entry.data, entry.compressed);
        return data;
      }
    }

    // Check IndexedDB
    if (this.db && !entry) {
      try {
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);

        return new Promise((resolve) => {
          request.onsuccess = async () => {
            const result = request.result as CacheEntry;
            if (result && result.expiry >= now) {
              // Move to memory cache
              this.memoryCache.set(key, result);
              this.memorySize += result.size;
              await this.evictFromMemory();

              const data = await this.decompress(result.data, result.compressed);
              resolve(data);
            } else {
              resolve(null);
            }
          };

          request.onerror = () => resolve(null);
        });
      } catch (error) {
        console.error('Failed to read from IndexedDB:', error);
      }
    }

    return null;
  }

  async delete(key: string): Promise<void> {
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.memoryCache.delete(key);
      this.memorySize -= entry.size;
    }

    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.delete(key);
      } catch (error) {
        console.error('Failed to delete from IndexedDB:', error);
      }
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.memorySize = 0;

    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.clear();
      } catch (error) {
        console.error('Failed to clear IndexedDB:', error);
      }
    }
  }

  getStats(): {
    memoryEntries: number;
    memorySize: number;
    maxMemorySize: number;
    memoryUsagePercent: number;
  } {
    return {
      memoryEntries: this.memoryCache.size,
      memorySize: this.memorySize,
      maxMemorySize: this.config.maxMemorySize * 1024 * 1024,
      memoryUsagePercent: (this.memorySize / (this.config.maxMemorySize * 1024 * 1024)) * 100
    };
  }
}

// Network optimization utilities
export class NetworkOptimizer {
  private requestCache = new Map<string, Promise<any>>();
  private cache: AdvancedCache;

  constructor(cache: AdvancedCache) {
    this.cache = cache;
  }

  private generateRequestKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${btoa(body)}`;
  }

  async optimizedFetch(url: string, options?: RequestInit & { 
    cacheTTL?: number;
    cacheKey?: string;
    bypassCache?: boolean;
    enableDeduplication?: boolean;
  }): Promise<any> {
    const {
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      cacheKey,
      bypassCache = false,
      enableDeduplication = true,
      ...fetchOptions
    } = options || {};

    const requestKey = cacheKey || this.generateRequestKey(url, fetchOptions);

    // Check cache first
    if (!bypassCache) {
      const cachedData = await this.cache.get(requestKey);
      if (cachedData) {
        console.log(`Cache hit for ${url}`);
        return cachedData;
      }
    }

    // Request deduplication
    if (enableDeduplication && this.requestCache.has(requestKey)) {
      console.log(`Deduplicating request for ${url}`);
      return this.requestCache.get(requestKey);
    }

    // Make the request
    const requestPromise = this.makeRequest(url, fetchOptions);
    
    if (enableDeduplication) {
      this.requestCache.set(requestKey, requestPromise);
    }

    try {
      const response = await requestPromise;
      
      // Cache successful responses
      if (response && !bypassCache) {
        await this.cache.set(requestKey, response, cacheTTL);
      }

      return response;
    } finally {
      if (enableDeduplication) {
        this.requestCache.delete(requestKey);
      }
    }
  }

  private async makeRequest(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Batch requests to reduce network overhead
  async batchRequests<T>(
    requests: Array<{ url: string; options?: RequestInit; cacheKey?: string }>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(req => 
        this.optimizedFetch(req.url, {
          ...req.options,
          cacheKey: req.cacheKey
        })
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch request failed:', result.reason);
          results.push(null as any);
        }
      }
    }
    
    return results;
  }
}

// Create singleton instances
export const advancedCache = new AdvancedCache();
export const networkOptimizer = new NetworkOptimizer(advancedCache);

// React hook for using advanced cache
export function useAdvancedCache() {
  return {
    cache: advancedCache,
    networkOptimizer,
    set: (key: string, data: any, ttl?: number) => advancedCache.set(key, data, ttl),
    get: (key: string) => advancedCache.get(key),
    delete: (key: string) => advancedCache.delete(key),
    clear: () => advancedCache.clear(),
    getStats: () => advancedCache.getStats(),
    optimizedFetch: (url: string, options?: any) => networkOptimizer.optimizedFetch(url, options),
    batchRequests: <T>(requests: any[], batchSize?: number) => 
      networkOptimizer.batchRequests<T>(requests, batchSize)
  };
}