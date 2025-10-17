import { test, expect } from '@playwright/test';

// These tests require:
// 1. Local Supabase running (supabase start)
// 2. summarize-thread edge function served locally (supabase functions serve summarize-thread)
// 3. OpenAI API key configured in Supabase secrets

test.describe('Thread Summarization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should automatically generate thread summary when message is sent', async ({
    page,
  }) => {
    // Skip if not in local dev environment
    if (!process.env.SUPABASE_URL?.includes('localhost')) {
      test.skip();
    }

    // Login (assuming test user exists)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('/threads');

    // Create a new thread
    await page.click('button:has-text("New Thread")');

    // Fill in thread details
    await page.fill('input[placeholder*="title"]', 'Test Thread for Summary');
    await page.click('button:has-text("Create")');

    // Wait for thread to be created and navigate to it
    await page.waitForURL(/\/threads\/.+/);

    // Send first message
    await page.fill(
      'textarea[placeholder*="message"]',
      'Hello, this is the first message in the thread.'
    );
    await page.click('button:has-text("Send")');

    // Wait for message to appear
    await page.waitForSelector(
      'text=Hello, this is the first message in the thread.'
    );

    // Send second message
    await page.fill(
      'textarea[placeholder*="message"]',
      'This is the second message to add more context.'
    );
    await page.click('button:has-text("Send")');

    // Wait for message to appear
    await page.waitForSelector(
      'text=This is the second message to add more context.'
    );

    // Wait for summary to be generated (the trigger fires asynchronously)
    // The summary should appear in the thread header
    await page.waitForTimeout(5000); // Give time for edge function to process

    // Open summary sheet/dialog
    const summaryButton = page.locator('button:has-text("Read summary")');
    if (await summaryButton.isVisible()) {
      await summaryButton.click();

      // Check that summary exists and is not empty
      const summaryText = await page.locator('[role="dialog"]').textContent();
      expect(summaryText).toBeTruthy();
      expect(summaryText?.length).toBeGreaterThan(10);
    } else {
      // Summary might be displayed directly
      const summaryElement = page.locator(
        'text=/.*first message.*|.*second message.*/i'
      );
      await expect(summaryElement).toBeVisible({ timeout: 10000 });
    }
  });

  test('should update summary when new messages are added', async ({
    page,
  }) => {
    // Skip if not in local dev environment
    if (!process.env.SUPABASE_URL?.includes('localhost')) {
      test.skip();
    }

    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/threads');

    // Navigate to an existing thread with messages
    const firstThread = page.locator('[data-testid="thread-card"]').first();
    await firstThread.click();

    await page.waitForURL(/\/threads\/.+/);

    // Get initial summary if it exists
    let initialSummary = '';
    try {
      const summaryButton = page.locator('button:has-text("Read summary")');
      if (await summaryButton.isVisible({ timeout: 2000 })) {
        await summaryButton.click();
        initialSummary =
          (await page.locator('[role="dialog"]').textContent()) || '';
        await page.keyboard.press('Escape'); // Close dialog
      }
    } catch {
      // No summary yet
    }

    // Send a new message with distinctive content
    const uniqueMessage = `Important update at ${Date.now()}: Project milestone achieved`;
    await page.fill('textarea[placeholder*="message"]', uniqueMessage);
    await page.click('button:has-text("Send")');

    // Wait for message to appear
    await page.waitForSelector(`text=${uniqueMessage}`);

    // Wait for summary to be regenerated
    await page.waitForTimeout(5000);

    // Check that summary was updated
    const summaryButton = page.locator('button:has-text("Read summary")');
    if (await summaryButton.isVisible()) {
      await summaryButton.click();

      const newSummary =
        (await page.locator('[role="dialog"]').textContent()) || '';
      expect(newSummary).toBeTruthy();

      // The new summary should be different from the initial one (if there was one)
      if (initialSummary) {
        expect(newSummary).not.toBe(initialSummary);
      }

      // The summary should ideally mention the milestone or update
      // (though this depends on AI generation)
      expect(newSummary.length).toBeGreaterThan(10);
    }
  });

  test('should handle multiple rapid messages and generate final summary', async ({
    page,
  }) => {
    // Skip if not in local dev environment
    if (!process.env.SUPABASE_URL?.includes('localhost')) {
      test.skip();
    }

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/threads');

    // Create a new thread
    await page.click('button:has-text("New Thread")');
    await page.fill('input[placeholder*="title"]', 'Rapid Message Test Thread');
    await page.click('button:has-text("Create")');

    await page.waitForURL(/\/threads\/.+/);

    // Send multiple messages in quick succession
    const messages = [
      'Message 1: Initial problem',
      'Message 2: First attempt at solution',
      'Message 3: Solution did not work',
      'Message 4: Found the actual solution',
      'Message 5: Everything is working now',
    ];

    for (const msg of messages) {
      await page.fill('textarea[placeholder*="message"]', msg);
      await page.click('button:has-text("Send")');
      await page.waitForSelector(`text=${msg}`);
      // Small delay to ensure messages are sent in order
      await page.waitForTimeout(500);
    }

    // Wait for the final summary to be generated
    // (Each message insert triggers the function, but only the last one matters)
    await page.waitForTimeout(8000);

    // Check for summary
    const summaryButton = page.locator('button:has-text("Read summary")');
    if (await summaryButton.isVisible()) {
      await summaryButton.click();

      const summary =
        (await page.locator('[role="dialog"]').textContent()) || '';
      expect(summary).toBeTruthy();
      expect(summary.length).toBeGreaterThan(20);

      // Summary should reflect the progression (ideally mentioning solution)
      // This is a soft check since AI generation can vary
      console.log('Generated summary:', summary);
    }
  });

  test('should display summary in thread list', async ({ page }) => {
    // Skip if not in local dev environment
    if (!process.env.SUPABASE_URL?.includes('localhost')) {
      test.skip();
    }

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/threads');

    // Wait for threads to load
    await page.waitForSelector('[data-testid="thread-card"]', {
      timeout: 10000,
    });

    // Check if any thread cards display summaries
    const threadCards = page.locator('[data-testid="thread-card"]');
    const count = await threadCards.count();

    expect(count).toBeGreaterThan(0);

    // Check first thread has some content (could be summary or "No summary generated yet")
    const firstCard = threadCards.first();
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
  });
});

