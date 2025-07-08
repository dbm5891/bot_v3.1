import axios, { AxiosResponse } from 'axios';
import logger from './logger';

interface CacheItem {
  data: any;
  timestamp: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  enabled: boolean;
}

// Cache configuration with more aggressive caching
const CACHE_CONFIG: Record<string, CacheConfig> = {
  '/api/strategies': { ttl: 300000, enabled: true }, // 5 minutes cache (strategies don't change often)
  '/api/data/available': { ttl: 600000, enabled: true }, // 10 minutes cache
  '/api/symbols': { ttl: 1800000, enabled: true }, // 30 minutes cache (symbols rarely change)
  '/api/backtest/history': { ttl: 120000, enabled: true }, // 2 minutes cache
  '/api/portfolio/performance': { ttl: 30000, enabled: true }, // 30 seconds cache (more dynamic data)
  '/api/market/status': { ttl: 60000, enabled: true }, // 1 minute cache
  '/api/market/data': { ttl: 15000, enabled: true }, // 15 seconds cache
};

// In-memory cache store
const cache: Record<string, CacheItem> = {};

// In-flight requests store
const inFlightRequests: Record<string, Promise<AxiosResponse>> = {};

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache helper functions
const getCacheKey = (config: any): string => {
  return `${config.url}${config.method}${JSON.stringify(config.params)}${JSON.stringify(config.data)}`;
};

const isCacheValid = (cacheItem: CacheItem, ttl: number): boolean => {
  return Date.now() - cacheItem.timestamp < ttl;
};

const getCachedResponse = (config: any): AxiosResponse | null => {
  const cacheKey = getCacheKey(config);
  const cacheConfig = CACHE_CONFIG[config.url];
  
  if (!cacheConfig?.enabled) return null;
  
  const cachedItem = cache[cacheKey];
  if (cachedItem && isCacheValid(cachedItem, cacheConfig.ttl)) {
    return {
      data: cachedItem.data,
      status: 200,
      statusText: 'OK (cached)',
      headers: {},
      config,
    } as AxiosResponse;
  }
  
  return null;
};

const setCachedResponse = (config: any, response: AxiosResponse): void => {
  const cacheKey = getCacheKey(config);
  const cacheConfig = CACHE_CONFIG[config.url];
  
  if (cacheConfig?.enabled) {
    cache[cacheKey] = {
      data: response.data,
      timestamp: Date.now(),
    };
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const cacheKey = getCacheKey(config);
    const url = `${config.baseURL}${config.url}`;

    // Check cache first
    const cachedResponse = getCachedResponse(config);
    if (cachedResponse) {
      logger.request(url, 'cached');
      return Promise.reject({
        config,
        response: cachedResponse,
        isAxiosError: true,
        isCached: true,
      });
    }

    // Check for in-flight requests
    const existingRequest = inFlightRequests[cacheKey];
    if (existingRequest) {
      logger.request(url, 'in-flight');
      const response = await existingRequest;
      return Promise.reject({
        config,
        response,
        isAxiosError: true,
        isCached: true,
      });
    }

    // Create new request and store it
    logger.request(url, 'new');
    const requestPromise = api(config).finally(() => {
      // Clean up in-flight request after it completes
      delete inFlightRequests[cacheKey];
    });
    
    inFlightRequests[cacheKey] = requestPromise;
    return config;
  },
  (error) => {
    logger.error('api', 'Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Cache successful responses
    setCachedResponse(response.config, response);
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.isCached) {
      return Promise.resolve(error.response);
    }

    // Log and handle errors
    logger.error('api', 'Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Add user-friendly error message
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default api; 