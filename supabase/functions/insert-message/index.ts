import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";
import { getErrorMessage, handleError } from "../utils/handle-error.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const messageSchema = z.object({
  text: z
    .string()
    .min(1, "Message text is required")
    .transform((val) => val.trim()),
  threadId: z.string().uuid("Invalid thread ID format"),
  userId: z.string().uuid("Invalid user ID format"),
  type: z.enum([
    "user_message",
    "request_close",
    "close_accepted",
    "close_declined",
  ]),
  details: z
    .object({
      assets: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
});

function errorResponse(args: { message: string; status: number }) {
  const { message, status } = args;
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export type HandlerDeps = {
  getSupabaseServiceClient?: typeof getSupabaseServiceClient;
};

export async function handler(req: Request, deps: HandlerDeps = {}) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, threadId, userId, type } = await req.json();

    // Validate the input
    const result = messageSchema.safeParse({ text, threadId, userId, type });
    if (!result.success) {
      return errorResponse({
        message: result.error.errors[0].message,
        status: 400,
      });
    }

    const getSupabase =
      deps.getSupabaseServiceClient ?? getSupabaseServiceClient;

    const supabase = getSupabase();

    // Insert the message
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        text: result.data.text,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
        type,
        details: result.data.details,
      })
      .select("id")
      .single();

    if (error || !messageData?.id) {
      handleError(error);
      console.error("insert-message error:", error);
      return errorResponse({
        message: error?.message || "Failed to insert message",
        status: 500,
      });
    }

    if (type === "close_accepted") {
      await supabase
        .from("threads")
        .update({ status: "Closed" })
        .eq("id", threadId);
    }

    return new Response(JSON.stringify({ id: messageData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("insert-message error:", error);
    handleError(error);
    return errorResponse({ message: getErrorMessage(error), status: 500 });
  }
}

// @ts-expect-error TS2345
serve(handler);
