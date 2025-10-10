import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { getOpenAIClient } from '../utils/openai.ts';
import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';
import { handleError } from '../utils/handle-error.ts';
import { res } from '../utils/response.ts';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const messageSchema = z.object({
  text: z
    .string()
    .min(1, 'Message text is required')
    .transform((val) => val.trim()),
  threadId: z.string().uuid('Invalid thread ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  systemPrompt: z.string().nullable().default(''),
});

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return res.cors();
  }

  try {
    const { text, threadId, userId, systemPrompt } = await req.json();
    const result = messageSchema.safeParse({
      text,
      threadId,
      userId,
      systemPrompt,
    });
    if (!result.success) {
      return res.badRequest(result.error.issues[0].message);
    }

    const supabase = getSupabaseServiceClient();
    const openai = getOpenAIClient();

    // Insert the user's message
    const { data: userMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        text: result.data.text,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
        type: 'user_message',
      })
      .select('id, text, user_id, thread_id, timestamp, type')
      .single();

    if (insertError || !userMessage?.id) {
      handleError(insertError);
      return res.serverError(insertError);
    }

    // Pull thread history (last 20 messages, oldest first)
    const { data: messages, error: historyError } = await supabase
      .from('messages')
      .select('text, user_id, timestamp, type')
      .eq('thread_id', threadId)
      .order('timestamp', { ascending: true })
      .limit(20);

    if (historyError) {
      handleError(historyError);
      return res.serverError(historyError);
    }

    // Format messages for OpenAI
    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = (
      messages || []
    ).map((msg) => ({
      role: msg.type === 'ai_message' ? 'assistant' : 'user',
      content: (msg.text ?? '') as string,
    }));

    // Send to OpenAI
    const aiRes = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'system',
          content:
            systemPrompt ??
            'You are a thoughtful, kind legal assistant and co-parenting expert.',
        },
        ...openAIMessages,
      ],
      temperature: 0.7,
    });

    const aiContent = aiRes.choices?.[0]?.message?.content?.trim();
    if (!aiContent) {
      return res.serverError('No AI response generated');
    }

    // Insert AI response into database
    const { data: aiMessage, error: aiInsertError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        text: aiContent,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
        type: 'ai_message',
      })
      .select('id, text, user_id, thread_id, timestamp, type')
      .single();

    if (aiInsertError || !aiMessage?.id) {
      handleError(aiInsertError);
      return res.serverError(aiInsertError);
    }

    // Reply with the new AI message
    return res.ok({ aiMessage });
  } catch (error) {
    handleError(error);
    return res.serverError(error);
  }
}

serve(handler);