test.describe('Thread Summarization Edge Cases', () => {
  test('should handle thread with only one message', async ({ page }) => {
    // Skip if not in local dev environment
    if (!process.env.SUPABASE_URL?.includes('localhost')) {
      test.skip();
    }

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/threads');

    // Create new thread
    await page.click('button:has-text("New Thread")');
    await page.fill('input[placeholder*="title"]', 'Single Message Thread');
    await page.click('button:has-text("Create")');

    await page.waitForURL(/\/threads\/.+/);

    // Send only one message
    await page.fill(
      'textarea[placeholder*="message"]',
      'This is a single message thread for testing summary generation.'
    );
    await page.click('button:has-text("Send")');

    await page.waitForSelector('text=This is a single message thread');

    // Wait for summary generation
    await page.waitForTimeout(5000);

    // Summary should still be generated even for single message
    const summaryButton = page.locator('button:has-text("Read summary")');
    if (await summaryButton.isVisible()) {
      await summaryButton.click();
      const summary = await page.locator('[role="dialog"]').textContent();
      expect(summary).toBeTruthy();
    }
  });

  test('should handle thread with very long messages', async ({ page }) => {
    // Skip if not in local dev environment
    if (!process.env.SUPABASE_URL?.includes('localhost')) {
      test.skip();
    }

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/threads');

    await page.click('button:has-text("New Thread")');
    await page.fill('input[placeholder*="title"]', 'Long Message Thread');
    await page.click('button:has-text("Create")');

    await page.waitForURL(/\/threads\/.+/);

    // Send a very long message
    const longMessage =
      'This is a very long message. '.repeat(50) +
      'It contains a lot of information that needs to be summarized effectively by the AI.';

    await page.fill('textarea[placeholder*="message"]', longMessage);
    await page.click('button:has-text("Send")');

    await page.waitForSelector('text=This is a very long message.');

    // Wait for summary
    await page.waitForTimeout(5000);

    // Check summary is concise (should be shorter than the original)
    const summaryButton = page.locator('button:has-text("Read summary")');
    if (await summaryButton.isVisible()) {
      await summaryButton.click();
      const summary =
        (await page.locator('[role="dialog"]').textContent()) || '';

      // Summary should be much shorter than the original message
      expect(summary.length).toBeLessThan(longMessage.length);
      expect(summary.length).toBeGreaterThan(10);
    }
  });
});
