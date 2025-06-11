import { supabase } from '@/integrations/supabase/client';
import { requireCurrentUser } from '@/utils/authCache';
import { handleError } from './utils.js';
import { toast } from 'sonner';

export const generateDemoMessage = async (): Promise<boolean> => {
  try {
    const user = await requireCurrentUser();
    const { error } = await supabase.functions.invoke('generate-demo-message', {
      body: {
        userId: user.id,
      },
    });

    if (error) {
      handleError(error, 'generateDemoMessage');
      console.error('Error calling generate-demo-message function:', error);
      toast.error('Failed to generate demo message', {
        description:
          error.message ||
          'An error occurred while generating the demo message',
      });
      return false;
    }

    return true;
  } catch (error) {
    handleError(error, 'generateDemoMessage');
    console.error('Exception generating demo message:', error);
    toast.error('Failed to generate demo message', {
      description:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    });
    return false;
  }
};
