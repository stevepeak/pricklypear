export { createThread } from './createThread';
export { getThreads } from './getThreads';
export { getThread } from './getThread';
export { generateThreadConversation } from './generateConversation';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '../messageService/utils';
import type { Database } from '@/integrations/supabase/types';

/**
 * Generic function to update a thread field and verify the update succeeded
 */
async function updateThread<
  K extends keyof Database['public']['Tables']['threads']['Update'],
>(args: {
  threadId: string;
  updates: Pick<Database['public']['Tables']['threads']['Update'], K>;
  expectedValues: Partial<Record<K, unknown>>;
  operationName: string;
}): Promise<boolean> {
  const { threadId, updates, expectedValues, operationName } = args;

  const { data, error } = await supabase
    .from('threads')
    .update(updates)
    .eq('id', threadId)
    .select()
    .single();

  if (error) {
    handleError(error, operationName);
    throw new Error(
      `Failed to ${operationName}. This may be due to a Row Level Security (RLS) policy preventing the update.`
    );
  }

  // Verify the update succeeded by checking expected values
  for (const [key, expectedValue] of Object.entries(expectedValues)) {
    const dataKey = key as keyof typeof data;
    if (data?.[dataKey] !== expectedValue) {
      throw new Error(
        `Failed to ${operationName}. This may be due to a Row Level Security (RLS) policy preventing the update.`
      );
    }
  }

  return true;
}

export async function archiveThread(args: {
  threadId: string;
}): Promise<boolean> {
  return updateThread({
    threadId: args.threadId,
    updates: { status: 'Archived' },
    expectedValues: { status: 'Archived' },
    operationName: 'archive thread',
  });
}

export async function unarchiveThread(args: {
  threadId: string;
}): Promise<boolean> {
  return updateThread({
    threadId: args.threadId,
    updates: { status: 'Open' },
    expectedValues: { status: 'Open' },
    operationName: 'unarchive thread',
  });
}

export async function updateThreadTitle(args: {
  threadId: string;
  title: string;
}): Promise<boolean> {
  return updateThread({
    threadId: args.threadId,
    updates: { title: args.title },
    expectedValues: { title: args.title },
    operationName: 'update thread title',
  });
}
