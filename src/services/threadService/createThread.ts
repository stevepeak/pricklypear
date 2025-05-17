import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadStatus } from "@/types/thread";
import type { ThreadTopic } from "@/constants/thread-topics";
import { requireCurrentUser } from "@/utils/authCache";

export const createThread = async (
  title: string,
  participantIds: string[],
  topic: ThreadTopic = "other",
): Promise<Thread | null> => {
  try {
    const user = await requireCurrentUser();

    // Derive the creator's display name. Fallbacks:
    // 1. user_metadata.full_name
    // 2. user_metadata.name
    // 3. user.email
    // 4. "Unknown user"
    let creatorName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      (user.email as string | undefined) ??
      "Unknown user";

    // Handle edge-case where creatorName is an empty string or only whitespace.
    if (!creatorName?.trim()) {
      creatorName = "Unknown user";
    }

    // Call the database function to create the thread and add participants
    const { data: threadId, error: threadError } = await supabase.rpc(
      "create_thread",
      {
        title,
        topic,
        participant_ids: participantIds,
      },
    );

    if (threadError || !threadId) {
      console.error("Error creating thread:", threadError);
      return null;
    }

    // Return the thread with participant names
    return {
      id: threadId,
      title,
      createdAt: new Date(),
      status: "open" as ThreadStatus,
      participants: participantIds,
      summary: `New thread created by ${creatorName}`,
      topic,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return null;
  }
};
