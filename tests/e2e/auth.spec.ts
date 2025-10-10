import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page with magic link flow', async ({ page }) => {
    await page.goto('/auth');

    // Verify login form elements are present (magic link flow)
    await expect(
      page.getByRole('heading', { name: /sign in to prickly pear/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with email/i })
    ).toBeVisible();

    // Verify magic link info message
    await expect(
      page.getByText(/we'll send you a secure magic link to sign in/i)
    ).toBeVisible();

    // Verify sign up link is present
    await expect(page.getByText(/don't have an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /join now/i })).toBeVisible();
  });

  test('should show sign up form when clicking join now', async ({ page }) => {
    await page.goto('/auth');

    // Click sign up link
    await page.getByRole('link', { name: /join now/i }).click();

    // Verify sign up form elements
    await expect(
      page.getByRole('heading', { name: /join prickly pear/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /join the prickly pear/i })
    ).toBeVisible();

    // Verify magic link info message
    await expect(
      page.getByText(/we'll send you a secure magic link to get started/i)
    ).toBeVisible();

    // Verify login link is present
    await expect(page.getByText(/already have an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  // Skip this test as it requires actual email delivery which depends on Supabase configuration
  // TODO: Mock the sendMagicLink function or use a test email service
  test.skip('should show magic link sent confirmation', async ({ page }) => {
    await page.goto('/auth');

    // Fill in email and submit
    await page.getByLabel(/email/i).fill('test@prickly.app');
    await page.getByRole('button', { name: /continue with email/i }).click();

    // Verify magic link confirmation
    await expect(
      page.getByRole('heading', { name: /check your email/i })
    ).toBeVisible();
    await expect(page.getByText(/we sent a magic link to/i)).toBeVisible();
    await expect(page.getByText(/test@prickly.app/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /try again/i })).toBeVisible();
  });

  test('should toggle between sign in and sign up', async ({ page }) => {
    await page.goto('/auth');

    // Start at sign in
    await expect(
      page.getByRole('heading', { name: /sign in to prickly pear/i })
    ).toBeVisible();

    // Toggle to sign up
    await page.getByRole('link', { name: /join now/i }).click();
    await expect(
      page.getByRole('heading', { name: /join prickly pear/i })
    ).toBeVisible();

    // Toggle back to sign in
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(
      page.getByRole('heading', { name: /sign in to prickly pear/i })
    ).toBeVisible();
  });
});
