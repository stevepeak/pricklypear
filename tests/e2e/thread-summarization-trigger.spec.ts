import { test, expect } from './fixtures';
import { createClient } from '@supabase/supabase-js';

// Local Supabase instance for testing
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

test.describe('Thread Summarization Trigger', () => {
  test('should automatically update thread summary when message is inserted', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create a test user
    const testEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@prickly.test`;
    const testPassword = 'test-password-123';

    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });

    if (userError || !userData.user) {
      throw new Error(
        `Failed to create test user: ${userError?.message || 'No user data'}`
      );
    }

    const userId = userData.user.id;

    try {
      // Wait a moment for profile to be auto-created by trigger
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the profile name (profile should be auto-created)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: 'Test User',
        })
        .eq('id', userId);

      if (profileError) {
        console.warn(`Failed to update profile: ${profileError.message}`);
      }

      // Create a thread without AI approval requirement (skip AI moderation)
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .insert({
          title: 'Test Thread for Summarization Trigger',
          topic: 'parenting_time',
          type: 'default',
          status: 'Open',
          controls: { requireAiApproval: false }, // Skip AI moderation
          created_by: userId,
        })
        .select('id')
        .single();

      if (threadError || !threadData?.id) {
        throw new Error(
          `Failed to create thread: ${threadError?.message || 'No thread data'}`
        );
      }

      const threadId = threadData.id;

      // Add the user as a participant
      const { error: participantError } = await supabase
        .from('thread_participants')
        .insert({
          thread_id: threadId,
          user_id: userId,
        });

      if (participantError) {
        throw new Error(
          `Failed to add participant: ${participantError.message}`
        );
      }

      // Insert multiple messages to provide context for summarization
      const messages = [
        'Hello, I need help with a scheduling issue.',
        'I want to change the pickup time from 3pm to 4pm on Fridays.',
        'The current schedule is not working for me.',
      ];

      for (const messageText of messages) {
        const { error: messageError } = await supabase.from('messages').insert({
          user_id: userId,
          text: messageText,
          thread_id: threadId,
          timestamp: new Date().toISOString(),
          type: 'user_message',
        });

        if (messageError) {
          throw new Error(`Failed to insert message: ${messageError.message}`);
        }

        // Small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Wait for the trigger to fire and the edge function to complete
      // The trigger has a 7000ms timeout, so we wait a bit longer
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Check if the thread summary was updated
      const { data: updatedThread, error: fetchError } = await supabase
        .from('threads')
        .select('summary')
        .eq('id', threadId)
        .single();

      if (fetchError) {
        throw new Error(
          `Failed to fetch updated thread: ${fetchError.message}`
        );
      }

      // Verify the summary was generated
      expect(updatedThread?.summary).toBeTruthy();
      expect(updatedThread?.summary).not.toBe('');
      expect(updatedThread?.summary?.length).toBeGreaterThan(20);

      // Verify the summary contains expected sections
      const summary = updatedThread?.summary || '';
      expect(summary).toContain('Thread Description');
      expect(summary).toContain('Conflicts & Decisions');
      expect(summary).toContain('Next Steps');

      console.log('Generated summary:', summary);
    } finally {
      // Cleanup: Delete the test user
      await supabase.auth.admin.deleteUser(userId);
    }
  });
});
