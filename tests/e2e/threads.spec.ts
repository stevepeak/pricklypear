import { test, expect } from './fixtures';

test.describe('AI Chat Threads', () => {
  test.beforeEach(async ({ withUser }) => {
    // Set viewport to desktop size
    await withUser.setViewportSize({ width: 1024, height: 768 });

    // Navigate to threads page
    await withUser.goto('/threads');

    // Open new thread dialog
    await withUser.getByRole('button', { name: /new thread/i }).click();
    await expect(withUser.getByRole('dialog')).toBeVisible();

    // Select AI thread type
    await withUser.getByRole('tab', { name: /ai/i }).click();

    // Create the thread
    await withUser.getByTestId('create-thread-button').click();

    // Verify we're on the new thread page
    await expect(withUser).toHaveURL(/\/threads\/[0-9a-f-]+$/);
    await expect(withUser.getByTestId('thread-title')).toBeVisible();
  });

  test.afterAll(async () => {
    // TODO delete all my threads
  });

  test('can archive a thread', async ({ withUser }) => {
    // Get the thread ID from the URL
    const threadId = withUser.url().split('/').pop();

    // Click the dropdown menu
    await withUser.getByTestId('composer-actions-button').click();

    // Click archive option
    await withUser
      .getByTestId('composer-actions-options')
      .getByRole('menuitem', { name: /archive/i })
      .click();

    // Verify toast notification appears
    await expect(withUser.getByText('Thread archived')).toBeVisible();
    await expect(
      withUser.getByText('This thread has been archived.')
    ).toBeVisible();

    // Verify we're redirected to threads page
    await expect(withUser).toHaveURL('/threads');

    // Wait for the threads table to be visible
    await expect(withUser.getByRole('table')).toBeVisible();

    // Verify thread is not visible in the list
    await expect(
      withUser.getByTestId(`thread-tr-${threadId}`).getByText('Archived')
    ).toBeVisible();
  });

  test('can edit a thread title', async ({ withUser }) => {
    // Click the thread title to enter edit mode
    await withUser.getByTestId('thread-title').click();

    // Fill in the new title
    await withUser.getByTestId('thread-title-input').fill('New Title');

    // Press Enter to save the changes
    await withUser.getByTestId('thread-title-input').press('Enter');

    // Verify the title was updated
    await expect(withUser.getByTestId('thread-title')).toHaveText('New Title');
  });

  test('can send a message and receive AI response', async ({ withUser }) => {
    // Type message into composer
    await withUser
      .getByTestId('thread-message-composer')
      .fill('what is your specialty?');
    await withUser.getByTestId('thread-message-composer').press('Meta+Enter');

    // Wait for the message to be sent and AI to respond
    // Look for the user's message in the thread
    await expect(
      withUser
        .getByTestId('thread-message-list')
        .getByText('what is your specialty?')
    ).toBeVisible({ timeout: 5000 });

    // Wait for AI response (use scoped selector to avoid multiple matches)
    await expect(
      withUser.getByTestId('thread-message-list').getByText('Prickly AI')
    ).toBeVisible({ timeout: 10000 });
  });
});

// TODO fix this test
test.describe.skip('Message Review (Default Threads)', () => {
  test.beforeEach(async ({ withUser }) => {
    // Set viewport to desktop size
    await withUser.setViewportSize({ width: 1024, height: 768 });

    // Navigate to threads page
    await withUser.goto('/threads');

    // Open new thread dialog
    await withUser.getByRole('button', { name: /new thread/i }).click();
    await expect(withUser.getByRole('dialog')).toBeVisible();

    // Select Chat thread type (not AI)
    await withUser.getByRole('tab', { name: /chat/i }).click();

    // Create the thread
    await withUser.getByTestId('create-thread-button').click();

    // Verify we're on the new thread page
    await expect(withUser).toHaveURL(/\/threads\/[0-9a-f-]+$/);
    await expect(withUser.getByTestId('thread-title')).toBeVisible();
  });

  test('can send original message after review', async ({ withUser }) => {
    // Type a message that will trigger review
    const originalMessage = 'you need to fix this now';
    await withUser.getByTestId('thread-message-composer').fill(originalMessage);
    await withUser.getByTestId('thread-message-composer').press('Meta+Enter');

    // Wait for review dialog to appear
    await expect(withUser.getByTestId('message-review-dialog')).toBeVisible({
      timeout: 10000,
    });

    // Verify we can see the review dialog content
    await expect(
      withUser.getByRole('heading', { name: /review your message/i })
    ).toBeVisible();

    // Click "Send without revision" button
    await withUser.getByTestId('send-original-button').click();

    // Verify toast notification appears
    await expect(withUser.getByText('Message sent')).toBeVisible();
    await expect(
      withUser.getByText('Your original message was sent without revision')
    ).toBeVisible();

    // Verify the original message appears in the thread
    await expect(
      withUser.getByTestId('thread-message-list').getByText(originalMessage)
    ).toBeVisible({ timeout: 5000 });
  });

  test('can accept reviewed message', async ({ withUser }) => {
    // Type a message that will trigger review
    const originalMessage = 'this is terrible and you are wrong';
    await withUser.getByTestId('thread-message-composer').fill(originalMessage);
    await withUser.getByTestId('thread-message-composer').press('Meta+Enter');

    // Wait for review dialog to appear
    await expect(withUser.getByTestId('message-review-dialog')).toBeVisible({
      timeout: 10000,
    });

    // Verify we can see the AI suggested rephrasing
    await expect(withUser.getByText(/ai suggested rephrasing/i)).toBeVisible();

    // Click "Accept & Send" button
    await withUser.getByTestId('accept-reviewed-button').click();

    // Verify toast notification appears
    await expect(withUser.getByText('Message sent')).toBeVisible();
    await expect(
      withUser.getByText('Your message has been reviewed and sent')
    ).toBeVisible();

    // Verify a message appears in the thread (should be the reviewed version, not the original)
    await expect(
      withUser.getByTestId('thread-message-list').getByRole('article')
    ).toBeVisible({ timeout: 5000 });

    // Verify the original harsh message does NOT appear
    await expect(
      withUser.getByTestId('thread-message-list').getByText(originalMessage)
    ).not.toBeVisible();
  });

  test('auto-accept sends message without review dialog', async ({
    withUser,
  }) => {
    // First, enable auto-accept
    await withUser.getByTestId('composer-actions-button').click();
    await expect(
      withUser.getByTestId('composer-actions-options')
    ).toBeVisible();

    // Toggle the auto-accept switch on
    await withUser.getByTestId('auto-accept-switch').click();

    // Close the dropdown menu by clicking elsewhere
    await withUser.getByTestId('thread-title').click();

    // Type a message
    const testMessage = 'this should send directly without review';
    await withUser.getByTestId('thread-message-composer').fill(testMessage);
    await withUser.getByTestId('thread-message-composer').press('Meta+Enter');

    // Verify the review dialog does NOT appear
    await expect(
      withUser.getByTestId('message-review-dialog')
    ).not.toBeVisible();

    // Verify the message appears in the thread directly
    await expect(
      withUser.getByTestId('thread-message-list').getByText(testMessage)
    ).toBeVisible({ timeout: 5000 });
  });
});
