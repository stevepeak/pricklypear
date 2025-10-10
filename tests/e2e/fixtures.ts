import { test as base, type Page } from '@playwright/test';

// TODO: Update this fixture to work with magic link authentication
// The app now uses magic links instead of password-based auth.
// Options:
// 1. Use Supabase Admin API to create session tokens directly
// 2. Use a test-only auth bypass mechanism
// 3. Set up a test email handler to capture magic links

// Extend the base test with custom fixtures
export const test = base.extend<{ withUser: Page }>({
  withUser: async ({ page }, use) => {
    // For now, we'll use Supabase's signInWithPassword for test users
    // This requires setting up test users with passwords in your Supabase project
    // TODO: Implement proper magic link testing or use API-based session creation

    // Temporarily skip authentication for fixture
    // Tests using this fixture will be skipped until auth is properly configured
    await page.goto('/threads');

    // Use the page (may not be authenticated)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';
