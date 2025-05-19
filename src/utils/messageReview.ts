import { supabase } from "@/integrations/supabase/client";

export async function reviewMessage(
  message: string,
): Promise<{ kindMessage: string; error: unknown }> {
  try {
    // Remove all tone logic, just call the review-message function with the message
    const { data, error } = await supabase.functions.invoke("review-message", {
      body: { message },
    });
    if (error) {
      console.error("Error calling review-message function:", error);
      return { kindMessage: message, error };
    }

    return { kindMessage: data?.kindMessage || message, error: null };
  } catch (error) {
    console.error("Exception reviewing message:", error);
    return { kindMessage: message, error };
  }
}
