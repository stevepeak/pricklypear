import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { handleError } from '../utils/handle-error.ts';
import { res } from '../utils/response.ts';
import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';

const demoMessageSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

const demoMessages = [
  'Just checking in to see how everything is going!',
  'I wanted to discuss the upcoming schedule changes.',
  'Have you had a chance to review the latest documents?',
  'Let me know if you need any clarification on the previous message.',
  "I'm available for a quick chat if you have any questions.",
  "Here's an update on the current situation.",
  "I've attached the requested information.",
  "Let's coordinate on the next steps.",
  "I'm looking forward to our next meeting.",
  'Please let me know if you need anything else.',
];

async function getRandomOpenThread(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  userId: string
): Promise<{ id: string; type: string }> {
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('id, type')
    .eq('created_by', userId)
    .not('status', 'eq', 'Closed')
    .not('status', 'eq', 'Archived');

  if (threadsError || !threads?.length) {
    throw new Error('No available threads found');
  }

  return threads[Math.floor(Math.random() * threads.length)];
}

async function getRandomConnectedUser(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  userId: string
): Promise<string> {
  const { data: connections, error: connectionsError } = await supabase
    .from('connections')
    .select('connected_user_id, user_id')
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (connectionsError || !connections?.length) {
    throw new Error('No connected users found');
  }

  const randomConnection =
    connections[Math.floor(Math.random() * connections.length)];
  return randomConnection.user_id === userId
    ? randomConnection.connected_user_id
    : randomConnection.user_id;
}

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return res.cors();
  }

  try {
    const { userId } = await req.json();
    const result = demoMessageSchema.safeParse({ userId });
    if (!result.success) {
      return res.badRequest(result.error.issues[0].message);
    }

    const supabase = getSupabaseServiceClient();

    const randomThread = await getRandomOpenThread(supabase, userId);
    const randomMessage =
      demoMessages[Math.floor(Math.random() * demoMessages.length)];

    const randomConnectedUserId =
      randomThread.type === 'default'
        ? await getRandomConnectedUser(supabase, userId)
        : randomThread.type === 'customer_support'
          ? '09b77fc6-776c-4b4a-bd8c-96bb7997516e' // Steve
          : '770fcf79-403d-4bf8-a273-559c2790d219'; // Prickly AI

    const messageType =
      randomThread.type === 'default'
        ? 'user_message'
        : randomThread.type === 'customer_support'
          ? 'customer_support'
          : 'ai_message';

    // Insert the demo message
    const { data: messageData, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: randomConnectedUserId,
        text: randomMessage,
        thread_id: randomThread.id,
        timestamp: new Date().toISOString(),
        type: messageType,
      })
      .select('id')
      .single();

    if (insertError || !messageData?.id) {
      handleError(insertError);
      return res.serverError(insertError);
    }

    return res.ok({ id: messageData.id });
  } catch (error) {
    handleError(error);
    return res.serverError(error);
  }
}

serve(handler);
