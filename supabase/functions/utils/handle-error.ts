import * as Sentry from 'https://deno.land/x/sentry_deno/main.ts';

let sentryInitialized = false;

/**
 * Get the string error message from an unknown value.
 * Makes a best effort at the message to assure a string is always returned.
 */
export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

type ErrorWithMessage = { message: string };

/** Guard for an Error object with a string message property. */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Convert an unknown value to an ErrorWithMessage.
 * Makes a best effort at the message to assure a string is always returned.
 */
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

function initSentry() {
  if (sentryInitialized) return;
  const dsn = Deno.env.get('SENTRY_DSN');
  const environment = Deno.env.get('SENTRY_ENVIRONMENT') ?? 'production';

  if (!dsn) {
    console.warn('SENTRY_DSN missing, Sentry will not report errors.');
    return;
  }

  // Don't initialize Sentry in development
  if (environment === 'development') {
    console.log('Sentry disabled in development environment');
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.0, // No performance traces by default
    environment,
  });
  sentryInitialized = true;
}

/**
 * Reports an error to Sentry and logs it to the console.
 * Safe to call in any catch block.
 */
export function handleError(error: unknown) {
  console.error('Error:', error);
  initSentry();
  if (sentryInitialized) {
    Sentry.captureException(error);
    // Optionally flush events for serverless/short-lived functions
    Sentry.flush(2000).then(() => {});
  }
}
