import { supabase } from "@/integrations/supabase/client";

export async function reviewMessage(args: {
  message: string;
  threadId: string;
}): Promise<{
  rephrasedMessage: string | null;
  rejected: boolean;
  reason: string | null;
}> {
  const { message, threadId } = args;
  try {
    const { data, error } = await supabase.functions.invoke("review-message", {
      body: {
        message,
        threadId,
        systemPrompt: localStorage.getItem("systemPrompt:message-review"),
      },
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Exception reviewing message:", error);
    return {
      rephrasedMessage: message,
      rejected: true,
      reason: (error as Error).message,
    };
  }
}
