import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { handleError } from "./utils.js";
import type { ReadReceipt } from "./types.js";

export const markMessagesAsRead = async (
  messageIds: string[],
): Promise<boolean> => {
  try {
    if (!messageIds.length) return true;

    const user = await requireCurrentUser();
    const readReceipts: ReadReceipt[] = messageIds.map((messageId) => ({
      message_id: messageId,
      user_id: user.id,
      read_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("message_read_receipts")
      .upsert(readReceipts, {
        onConflict: "message_id,user_id",
        ignoreDuplicates: false,
      });

    if (error) {
      return handleError(error, "marking messages as read");
    }

    return true;
  } catch (error) {
    return handleError(error, "marking messages as read");
  }
};

export const getAllUnreadCounts = async (): Promise<Record<string, number>> => {
  try {
    const user = await requireCurrentUser();
    if (!user) return {};

    const { data: unreadMessages, error } = await supabase
      .from("message_read_receipts")
      .select(
        `
        message_id,
        messages!inner (
          thread_id,
          user_id
        )
      `,
      )
      // My read receipts
      .eq("user_id", user.id)
      // If I read it
      .is("read_at", null);

    if (error) {
      return handleError(error, "fetching all unread counts") ? {} : {};
    }

    return (unreadMessages || []).reduce(
      (counts, { messages }) => {
        const threadId = messages.thread_id;
        counts[threadId] = (counts[threadId] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );
  } catch (error) {
    return handleError(error, "fetching all unread counts") ? {} : {};
  }
};
