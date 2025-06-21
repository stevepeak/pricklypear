// Test setup for Deno functions
// This file sets up the test environment for all Deno tests

// Test environment values
const testEnv = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  STRIPE_SECRET_KEY: 'sk_test_test123',
  STRIPE_WEBHOOK_SECRET: 'whsec_test123',
  STRIPE_PLAN_SKEW: 'prod_test123',
  OPENAI_API_KEY: 'sk-test-openai-key',
  RESEND_API_KEY: 'test-resend-key',
  RESEND_FROM_EMAIL: 'test@example.com',
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test',
  LINEAR_API_KEY: 'test-linear-key',
  LINEAR_TEAM_ID: 'test-team-id',
  SENTRY_DSN: 'https://test@sentry.io/test',
  SENTRY_ENVIRONMENT: 'test',
} as const;

// Set test environment variables
Deno.env.set('TESTING', 'true');
Deno.env.set('NODE_ENV', 'test');
Deno.env.set('DENO_ENV', 'test');
Deno.env.set('SUPABASE_FUNCTIONS_TEST', 'true');

// Set all test environment variables
Object.entries(testEnv).forEach(([key, value]) => {
  Deno.env.set(key, value);
});

// Import the env module to ensure it's loaded with test values
import './utils/env.ts';

// Export test environment for use in tests
export { testEnv };

console.log('Test environment setup complete');
