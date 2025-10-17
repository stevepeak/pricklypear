import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';
import { handleError } from '../utils/handle-error.ts';
import { res } from '../utils/response.ts';

const messageSchema = z.object({
  text: z
    .string()
    .min(1, 'Message text is required')
    .transform((val) => val.trim()),
  threadId: z.string().uuid('Invalid thread ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  type: z.enum([
    'user_message',
    'request_close',
    'close_accepted',
    'close_declined',
  ]),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type HandlerDeps = {
  getSupabaseServiceClient?: typeof getSupabaseServiceClient;
};

export async function handler(req: Request, deps: HandlerDeps = {}) {
  if (req.method === 'OPTIONS') {
    return res.cors();
  }

  try {
    const { text, threadId, userId, type, details } = await req.json();

    // Validate the input
    const result = messageSchema.safeParse({
      text,
      threadId,
      userId,
      type,
      details,
    });
    if (!result.success) {
      return res.badRequest(result.error.issues[0].message);
    }

    const getSupabase =
      deps.getSupabaseServiceClient ?? getSupabaseServiceClient;

    const supabase = getSupabase();

    // Insert the message
    const { data: messageData, error } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        text: result.data.text,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
        type,
        details: result.data.details,
      })
      .select('id')
      .single();

    if (error || !messageData?.id) {
      handleError(error);
      console.error('insert-message error:', error);
      return res.serverError(error);
    }

    if (type === 'close_accepted') {
      await supabase
        .from('threads')
        .update({ status: 'Closed' })
        .eq('id', threadId);
    }

    return res.ok({ id: messageData.id });
  } catch (error) {
    console.error('insert-message error:', error);
    handleError(error);
    return res.serverError(error);
  }
}

// @ts-expect-error - Handler deps signature differs from serve's expected signature
serve(handler);
