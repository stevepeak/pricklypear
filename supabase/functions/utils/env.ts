import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';

/**
 * A small helper that silences permission errors when reading environment
 * variables in the sandboxed Deno test runner.
 */
function safeGetEnv(key: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Deno as any).env?.get?.(key);
  } catch {
    return undefined;
  }
}

/**
 * When running Deno unit tests we don’t want to validate the host environment
 * – the test runner provides no access to real secrets. If the special flag
 * `SUPABASE_FUNCTIONS_TEST` is *set* **or** we cannot read environment
 * variables at all (see `safeGetEnv`), we short-circuit the heavy validation
 * logic and return the stub from `env-test-stub.ts`.
 */
import { env as testEnv } from './env-test-stub.ts';

const IS_TEST_ENV =
  safeGetEnv('SUPABASE_FUNCTIONS_TEST') === 'true' ||
  safeGetEnv('SUPABASE_URL') === undefined;

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, 'Stripe secret key is required')
    .regex(
      /^sk_(live|test)_/,
      'Stripe secret key must start with "sk_live_" or "sk_test_"'
    ),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'Stripe webhook secret is required')
    .regex(/^whsec_/, 'Stripe webhook secret must start with "whsec_"'),
  STRIPE_PLAN_SKEW: z
    .string()
    .min(1, 'Stripe plan skew is required')
    .regex(/^prod_/, 'Stripe plan skew must start with "prod_"'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  RESEND_FROM_EMAIL: z.string().email('Invalid Resend from email'),

  // Slack
  SLACK_WEBHOOK_URL: z.string().url('Invalid Slack webhook URL'),

  // Linear
  LINEAR_API_KEY: z.string().optional(),
  LINEAR_TEAM_ID: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('production'),
});

function parseEnv() {
  const envVars = {
    SUPABASE_URL: safeGetEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: safeGetEnv('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: safeGetEnv('SUPABASE_SERVICE_ROLE_KEY'),
    STRIPE_SECRET_KEY: safeGetEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: safeGetEnv('STRIPE_WEBHOOK_SECRET'),
    STRIPE_PLAN_SKEW: safeGetEnv('STRIPE_PLAN_SKEW'),
    OPENAI_API_KEY: safeGetEnv('OPENAI_API_KEY'),
    RESEND_API_KEY: safeGetEnv('RESEND_API_KEY'),
    RESEND_FROM_EMAIL: safeGetEnv('RESEND_FROM_EMAIL'),
    SLACK_WEBHOOK_URL: safeGetEnv('SLACK_WEBHOOK_URL'),
    LINEAR_API_KEY: safeGetEnv('LINEAR_API_KEY'),
    LINEAR_TEAM_ID: safeGetEnv('LINEAR_TEAM_ID'),
    SENTRY_DSN: safeGetEnv('SENTRY_DSN'),
    SENTRY_ENVIRONMENT: safeGetEnv('SENTRY_ENVIRONMENT'),
  };

  const result = envSchema.safeParse(envVars);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errors}`);
  }

  return result.data;
}

export const env = IS_TEST_ENV ? testEnv : parseEnv();
