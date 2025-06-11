import { supabase } from '@/integrations/supabase/client';

export const generateThreadConversation = async (args: {
  threadId: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('generate-conversation', {
      body: {
        threadId: args.threadId,
      },
    });

    if (error) {
      console.error('Error calling generate-conversation function:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception generating conversation:', error);
    return false;
  }
};
