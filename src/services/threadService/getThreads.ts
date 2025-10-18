import { supabase } from '@/integrations/supabase/client';
import {
  Thread,
  ThreadControls,
  ThreadStatus,
  ThreadTopic,
} from '@/types/thread';
import { requireCurrentUser, isCurrentUserAdmin } from '@/utils/authCache';
import { transformThreadParticipants } from './utils';
import { logger } from '@/utils/logger';

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const user = await requireCurrentUser();
    const isAdmin = await isCurrentUserAdmin();

    // Get all threads with participants in a single query
    // If admin, this will include all customer_support threads due to RLS policies
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select(
        `
        *,
        thread_participants (
          profiles:user_id ( id, name )
        )
      `
      )
      .order('created_at', { ascending: false });

    if (threadError) {
      logger.error('Error fetching threads', threadError);
      return [];
    }

    // Transform the joined data into the expected Thread format
    const threadsWithParticipants = (threadData || []).map((thread) => {
      const participants = transformThreadParticipants({
        participants: thread.thread_participants || [],
        currentUserId: user.id,
        isAdmin,
        threadType: thread.type,
      });

      return {
        id: thread.id,
        title: thread.title,
        createdAt: new Date(thread.created_at),
        participants,
        status: thread.status as ThreadStatus,
        summary: thread.summary,
        topic: thread.topic as ThreadTopic,
        controls: thread.controls as ThreadControls,
        type: thread.type,
      };
    });

    return threadsWithParticipants;
  } catch (error) {
    logger.error('Exception fetching threads', error);
    return [];
  }
};
