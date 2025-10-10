import { test, expect } from './fixtures';

test.describe('Connections Page', () => {
  // TODO: Re-enable once auth fixtures are updated for magic link flow
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

    // Verify success toast
    await expect(page.getByText(/invitation sent/i)).toBeVisible();

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
});
