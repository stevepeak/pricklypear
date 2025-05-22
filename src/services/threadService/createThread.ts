import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadStatus, ThreadTopic } from "@/types/thread";
import { requireCurrentUser, getUserProfile } from "@/utils/authCache";

export const createThread = async (
  title: string,
  participantIds: string[],
  topic: ThreadTopic,
  controls?: { requireAiApproval?: boolean },
): Promise<Thread | null> => {
  const MAX_THREAD_TITLE_LENGTH = 50;

  // Trim and validate before we do anything expensive.
  const trimmedTitle = title.trim();
  if (
    trimmedTitle.length === 0 ||
    trimmedTitle.length > MAX_THREAD_TITLE_LENGTH
  ) {
    console.error(
      `Thread title must be between 1 and ${MAX_THREAD_TITLE_LENGTH} characters.`,
    );
    return null;
  }

  try {
    const user = await requireCurrentUser();
    const profile = await getUserProfile(user);

    // Call the database function to create the thread and add participants
    const { data: threadId, error: threadError } = await supabase.rpc(
      "create_thread",
      {
        title: trimmedTitle,
        topic,
        participant_ids: participantIds,
        controls,
      },
    );

    if (threadError || !threadId) {
      console.error("Error creating thread:", threadError);
      return null;
    }

    // Return the thread with participant names
    return {
      id: threadId,
      title: trimmedTitle,
      createdAt: new Date(),
      status: "open" as ThreadStatus,
      participants: participantIds,
      summary: `New thread created by ${profile.name}`,
      topic,
      controls,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return null;
  }
};
