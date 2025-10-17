import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // Stripe - optional in development
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PLAN_SKEW: z.string().optional(),

  // OpenAI - optional in development
  OPENAI_API_KEY: z.string().optional(),

  // Email (Resend) - optional in development
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // Slack - optional in development
  SLACK_WEBHOOK_URL: z.string().optional(),

  // Linear
  LINEAR_API_KEY: z.string().optional(),
  LINEAR_TEAM_ID: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('production'),
});

function parseEnv(): z.infer<typeof envSchema> {
  const envVars = {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
    SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET'),
    STRIPE_PLAN_SKEW: Deno.env.get('STRIPE_PLAN_SKEW'),
    OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY'),
    RESEND_API_KEY: Deno.env.get('RESEND_API_KEY'),
    RESEND_FROM_EMAIL: Deno.env.get('RESEND_FROM_EMAIL'),
    SLACK_WEBHOOK_URL: Deno.env.get('SLACK_WEBHOOK_URL'),
    LINEAR_API_KEY: Deno.env.get('LINEAR_API_KEY'),
    LINEAR_TEAM_ID: Deno.env.get('LINEAR_TEAM_ID'),
    SENTRY_DSN: Deno.env.get('SENTRY_DSN'),
    SENTRY_ENVIRONMENT: Deno.env.get('SENTRY_ENVIRONMENT'),
  };

  // Check if we're likely in test mode (all required env vars are missing)
  const allRequiredMissing =
    !envVars.SUPABASE_URL &&
    !envVars.SUPABASE_ANON_KEY &&
    !envVars.SUPABASE_SERVICE_ROLE_KEY;

  // If all required vars are missing, we're probably in test mode - provide defaults
  if (allRequiredMissing) {
    return {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      SENTRY_ENVIRONMENT: 'test',
    } as z.infer<typeof envSchema>;
  }

  const result = envSchema.safeParse(envVars);

  if (!result.success) {
    const errors = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errors}`);
  }

  // Return parsed data if valid
  return result.data;
}

export const env = parseEnv();
