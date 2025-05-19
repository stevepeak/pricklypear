import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId } = await req.json();

    if (!message || !threadId) {
      return new Response(
        JSON.stringify({ error: "Message and threadId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the last 20 most recent messages in the thread (descending order, then reverse for chronological)
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("text, timestamp, profiles:user_id(name)")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: false })
      .limit(20);

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`);
    }

    // Chronologically order the messages (oldest to newest)
    const contextMessages = (messagesData || []).slice().reverse();

    // Format messages for context
    const contextText = contextMessages
      .map((msg) => {
        const sender = msg.profiles.name;
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `[${timestamp}] ${sender}: ${msg.text}`;
      })
      .join("\n\n");

    // Initialize OpenAI with the API key from Supabase Secrets
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Fetch the thread topic
    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .select("topic, title")
      .eq("id", threadId)
      .single();

    if (threadError || !threadData) {
      return new Response(
        JSON.stringify({
          error: "Could not fetch thread topic",
          kindMessage: null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const threadTopic = threadData.topic;
    const threadTitle = threadData.title;

    // Check if the message is on-topic using LLM
    const topicCheckPrompt = `Thread topic: ${threadTopic}\nThread title: ${threadTitle}\nMessage: ${message}\n\nIs this message on-topic for the thread? Reply with only 'yes' or 'no'.`;

    const topicCheckResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that checks if a message is on-topic for a given thread topic and title. Only reply with 'yes' or 'no'.",
        },
        {
          role: "user",
          content: topicCheckPrompt,
        },
      ],
      temperature: 0,
    });

    const isOnTopic = topicCheckResponse.choices[0]?.message?.content
      ?.toLowerCase().trim()
      .includes("yes");

    if (!isOnTopic) {
      return new Response(
        JSON.stringify({
          error: "Message is off-topic for this thread.",
          kindMessage: null,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Outright reject the message if it's clearly off topic

    // Use a single system prompt, no tone switching
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

    const kindMessage = response.choices[0]?.message?.content || message;

    return new Response(JSON.stringify({ kindMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error reviewing message:", error);

    return new Response(
      JSON.stringify({ error: error.message, kindMessage: null }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
