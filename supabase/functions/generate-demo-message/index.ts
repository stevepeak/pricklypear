import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { getErrorMessage, handleError } from "../utils/handle-error.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const demoMessageSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

const demoMessages = [
  "Just checking in to see how everything is going!",
  "I wanted to discuss the upcoming schedule changes.",
  "Have you had a chance to review the latest documents?",
  "Let me know if you need any clarification on the previous message.",
  "I'm available for a quick chat if you have any questions.",
  "Here's an update on the current situation.",
  "I've attached the requested information.",
  "Let's coordinate on the next steps.",
  "I'm looking forward to our next meeting.",
  "Please let me know if you need anything else.",
];

export async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const result = demoMessageSchema.safeParse({ userId });
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.errors[0].message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = getSupabaseServiceClient();

    // Get all open threads that the user is part of
    const { data: threads, error: threadsError } = await supabase
      .from("threads")
      .select("id")
      .eq("status", "Open")
      .eq("created_by", userId);

    if (threadsError || !threads?.length) {
      return new Response(
        JSON.stringify({ error: "No available threads found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Randomly select a thread
    const randomThread = threads[Math.floor(Math.random() * threads.length)];
    const randomMessage =
      demoMessages[Math.floor(Math.random() * demoMessages.length)];

    // Insert the demo message
    const { data: messageData, error: insertError } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        text: randomMessage,
        thread_id: randomThread.id,
        timestamp: new Date().toISOString(),
        type: "user_message",
      })
      .select("id")
      .single();

    if (insertError || !messageData?.id) {
      handleError(insertError);
      return new Response(
        JSON.stringify({
          error: insertError?.message || "Failed to insert message",
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
    handleError(error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(handler);
