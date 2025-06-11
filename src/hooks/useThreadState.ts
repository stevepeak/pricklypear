import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useThread } from './useThread';

export const useThreadState = (threadId: string | undefined) => {
  const navigate = useNavigate();
  const { data: thread, isLoading, error } = useThread(threadId);

  const loadThread = useCallback(async () => {
    if (!threadId) {
      navigate('/threads');
      return null;
    }

    if (error) {
      toast('Error', {
        description: 'Thread not found',
      });
      navigate('/threads');
      return null;
    }

    return thread;
  }, [threadId, navigate, error, thread]);

  return {
    thread,
    isLoading,
    loadThread,
  };
};
