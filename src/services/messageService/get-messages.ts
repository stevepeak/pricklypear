import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { Message } from "@/types/message";
import { handleError } from "./utils.js";
import type { Connection } from "@/types/connection";

export const getMessages = async (args: {
  threadId: string;
  connections: Connection[];
}): Promise<Message[]> => {
  const { threadId, connections } = args;
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      return handleError(messagesError, "fetching messages") ? [] : [];
    }

    const user = await requireCurrentUser();

    // Process messages in parallel for better performance
    const messages = (messagesData || []).map((msg) => {
      const connection = connections.find(
        (conn) =>
          conn.otherUserId === msg.user_id || conn.user_id === msg.user_id,
      );
      return {
        id: msg.id,
        text: (msg.text || "").trim(),
        sender: connection?.name || "Unknown User",
        timestamp: new Date(msg.timestamp || ""),
        threadId: msg.thread_id || "",
        isCurrentUser: msg.user_id === user.id,
        type: msg.type,
      };
    });

    return messages;
  } catch (error) {
    return handleError(error, "fetching messages") ? [] : [];
  }
};
