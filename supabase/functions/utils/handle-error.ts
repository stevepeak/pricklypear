import * as Sentry from "https://deno.land/x/sentry_deno@0.2.5/mod.ts";

let sentryInitialized = false;

function initSentry() {
  if (sentryInitialized) return;
  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) {
    console.warn("SENTRY_DSN missing, Sentry will not report errors.");
    return;
  }
  Sentry.init({
    dsn,
    tracesSampleRate: 0.0, // No performance traces by default
    environment: Deno.env.get("SENTRY_ENVIRONMENT") ?? "production",
  });
  sentryInitialized = true;
}

/**
 * Reports an error to Sentry and logs it to the console.
 * Safe to call in any catch block.
 */
export function handleError(error: unknown) {
  console.error("Error:", error);
  initSentry();
  if (sentryInitialized) {
    Sentry.captureException(error);
    // Optionally flush events for serverless/short-lived functions
    Sentry.flush(2000).catch(() => {});
  }
}
