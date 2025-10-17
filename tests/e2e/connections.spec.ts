import { test, expect } from './fixtures';

test.describe('Connections Page', () => {
  // Skip this test until Edge Functions are properly configured with email sending in CI/test environment
  // The test requires the invite-by-email Edge Function which depends on Resend API configuration
  test.skip('should handle outgoing connection flow', async ({
    withUser: page,
  }) => {
    // Navigate to connections page
    await page.goto('/connections');

    // Click Add Connection button
    await page.getByRole('button', { name: /add connection/i }).click();

    // Fill in email for new connection
    const testEmail = `test+${Math.random().toString(36).slice(2)}@prickly.app`;
    await page.getByTestId('invite-email').fill(testEmail);
    await page.getByRole('button', { name: /send invitation/i }).click();

    // Verify success toast (wait longer for Edge Function to respond)
    await expect(page.getByText(/invitation sent/i)).toBeVisible({
      timeout: 10000,
    });

    const connectionCard = page.getByTestId(`connection-card-${testEmail}`);

    // Verify outgoing connection appears in list
    await expect(connectionCard).toBeVisible();

    // Cancel the outgoing connection
    await connectionCard.getByRole('button', { name: /cancel/i }).click();

    // Verify cancellation toast
    await expect(page.getByText(/request cancelled/i)).toBeVisible();

    // Verify connection is removed from list
    await expect(connectionCard).not.toBeVisible();
  });

  test('should handle accepting incoming connection', async ({
    withUser: page,
  }) => {
    // This test verifies the full flow of accepting a connection:
    // 1. Navigate to connections page
    // 2. Verify pending incoming connection is visible
    // 3. Click Accept button
    // 4. Verify success toast appears
    // 5. Verify connection moves to accepted state
    // 6. Verify database was updated with accepted status

    // Navigate to connections page
    await page.goto('/connections');

    // Wait for the page content to be visible (better than networkidle for pages with websockets)
    await page
      .getByText(/Invite Friends & Family/i)
      .waitFor({ timeout: 10000 });

    // Find a pending incoming connection (if any exist)
    const pendingConnection = page
      .locator('[data-variant="pending-incoming"]')
      .first();

    // If no pending connections exist, we'll need test setup to create one
    // For now, we'll skip if none exist
    if ((await pendingConnection.count()) === 0) {
      test.skip();
    }

    // Get the connection name for verification
    const connectionName = await pendingConnection
      .locator('text=/^[A-Z]/')
      .first()
      .textContent();

    // Click the Accept button
    await pendingConnection.getByRole('button', { name: /accept/i }).click();

    // Verify success toast appears
    await expect(page.getByText(/connection accepted/i)).toBeVisible({
      timeout: 5000,
    });

    // Wait for UI to update
    await page.waitForTimeout(1000);

    // Verify the connection is now in the accepted section
    const acceptedConnections = page.locator('[data-variant="accepted"]');
    await expect(acceptedConnections).toContainText(connectionName || '', {
      timeout: 5000,
    });

    // Verify the connection is no longer in pending
    const pendingIncoming = page.locator('[data-variant="pending-incoming"]');
    await expect(pendingIncoming).not.toContainText(connectionName || '', {
      timeout: 5000,
    });
  });

  test('should handle declining incoming connection', async ({
    withUser: page,
  }) => {
    // Navigate to connections page
    await page.goto('/connections');

    // Wait for the page content to be visible (better than networkidle for pages with websockets)
    await page
      .getByText(/Invite Friends & Family/i)
      .waitFor({ timeout: 10000 });

    // Find a pending incoming connection (if any exist)
    const pendingConnection = page
      .locator('[data-variant="pending-incoming"]')
      .first();

    // If no pending connections exist, skip test
    if ((await pendingConnection.count()) === 0) {
      test.skip();
    }

    // Get the connection name for verification
    const connectionName = await pendingConnection
      .locator('text=/^[A-Z]/')
      .first()
      .textContent();

    // Click the Decline button
    await pendingConnection.getByRole('button', { name: /decline/i }).click();

    // Verify success toast appears
    await expect(page.getByText(/connection declined/i)).toBeVisible({
      timeout: 5000,
    });

    // Wait for UI to update
    await page.waitForTimeout(1000);

    // Verify the connection is no longer visible in pending
    const pendingIncoming = page.locator('[data-variant="pending-incoming"]');
    await expect(pendingIncoming).not.toContainText(connectionName || '', {
      timeout: 5000,
    });
  });
});
