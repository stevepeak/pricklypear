import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page with sign in and sign up options', async ({
    page,
  }) => {
    await page.goto('/auth');

    // Verify login form elements are present
    await expect(
      page.getByRole('heading', { name: /welcome back/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();

    // Verify sign up link is present
    await expect(page.getByText(/don't have an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('should show sign up form when clicking sign up', async ({ page }) => {
    await page.goto('/auth');

    // Click sign up link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Verify sign up form elements
    await expect(
      page.getByRole('heading', { name: /create your account/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /join the prickly pear/i })
    ).toBeVisible();

    // Verify login link is present
    await expect(page.getByText(/already have an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
  });

  test('should show forgot password form', async ({ page }) => {
    await page.goto('/auth');

    // Click forgot password link
    await page.getByRole('link', { name: /forgot your password/i }).click();

    // Verify forgot password form
    await expect(
      page.getByRole('heading', { name: /reset your password/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /send reset link/i })
    ).toBeVisible();

    // Verify back to login link
    await expect(
      page.getByRole('link', { name: /back to login/i })
    ).toBeVisible();
  });

  // This fails due to concurrency issue with Supabase requests
  test.skip('should show magic link sent confirmation', async ({ page }) => {
    await page.goto('/auth');

    // Switch to sign up
    await page.getByRole('link', { name: /sign up/i }).click();

    // Fill in email and submit
    await page.getByLabel(/email/i).fill('test@prickly.app');
    await page.getByRole('button', { name: /send magic link/i }).click();

    // Verify magic link confirmation
    await expect(
      page.getByRole('heading', { name: /check your email/i })
    ).toBeVisible();
    await expect(page.getByText(/we sent a magic link to/i)).toBeVisible();
    await expect(page.getByText(/test@prickly.app/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /try again/i })).toBeVisible();
  });

  test('should show error message with invalid credentials', async ({
    page,
  }) => {
    await page.goto('/auth');

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();

    // Note: The actual error message will depend on your error handling implementation
    // This test might need adjustment based on how errors are displayed
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });
});
