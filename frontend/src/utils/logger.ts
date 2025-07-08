/**
 * Enhanced logging utility for the trading bot application
 * Provides consistent logging with different severity levels and request tracking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'api' | 'cache' | 'general' | 'performance' | 'error';

interface LogConfig {
  showTimestamp: boolean;
  showLevel: boolean;
  showCategory: boolean;
  enabled: boolean;
}

// Default configuration for different environments
const LOG_CONFIG: Record<string, Record<LogLevel, LogConfig>> = {
  development: {
    debug: { showTimestamp: true, showLevel: true, showCategory: true, enabled: true },
    info: { showTimestamp: true, showLevel: true, showCategory: true, enabled: true },
    warn: { showTimestamp: true, showLevel: true, showCategory: true, enabled: true },
    error: { showTimestamp: true, showLevel: true, showCategory: true, enabled: true },
  },
  production: {
    debug: { showTimestamp: false, showLevel: false, showCategory: false, enabled: false },
    info: { showTimestamp: false, showLevel: false, showCategory: false, enabled: false },
    warn: { showTimestamp: true, showLevel: true, showCategory: true, enabled: true },
    error: { showTimestamp: true, showLevel: true, showCategory: true, enabled: true },
  },
};

// Get current environment
const ENV = process.env.NODE_ENV || 'development';

// Configure whether to show logs based on environment and level
const shouldLog = (level: LogLevel): boolean => {
  return LOG_CONFIG[ENV][level].enabled;
};

// Format log message with optional components
const formatLogMessage = (
  level: LogLevel,
  category: LogCategory,
  message: string
): string => {
  const config = LOG_CONFIG[ENV][level];
  const parts: string[] = [];

  if (config.showTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }

  if (config.showLevel) {
    parts.push(`[${level.toUpperCase()}]`);
  }

  if (config.showCategory) {
    parts.push(`[${category}]`);
  }

  parts.push(message);

  return parts.join(' ');
};

/**
 * Format and output log messages with appropriate styling and filtering
 */
const logWithLevel = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  ...args: any[]
): void => {
  if (!shouldLog(level)) return;

  const formattedMessage = formatLogMessage(level, category, message);

  switch (level) {
    case 'debug':
      console.debug(formattedMessage, ...args);
      break;
    case 'info':
      console.info(formattedMessage, ...args);
      break;
    case 'warn':
      console.warn(formattedMessage, ...args);
      break;
    case 'error':
      console.error(formattedMessage, ...args);
      break;
  }
};

// Request tracking state
const requestCounts: Record<string, number> = {};
const REQUEST_LOG_THRESHOLD = 5; // Only log every Nth request

// Export the enhanced logger interface
const logger = {
  debug: (category: LogCategory, message: string, ...args: any[]) =>
    logWithLevel('debug', category, message, ...args),
  info: (category: LogCategory, message: string, ...args: any[]) =>
    logWithLevel('info', category, message, ...args),
  warn: (category: LogCategory, message: string, ...args: any[]) =>
    logWithLevel('warn', category, message, ...args),
  error: (category: LogCategory, message: string, ...args: any[]) =>
    logWithLevel('error', category, message, ...args),

  // Special method for API request logging with reduced frequency
  request: (url: string, type: 'new' | 'cached' | 'in-flight') => {
    const key = `${url}-${type}`;
    requestCounts[key] = (requestCounts[key] || 0) + 1;

    // Only log every Nth request to reduce console noise
    if (requestCounts[key] % REQUEST_LOG_THRESHOLD === 1) {
      const message = type === 'new'
        ? `Making API request to: ${url}`
        : type === 'cached'
          ? `Using cached response for: ${url}`
          : `Using in-flight request for: ${url}`;

      logWithLevel('debug', 'api', message);
    }
  },

  // Reset request counts (useful for testing)
  resetRequestCounts: () => {
    Object.keys(requestCounts).forEach(key => delete requestCounts[key]);
  },
};

export type { LogLevel, LogCategory };
export default logger;