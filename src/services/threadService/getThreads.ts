import { supabase } from '@/integrations/supabase/client';
import {
  Thread,
  ThreadControls,
  ThreadStatus,
  ThreadTopic,
} from '@/types/thread';
import { requireCurrentUser } from '@/utils/authCache';

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const user = await requireCurrentUser();

    // Get all threads with participants in a single query
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
      console.error('Error fetching threads:', threadError);
      return [];
    }

    // Transform the joined data into the expected Thread format
    const threadsWithParticipants = (threadData || []).map((thread) => {
      // Extract participant names, excluding current user
      const participants =
        thread.thread_participants
          ?.map((item) => ({
            id: item.profiles?.id,
            name: item.profiles?.name,
          }))
          .filter(
            (participant) =>
              participant.id && participant.name && participant.id !== user.id
          )
          .map((participant) => participant.name) || [];

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
    console.error('Exception fetching threads:', error);
    return [];
  }
};
