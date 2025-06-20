import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { Message } from "@/types/message";
import { handleError } from "./utils.js";
import type { ConnectedUser } from "@/types/connection";

export const getMessages = async (args: {
  threadId: string;
  connections: ConnectedUser[];
}): Promise<Message[]> => {
  const { threadId, connections } = args;

  const user = await requireCurrentUser();

  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      return handleError(messagesError, "fetching messages") ? [] : [];
    }

    const messages = (messagesData || []).map((msg) => {
      const sender =
        msg.user_id === user.id
          ? { id: user.id, name: "You" }
          : connections.find((conn) => conn.id === msg.user_id);
      return {
        id: msg.id,
        text: (msg.text || "").trim(),
        sender,
        timestamp: new Date(msg.timestamp || ""),
        threadId: msg.thread_id || "",
        isCurrentUser: msg.user_id === user.id,
        type: msg.type,
        details: msg.details as Record<string, unknown>,
      };
    });

    return messages;
  } catch (error) {
    return handleError(error, "fetching messages") ? [] : [];
  }
};
