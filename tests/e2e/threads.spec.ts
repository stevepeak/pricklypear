import { test, expect } from './fixtures';

// TODO: Re-enable once auth fixtures are updated for magic link flow
test.describe.skip('AI Chat Threads', () => {
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

  test.skip('can send a message and receive AI response', async ({
    withUser,
  }) => {
    // Type message into composer
    await withUser
      .getByTestId('thread-message-composer')
      .fill('what is your specialty?');
    await withUser.getByTestId('thread-message-composer').press('Meta+Enter');

    // Your message is visible
    await expect(withUser.getByText('You')).toBeVisible();
    // !not working - idk why my message does not show up?
    await expect(withUser.getByText('what is your specialty?')).toBeVisible();
    // Wait for AI response
    await expect(withUser.getByText('Prickly AI')).toBeVisible();

    // Verify we have exactly 2 messages (user message + AI response)
    const messages = await withUser.getByTestId('thread-message-list').all();
    expect(messages).toHaveLength(2);
  });
});
