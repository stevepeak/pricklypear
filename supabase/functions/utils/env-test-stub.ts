// Stubbed env module for Deno unit tests. Replaces `utils/env.ts` to avoid the
// heavy validation + environment-variable requirements in tests.
export const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'anon_test_key',
  SUPABASE_SERVICE_ROLE_KEY: 'service_role_test_key',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
  STRIPE_PLAN_SKEW: 'prod_test_123',
  OPENAI_API_KEY: 'sk-openai',
  RESEND_API_KEY: 'resend_api_key',
  RESEND_FROM_EMAIL: 'test@example.com',
  SLACK_WEBHOOK_URL: 'https://slack.test',
  LINEAR_API_KEY: 'linear_key',
  LINEAR_TEAM_ID: 'linear_team',
  SENTRY_DSN: '',
  SENTRY_ENVIRONMENT: 'test',
} as const;
