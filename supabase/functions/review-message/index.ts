import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getOpenAIClient } from "../utils/openai.ts";
import { getErrorMessage } from "../utils/handle-error.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function fetchThreadMessages(supabase, threadId) {
  const { data, error } = await supabase
    .from("messages")
    .select("text, timestamp, profiles:user_id(name)")
    .eq("thread_id", threadId)
    .order("timestamp", { ascending: false })
    .limit(20);
  if (error) {
    throw new Error(`Error fetching messages: ${error.message}`);
  }
  return (data || []).slice().reverse();
}

function formatContextText(messages) {
  return messages
    .map((msg) => {
      const sender = msg.profiles.name;
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `[${timestamp}] ${sender}: ${msg.text}`;
    })
    .join("\n\n");
}

async function fetchThreadTopic(supabase, threadId) {
  const { data, error } = await supabase
    .from("threads")
    .select("topic, title")
    .eq("id", threadId)
    .single();
  if (error || !data) {
    throw new Error("Could not fetch thread topic");
  }
  return { topic: data.topic, title: data.title };
}

async function checkIfOnTopic(
  openai,
  { threadTopic, threadTitle, message },
): Promise<boolean> {
  // TODO not working yet
  return true;
  const topicCheckPrompt = `Thread topic: ${threadTopic}\nThread title: ${threadTitle}\nMessage: ${message}\n\nIs this message on-topic for the thread? Reply with only 'yes' or 'no'.`;
  const topicCheckResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
          You are an assistant that checks if a user message is on-topic.
          When evaluating the message is on-topic, consider:
          - If relevant to the thread topic
          - or the message is relevant to the context of other messages
          - or the message is relevant to the thread title

          We are looking more for flagrant violations, so if you are unsure reply with 'no'.
          Only reply with 'yes' or 'no'.
          `,
      },
      {
        role: "user",
        content: topicCheckPrompt,
      },
    ],
    temperature: 0,
  });
  return topicCheckResponse.choices[0]?.message?.content
    ?.toLowerCase()
    .trim()
    .includes("yes");
}

async function rephraseMessage(openai, { contextText, message }) {
  const systemPrompt =
    "You are a helpful assistant that rephrases messages to be kinder and more constructive. Keep responses very concise and similar in length to the original message. Use the conversation context to ensure your rephrasing fits the ongoing discussion.";
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Conversation context (last 20 messages):\n${contextText}\n\nRephrase this message: ${message}`,
      },
    ],
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content || message;
}

export type HandlerDeps = {
  getOpenAIClient?: typeof getOpenAIClient;
  getSupabaseServiceClient?: typeof getSupabaseServiceClient;
};
export async function handler(req: Request, deps: HandlerDeps = {}) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId } = await req.json();

    if (!message || !threadId) {
      return new Response(
        JSON.stringify({
          rejected: true,
          reason: "Message and threadId are required",
          rephrasedMessage: null,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const getSupabase =
      deps.getSupabaseServiceClient ?? getSupabaseServiceClient;
    const getOpenAI = deps.getOpenAIClient ?? getOpenAIClient;

    const supabase = getSupabase();
    const openai = getOpenAI();

    // Fetch context
    let contextMessages, threadTopic, threadTitle;
    try {
      const [messages, topicData] = await Promise.all([
        fetchThreadMessages(supabase, threadId),
        fetchThreadTopic(supabase, threadId),
      ]);
      contextMessages = messages;
      threadTopic = topicData.topic;
      threadTitle = topicData.title;
    } catch (err) {
      return new Response(
        JSON.stringify({
          rejected: true,
          reason: "Could not fetch thread topic or messages",
          rephrasedMessage: null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const contextText = formatContextText(contextMessages);

    const [isOnTopic, rephrasedMessage] = await Promise.all([
      // Check if the message is on topic
      checkIfOnTopic(openai, {
        threadTopic,
        threadTitle,
        message,
      }),
      // Rephrase the message
      rephraseMessage(openai, { contextText, message }),
    ]);

    if (!isOnTopic) {
      return new Response(
        JSON.stringify({
          rejected: true,
          reason: "Message is off-topic for this thread.",
          rephrasedMessage: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ rejected: false, reason: null, rephrasedMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error reviewing message:", error);

    return new Response(
      JSON.stringify({
        rejected: true,
        reason: getErrorMessage(error),
        rephrasedMessage: null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

serve(handler);
