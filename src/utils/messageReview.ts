import { supabase } from '@/integrations/supabase/client';

export type ReviewResponse = {
  analysis: string;
  suggested_message: string;
  tone: 'neutral' | 'empathetic' | 'escalating' | 'unclear';
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
        systemPrompt: localStorage.getItem('systemPrompt:message-review'),
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
