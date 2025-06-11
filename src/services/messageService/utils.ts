import * as Sentry from '@sentry/react';

export const handleError = (error: unknown, context: string): boolean => {
  Sentry.captureException(error);
  console.error(`Error in ${context}:`, error);
  return false;
};
