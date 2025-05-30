import { supabase } from "@/integrations/supabase/client";
import {
  Thread,
  ThreadControls,
  ThreadStatus,
  ThreadTopic,
  ThreadType,
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
    const user = await requireCurrentUser();

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

    // Cast row until Supabase types are regenerated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = threadData;

    return {
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      participants: participants || [],
      status: row.status as ThreadStatus,
      summary: row.summary,
      topic: row.topic as ThreadTopic,
      controls: row.controls as ThreadControls,
      type: (row.type ?? "standard") as ThreadType,
    };
  } catch (error) {
    console.error("Exception fetching thread:", error);
    return null;
  }
};
