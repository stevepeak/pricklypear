import { supabase } from '@/integrations/supabase/client';
import { getLocalStorageItem, localStorageKeys } from './localStorage';

/**
 * Response from AI message review
 * NOTE: This type must match the Zod schema in supabase/functions/review-message/index.ts
 */
export type ReviewResponse = {
  analysis: string;
  suggested_message: string;
  tone: string;
  nvc_elements: {
    observation: string;
    feeling: string;
    need: string;
    request: string;
  };
};

type MessageReviewResult = {
  review: ReviewResponse | null;
  rejected: boolean;
  reason: string | null;
  offTopic?: {
    rejected: boolean;
    reason: string;
  };
};

export async function reviewMessage(args: {
  message: string;
  threadId: string;
}): Promise<MessageReviewResult> {
  const { message, threadId } = args;
  try {
    const { data, error } = await supabase.functions.invoke('review-message', {
      body: {
        message,
        threadId,
        systemPrompt: getLocalStorageItem(
          localStorageKeys.SYSTEM_PROMPT_MESSAGE_REVIEW,
          null
        ),
      },
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Exception reviewing message:', error);
    return {
      review: null,
      rejected: true,
      reason: (error as Error).message,
    };
  }
}
