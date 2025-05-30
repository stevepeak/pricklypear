import { supabase } from "@/integrations/supabase/client";
import {
  Thread,
  ThreadControls,
  ThreadStatus,
  ThreadTopic,
} from "@/types/thread";
import { requireCurrentUser } from "@/utils/authCache";

// Type for the joined participant result
interface ThreadParticipantProfile {
  profiles: {
    id: string;
    name: string;
  } | null;
}

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    // Get the current authenticated user
    const user = await requireCurrentUser();

    // Fetch the thread and its participants (with profile names) in one query
    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .select(
        `
        *,
        thread_participants(
          profiles(
            id, name
          )
        )`,
      )
      .eq("id", threadId)
      .single();

    if (threadError || !threadData) {
      console.error("Error fetching thread:", threadError);
      return null;
    }

    // Extract participant names, excluding the current user
    const participants = (
      (threadData.thread_participants as
        | ThreadParticipantProfile[]
        | undefined) || []
    )
      .filter((item) => item.profiles?.id !== user.id)
      .map((item) => ({
        id: item.profiles?.id,
        name: item.profiles?.name,
      }))
      .filter((participant) => participant.name)
      .map((participant) => participant.name as string);

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
    };
  } catch (error) {
    console.error("Exception fetching thread:", error);
    return null;
  }
};
