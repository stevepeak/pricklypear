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

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    // Get the current authenticated user
    const user = await requireCurrentUser();
    const isAdmin = await isCurrentUserAdmin();

    // Fetch the thread and its participants (with profile names) in one query
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select(
        `
        *,
        createdBy:created_by (
          id,
          name
        ),
        thread_participants(
          profiles(
            id, name
          )
        )`
      )
      .eq('id', threadId)
      .single();

    if (threadError || !threadData) {
      logger.error('Error fetching thread', threadError);
      return null;
    }

    // Extract participant names, excluding the current user
    const participants = transformThreadParticipants({
      participants: threadData.thread_participants || [],
      currentUserId: user.id,
      isAdmin,
      threadType: threadData.type,
    });

    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      participants: participants || [],
      status: threadData.status as ThreadStatus,
      summary: threadData.summary,
      topic: threadData.topic as ThreadTopic,
      controls: threadData.controls as ThreadControls,
      type: threadData.type,
      createdBy: threadData.createdBy,
    };
  } catch (error) {
    logger.error('Exception fetching thread', error);
    return null;
  }
};
