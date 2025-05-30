import { supabase } from "@/integrations/supabase/client";
import {
  Thread,
  ThreadControls,
  ThreadStatus,
  ThreadTopic,
  ThreadType,
} from "@/types/thread";
import { requireCurrentUser } from "@/utils/authCache";

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const user = await requireCurrentUser();

    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .select("*")
      .order("created_at", { ascending: false });

    if (threadError) {
      console.error("Error fetching threads:", threadError);
      return [];
    }

    const threadsWithParticipants = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (threadData || []).map(async (thread: any) => {
        const { data: participantsData } = await supabase
          .from("thread_participants")
          .select(
            `
          profiles:user_id (
            id, name
          )
        `,
          )
          .eq("thread_id", thread.id);

        const participants =
          participantsData
            ?.map((item) => ({
              id: item.profiles?.id,
              name: item.profiles?.name,
            }))
            .filter(
              (participant) =>
                participant.id &&
                participant.name &&
                participant.id !== user.id,
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
          type: (thread.type ?? "standard") as ThreadType,
        };
      }),
    );

    return threadsWithParticipants;
  } catch (error) {
    console.error("Exception fetching threads:", error);
    return [];
  }
};
