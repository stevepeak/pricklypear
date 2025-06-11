import { test as base, type Page } from '@playwright/test';

// Extend the base test with custom fixtures
export const test = base.extend<{ withUser: Page }>({
  withUser: async ({ page }, use) => {
    // Navigate to auth page
    await page.goto('/auth');

    // Fill in credentials
    await page
      .getByLabel(/email/i)
      .fill(process.env.TEST_USER_EMAIL || 'hello@prickly.app');
    await page
      .getByLabel(/password/i)
      .fill(process.env.TEST_USER_PASSWORD || 'zdh_FUA6zvw6xpq1mbz');

    // Click login button
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for navigation to complete after login
    await page.waitForURL('**/threads');

    // Use the authenticated page
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';
