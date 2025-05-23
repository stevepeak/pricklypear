import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function createReadReceipts(
  supabase,
  messageId,
  threadId,
  senderProfileId,
) {
  // Fetch all participants except sender
  const { data: participants, error: participantsError } = await supabase
    .from("thread_participants")
    .select("user_id")
    .eq("thread_id", threadId);

  if (participantsError || !participants) {
    return { error: participantsError || new Error("No participants found") };
  }

  const readReceipts = participants
    .filter((p) => p.user_id !== senderProfileId)
    .map(({ user_id }) => ({
      message_id: messageId,
      user_id,
      read_at: null,
    }));

  // Sender gets read_at set
  readReceipts.push({
    message_id: messageId,
    user_id: senderProfileId,
    read_at: new Date().toISOString(),
  });

  if (readReceipts.length > 0) {
    const { error } = await supabase
      .from("message_read_receipts")
      .insert(readReceipts);
    if (error) {
      return { error };
    }
  }
  return { error: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, threadId, userId, type } = await req.json();
    console.log("insert-message", { text, threadId, userId, type });

    const messageSchema = z.object({
      text: z.string().min(1, "Message text is required"),
      threadId: z.string().uuid("Invalid thread ID format"),
      userId: z.string().uuid("Invalid user ID format"),
      type: z.enum([
        "user_message",
        "request_close",
        "close_accepted",
        "close_declined",
      ]),
    });

    const result = messageSchema.safeParse({ text, threadId, userId, type });
    if (!result.success) {
      console.log("insert-message validation error", result);
      return new Response(
        JSON.stringify({ error: result.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = getSupabaseServiceClient();
    const messageText = text.trim();
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        text: messageText,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
        type,
      })
      .select("id")
      .single();

    if (error || !messageData?.id) {
      return new Response(
        JSON.stringify({ error: error?.message || "Failed to insert message" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create read receipts
    const { error: rrError } = await createReadReceipts(
      supabase,
      messageData.id,
      threadId,
      userId,
    );
    if (rrError) {
      return new Response(
        JSON.stringify({
          error: rrError.message || "Failed to create read receipts",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    return new Response(JSON.stringify({ id: messageData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
