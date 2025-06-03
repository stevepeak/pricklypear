import { supabase } from "@/integrations/supabase/client";
import { handleError } from "./utils.js";

export const updateMessageDetails = async (args: {
  messageId: string;
  details: Record<string, unknown> | null;
}): Promise<boolean> => {
  try {
    const { messageId, details } = args;
    const { data, error } = await supabase
      .from("messages")
      .update({ details })
      .eq("id", messageId)
      .select()
      .single();
    if (error) {
      return handleError(error, "updating message details");
    }
    return !!data;
  } catch (error) {
    return handleError(error, "updating message details");
  }
};
