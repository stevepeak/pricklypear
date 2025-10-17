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
    test.setTimeout(45000); // Increase timeout for CI environment

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

    // Wait for navigation to threads page to complete
    await withUser.waitForURL('/threads', { timeout: 10000 });

    // Wait for the threads table to be visible (increase timeout for CI)
    await expect(withUser.getByRole('table')).toBeVisible({ timeout: 10000 });

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
    test.setTimeout(60000); // Increase timeout to 60s for CI environment (cold starts + OpenAI API calls)

    const messageText = 'what is your specialty?';

    // Wait for composer to be ready and fill message
    const composer = withUser.getByTestId('thread-message-composer');
    await expect(composer).toBeVisible();
    await composer.fill(messageText);

    // Wait for send button to be enabled and click it
    const sendButton = withUser.getByTestId('thread-send-button');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for the message to be sent and appear in the thread
    await expect(
      withUser.getByTestId('thread-message-list').getByText(messageText)
    ).toBeVisible({ timeout: 10000 });

    // Wait for AI response (use scoped selector to avoid multiple matches)
    // Increased timeout to 40s for CI environment where cold starts and API calls can be slower
    await expect(
      withUser.getByTestId('thread-message-list').getByText('Prickly AI')
    ).toBeVisible({ timeout: 40000 });
  });
});

// TODO fix this test
// NOTE: These tests require threads to be created with controls.requireAiApproval = true
// Currently, the UI doesn't expose this setting during thread creation, so these tests are skipped
// When re-enabling, ensure the created threads have AI mediation enabled
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
    await withUser.getByTestId('thread-send-button').click();

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
    await withUser.getByTestId('thread-send-button').click();

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
    await withUser.getByTestId('thread-send-button').click();

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
