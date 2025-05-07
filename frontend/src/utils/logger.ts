/**
 * Simple logging utility for the trading bot application
 * Provides consistent logging with different severity levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configure whether to show logs in production (you might want to disable some in production)
const shouldLog = (level: LogLevel): boolean => {
  // In production, you might want to filter out some log levels
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, only show warnings and errors by default
    return ['warn', 'error'].includes(level);
  }
  
  // In development, show all logs
  return true;
};

/**
 * Format and output log messages with timestamp and appropriate styling
 */
const logWithLevel = (level: LogLevel, message: string, ...args: any[]): void => {
  if (!shouldLog(level)) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  switch (level) {
    case 'debug':
      console.debug(`${prefix} ${message}`, ...args);
      break;
    case 'info':
      console.info(`${prefix} ${message}`, ...args);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`, ...args);
      break;
    case 'error':
      console.error(`${prefix} ${message}`, ...args);
      break;
  }
};

// Export the logger interface
const logger = {
  debug: (message: string, ...args: any[]) => logWithLevel('debug', message, ...args),
  info: (message: string, ...args: any[]) => logWithLevel('info', message, ...args),
  warn: (message: string, ...args: any[]) => logWithLevel('warn', message, ...args),
  error: (message: string, ...args: any[]) => logWithLevel('error', message, ...args),
};

export default logger;