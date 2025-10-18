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

    // Check if user is admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profileData?.is_admin || false;

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
      console.error('Error fetching threads:', threadError);
      return [];
    }

    // Transform the joined data into the expected Thread format
    const threadsWithParticipants = (threadData || []).map((thread) => {
      // Extract participant names, excluding current user
      // For admins viewing support threads, show all participants including the user who created it
      const participants =
        thread.thread_participants
          ?.map((item) => ({
            id: item.profiles?.id,
            name: item.profiles?.name,
          }))
          .filter((participant) => {
            if (!participant.id || !participant.name) return false;
            // If admin viewing support thread, include all participants
            if (isAdmin && thread.type === 'customer_support') return true;
            // Otherwise exclude current user
            return participant.id !== user.id;
          })
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
