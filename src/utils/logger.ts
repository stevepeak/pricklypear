import * as Sentry from '@sentry/react';

/**
 * Check if we're in development mode
 */
const isDevelopment = () => {
  return (
    import.meta.env?.VITE_VERCEL_ENV === 'development' ||
    import.meta.env.DEV ||
    process.env.NODE_ENV === 'development'
  );
};

/**
 * Centralized logging utility that:
 * - Respects environment (development vs production)
 * - Integrates with Sentry for error reporting
 * - Provides typed log levels
 */
export const logger = {
  /**
   * Log debug messages (only in development)
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment()) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment()) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log warning messages (always logged)
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
    if (!isDevelopment()) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: { args },
      });
    }
  },

  /**
   * Log error messages (always logged, sent to Sentry only in production)
   */
  error: (message: string, error?: unknown, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...args);

    // Only send to Sentry in production
    if (!isDevelopment()) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: { message, args },
        });
      } else if (error) {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: { error, args },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: { args },
        });
      }
    }
  },
};

/**
 * Log an error with context (convenience wrapper)
 */
export const logError = (context: string, error: unknown): void => {
  logger.error(`Error in ${context}`, error);
};
