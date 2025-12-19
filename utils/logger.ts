/**
 * Logger utility for Song Streak
 *
 * Provides conditional logging that only outputs in development mode.
 * This prevents console.log statements from appearing in production builds.
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.log('Debug info', data);
 *   logger.error('Error occurred', error);
 */

// Check if we're in development mode
// __DEV__ is a global variable set by React Native/Expo
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

/**
 * Development-only logger
 * - log, warn, debug: Only output in development
 * - error: Always output (errors should always be logged)
 */
export const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log errors (always, even in production)
   * Errors should always be captured for debugging
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log info with a specific tag/category (development only)
   */
  tagged: (tag: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[${tag}]`, ...args);
    }
  },
};

export default logger;
