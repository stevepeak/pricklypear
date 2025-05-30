import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { handleError } from "./utils.js";
import type { Database } from "@/integrations/supabase/types";
import type { Message } from "@/types/message";

export const saveMessage = async (args: {
  text: string;
  threadId: string;
  type: Database["public"]["Enums"]["message_type"];
}): Promise<boolean> => {
  const { text, threadId, type } = args;
  try {
    const user = await requireCurrentUser();

    const { data, error } = await supabase.functions.invoke("insert-message", {
      body: {
        text,
        threadId,
        userId: user.id,
        type,
      },
    });

    if (error) {
      return handleError(error, "saving message");
    }

    if (data?.id) {
      return true;
    }
    return false;
  } catch (error) {
    return handleError(error, "saving message");
  }
};

export const saveAiMessage = async (args: {
  text: string;
  threadId: string;
}): Promise<{ aiMessage: Message } | null> => {
  const { text, threadId } = args;
  try {
    const user = await requireCurrentUser();
    const { data, error } = await supabase.functions.invoke("ai-message", {
      body: {
        text,
        threadId,
        userId: user.id,
        systemPrompt: localStorage.getItem("systemPrompt:ai-chat"),
      },
    });
    if (error) {
      handleError(error, "saving AI message");
      return null;
    }
    return data;
  } catch (error) {
    handleError(error, "saving AI message");
    return null;
  }
};
