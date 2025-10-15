import { test as base, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Local Supabase instance for testing
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client for managing test users
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Extend the base test with custom fixtures
export const test = base.extend<{ withUser: Page }>({
  withUser: async ({ page }, use) => {
    // Generate a unique test user email
    const testEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@prickly.test`;
    const testPassword = 'test-password-123';

    // Create test user using admin API
    const { data: userData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });

    if (signUpError) {
      throw new Error(`Failed to create test user: ${signUpError.message}`);
    }

    if (!userData.user) {
      throw new Error('No user data returned from createUser');
    }

    // Sign in as the test user to get a session
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: sessionData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (signInError || !sessionData.session) {
      throw new Error(`Failed to sign in test user: ${signInError?.message}`);
    }

    // Set the auth session in the browser's localStorage
    await page.goto('/');
    await page.evaluate(
      ({ session }) => {
        const authKey = `sb-${new URL('http://localhost:54321').hostname.split('.')[0]}-auth-token`;
        localStorage.setItem(
          authKey,
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user: session.user,
          })
        );
      },
      { session: sessionData.session }
    );

    // Reload to pick up the auth session
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Use the authenticated page
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    // Cleanup: Delete the test user
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
  },
});

export { expect } from '@playwright/test';
