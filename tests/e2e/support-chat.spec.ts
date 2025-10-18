import { test, expect } from '@playwright/test';

test.describe('Support Chat Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  test('user can send messages in support thread', async ({ page }) => {
    // Login as regular user (Alice)
    await page.getByRole('button', { name: 'Alice' }).click();
    await page.waitForURL('**/threads');

    // Navigate to support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Verify thread title
    await expect(page.getByTestId('thread-title')).toContainText(
      'Question about Document Storage'
    );

    // Type and send a message with unique identifier
    const composer = page.getByTestId('thread-message-composer');
    const uniqueMsg = `Can you help me with file uploads? [${Date.now()}]`;
    await composer.fill(uniqueMsg);

    // Use platform-specific keyboard shortcut
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Enter' : 'Control+Enter');

    // Verify message appears
    const messageList = page.getByTestId('thread-message-list');
    await expect(
      messageList.getByText(uniqueMsg, { exact: true })
    ).toBeVisible();

    // Verify message is from "You"
    await expect(page.getByText('You').first()).toBeVisible();
  });

  test('admin can view all support threads and reply', async ({ page }) => {
    // Login as support admin
    await page.getByRole('button', { name: 'Support (Admin)' }).click();
    await page.waitForURL('**/threads');

    // Should see support threads in the list
    await expect(
      page.getByText('Question about Document Storage')
    ).toBeVisible();

    // Click on support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Should see messages from the user with their actual name
    await expect(page.getByText('Alice Wonderland')).toBeVisible();

    // Type and send a reply as admin with unique identifier
    const composer = page.getByTestId('thread-message-composer');
    const uniqueMsg = `I can help you with that! [${Date.now()}]`;
    await composer.fill(uniqueMsg);

    // Use platform-specific keyboard shortcut
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Enter' : 'Control+Enter');

    // Wait for message to appear
    const messageList = page.getByTestId('thread-message-list');
    await expect(
      messageList.getByText(uniqueMsg, { exact: true })
    ).toBeVisible();

    // Verify Customer Support label appears in the message list
    await expect(
      messageList.getByText('Customer Support').first()
    ).toBeVisible();
  });

  test('admin sees user names instead of "someone"', async ({ page }) => {
    // Login as support admin
    await page.getByRole('button', { name: 'Support (Admin)' }).click();
    await page.waitForURL('**/threads');

    // Open support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Wait for thread to load
    await page.waitForLoadState('networkidle');

    // Check that messages show actual user names
    const messages = page.getByTestId('thread-message-list');
    await expect(messages.getByText('Alice Wonderland').first()).toBeVisible();

    // Should NOT see "someone" in the messages area
    await expect(messages.getByText('someone', { exact: true })).toHaveCount(0);
  });

  test('admin sees own messages right-aligned', async ({ page }) => {
    // Login as support admin
    await page.getByRole('button', { name: 'Support (Admin)' }).click();
    await page.waitForURL('**/threads');

    // Open support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Wait for thread to load
    await page.waitForLoadState('networkidle');

    // Send a new message as admin with unique identifier
    const composer = page.getByTestId('thread-message-composer');
    const uniqueMsg = `This is my admin reply [${Date.now()}]`;
    await composer.fill(uniqueMsg);

    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Enter' : 'Control+Enter');

    // Wait for message to appear
    const messageList = page.getByTestId('thread-message-list');
    await expect(
      messageList.getByText(uniqueMsg, { exact: true })
    ).toBeVisible();

    // Find the message container with Customer Support label - should be right-aligned for admin viewing their own message
    const messageContainer = messageList
      .locator('div.self-end')
      .filter({ hasText: uniqueMsg });
    await expect(messageContainer).toBeVisible();

    // Verify Customer Support label appears
    await expect(messageContainer.getByText('Customer Support')).toBeVisible();
  });

  test('user sees admin messages left-aligned with Customer Support label', async ({
    page,
  }) => {
    // Login as regular user (Alice)
    await page.getByRole('button', { name: 'Alice' }).click();
    await page.waitForURL('**/threads');

    // Open support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Wait for thread to load
    await page.waitForLoadState('networkidle');

    // Find existing admin/customer support messages from seed data
    const messageList = page.getByTestId('thread-message-list');
    const supportLabel = messageList.getByText('Customer Support').first();

    // Verify customer support label exists when user views admin's messages
    await expect(supportLabel).toBeVisible();

    // The message should be in a left-aligned container (self-start class)
    const messageContainer = supportLabel.locator('..');
    await expect(messageContainer).toHaveClass(/self-start|items-start/);
  });

  test('regular user messages are right-aligned when sent by them', async ({
    page,
  }) => {
    // Login as Alice
    await page.getByRole('button', { name: 'Alice' }).click();
    await page.waitForURL('**/threads');

    // Open support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Send a new message with unique identifier
    const composer = page.getByTestId('thread-message-composer');
    const uniqueMsg = `Thank you for your help! [${Date.now()}]`;
    await composer.fill(uniqueMsg);

    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Enter' : 'Control+Enter');

    // Wait for message to appear
    const messageList = page.getByTestId('thread-message-list');
    await expect(
      messageList.getByText(uniqueMsg, { exact: true })
    ).toBeVisible();

    // Find the message container - should be right-aligned for user viewing their own message
    const messageContainer = messageList
      .locator('div.self-end')
      .filter({ hasText: uniqueMsg });
    await expect(messageContainer).toBeVisible();

    // Verify "You" label appears
    await expect(messageContainer.getByText('You').first()).toBeVisible();
  });

  test('user message triggers insert-message API call', async ({ page }) => {
    // Login as regular user
    await page.getByRole('button', { name: 'Alice' }).click();
    await page.waitForURL('**/threads');

    // Open support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Intercept the insert-message function call
    const messagePromise = page.waitForRequest(
      (request) =>
        request.url().includes('/functions/v1/insert-message') &&
        request.method() === 'POST'
    );

    // Send a message with unique identifier
    const composer = page.getByTestId('thread-message-composer');
    const uniqueMsg = `Urgent: Need help immediately! [${Date.now()}]`;
    await composer.fill(uniqueMsg);

    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Enter' : 'Control+Enter');

    // Verify the API call was made
    const messageRequest = await messagePromise;
    const requestBody = messageRequest.postDataJSON();
    expect(requestBody.text).toBe(uniqueMsg);
    expect(requestBody.type).toBe('user_message');

    // Verify message appears in UI
    const messageList = page.getByTestId('thread-message-list');
    await expect(
      messageList.getByText(uniqueMsg, { exact: true })
    ).toBeVisible();
  });

  test('admin can navigate support threads', async ({ page }) => {
    // Login as support admin
    await page.getByRole('button', { name: 'Support (Admin)' }).click();
    await page.waitForURL('**/threads');

    // Verify support threads are visible
    await expect(
      page.getByText('Question about Document Storage')
    ).toBeVisible();

    // Navigate to support thread
    await page.getByText('Question about Document Storage').click();
    await expect(page.getByTestId('thread-title')).toContainText(
      'Question about Document Storage'
    );

    // Navigate back to threads list (try back button first, then sidebar)
    const backButton = page.getByTestId('back-to-threads');
    const hasBackButton = await backButton.count();

    if (hasBackButton > 0) {
      await backButton.click();
    } else {
      // Use sidebar navigation
      await page.getByRole('link', { name: /threads/i }).click();
    }

    await page.waitForURL('**/threads');

    // Verify we're back at threads list
    await expect(page).toHaveURL(/\/threads$/);
  });

  test('non-admin users cannot see other users support threads', async ({
    page,
  }) => {
    // Login as Bob (not an admin)
    await page.getByRole('button', { name: 'Bob' }).click();
    await page.waitForURL('**/threads');

    // Bob should only see threads he's a participant of
    // He should NOT see Alice's support thread
    const supportThread = page.getByText('Question about Document Storage');
    await expect(supportThread).not.toBeVisible();
  });

  test('admin message type is customer_support', async ({ page }) => {
    // Login as support admin
    await page.getByRole('button', { name: 'Support (Admin)' }).click();
    await page.waitForURL('**/threads');

    // Open support thread
    await page.getByText('Question about Document Storage').click();
    await page.waitForURL(/\/threads\/.+/);

    // Intercept the insert-message API call
    const messagePromise = page.waitForRequest(
      (request) =>
        request.url().includes('/functions/v1/insert-message') &&
        request.method() === 'POST'
    );

    // Send a message as admin with unique identifier
    const composer = page.getByTestId('thread-message-composer');
    const uniqueMsg = `Admin response here [${Date.now()}]`;
    await composer.fill(uniqueMsg);

    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Enter' : 'Control+Enter');

    // Verify the API call has correct message type
    const messageRequest = await messagePromise;
    const requestBody = messageRequest.postDataJSON();
    expect(requestBody.type).toBe('customer_support');

    // Verify message appears with Customer Support label
    const messageList = page.getByTestId('thread-message-list');
    await expect(
      messageList.getByText(uniqueMsg, { exact: true })
    ).toBeVisible();

    // Find the message container and verify it has Customer Support label
    const messageContainer = messageList
      .locator('div')
      .filter({ hasText: uniqueMsg })
      .filter({ has: page.getByText('Customer Support') });
    await expect(messageContainer).toBeVisible();
  });
});
