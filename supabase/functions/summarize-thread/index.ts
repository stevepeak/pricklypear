import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getOpenAIClient } from "../utils/openai.ts";
import { getErrorMessage } from "../utils/handle-error.ts";
import { env } from "../utils/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export type HandlerDeps = {
  createClient?: typeof createClient;
  getOpenAIClient?: typeof getOpenAIClient;
};

export async function handler(req: Request, deps: HandlerDeps = {}) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqJson = await req.json();
    console.log("reqJson", reqJson);
    const { threadId } = reqJson;

    if (!threadId) {
      return new Response(JSON.stringify({ error: "ThreadId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const create = deps.createClient ?? createClient;
    const getOpenAI = deps.getOpenAIClient ?? getOpenAIClient;

    const supabase = create(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Fetch messages from the database
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select(
        `
        text,
        timestamp,
        profile:profiles!user_id ( name ),
        type
      `,
      )
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`);
    }

    if (!messagesData || messagesData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages found for this thread" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Format messages for OpenAI
    const conversationText = messagesData
      .map((msg) => {
        // This is required below.
        // @ts-expect-error - Property 'name' exists on profile object
        const sender = msg.profile.name;
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `[${timestamp}] ${sender}: ${(msg.text ?? "").trim()}`;
      })
      .join("\n\n");

    // Initialize OpenAI with the API key from Supabase Secrets
    const openai = getOpenAI();

    // Generate a summary using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an assistant that summarizes conversations. The messages are provided in chronological order (oldest to newest) with timestamps. 
          
Important guidelines:
1. Pay special attention to the chronological order of messages - newer messages may contain updates or corrections to earlier information
2. If there are conflicting statements, prioritize the most recent information
3. Create a brief, concise summary (maximum 2 sentences) focusing on the main points and final outcomes
4. Ensure the summary reflects the most current state of the conversation based on the latest messages`,
        },
        {
          role: "user",
          content: `Please summarize this conversation, paying special attention to the chronological order and timestamps:\n\n${conversationText}`,
        },
      ],
      temperature: 0.7,
    });

    const summary =
      response.choices[0]?.message?.content || "No summary generated";

    // Update the thread with the new summary
    const { error: updateError } = await supabase
      .from("threads")
      .update({ summary })
      .eq("id", threadId);

    if (updateError) {
      throw new Error(`Error updating thread summary: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error summarizing thread:", error);

    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// @ts-expect-error TS2345
serve(handler);
