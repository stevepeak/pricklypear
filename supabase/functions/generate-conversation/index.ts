import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";
import { getOpenAIClient } from "../utils/openai.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const payloadSchema = z.object({
  threadId: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const json = await req.json();
    const { threadId } = payloadSchema.parse(json);

    const supabase = getSupabaseServiceClient();

    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .select("title, topic, thread_participants(user_id)")
      .eq("id", threadId)
      .single();

    if (threadError) {
      throw threadError;
    }

    const participantIds = threadData.thread_participants.map((p) => p.user_id);

    const openai = getOpenAIClient();
    const prompt = `
      Create a short fictional conversation for a parenting app.
      Title: ${threadData.title}.
      Topic: ${threadData.topic}.
      Provide at least 10 back-and-forth messages.

      Today is ${new Date().toISOString().split("T")[0]}.
      Participants in the conversation: ${participantIds.join(", ")}.

      Respond ONLY with a JSON array of messages in the following format:
      [
        {
          "user_id": "<uuid>",
          "text": "Hello, how are you?",
          "timestamp": "<iso8601>"
        },
      ]
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    const inserts = z
      .array(
        z.object({
          user_id: z.string().uuid(),
          text: z.string().min(1),
          timestamp: z.string().datetime(),
          type: z.string().default("user_message"),
          thread_id: z.string().default(threadId),
        })
      )
      .min(10)
      .parse(JSON.parse(aiRes.choices?.[0]?.message?.content ?? "[]"));

    const { error: insertError } = await supabase
      .from("messages")
      .insert(inserts);

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, count: inserts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-conversation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
