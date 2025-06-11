import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getOpenAIClient } from '../utils/openai.ts';
import { getErrorMessage, handleError } from '../utils/handle-error.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { z } from 'https://esm.sh/zod@3.24.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

async function fetchThreadMessages(args: {
  threadId: string;
}): Promise<Message[]> {
  const { threadId } = args;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      text,
      timestamp,
      profile:profiles!user_id ( name )
    `
    )
    .eq('thread_id', threadId)
    .order('timestamp', { ascending: false })
    .limit(20);
  if (error) {
    throw new Error(`Error fetching messages: ${error.message}`);
  }
  const messageSchema = z.array(
    z.object({
      text: z.string(),
      timestamp: z.string(),
      profile: z.object({
        name: z.string(),
      }),
    })
  );

  const result = messageSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Error parsing messages: ${result.error.message}`);
  }
  return result.data.slice().reverse() as Message[];
}

type Message = {
  text: string;
  timestamp: string;
  profile: { name: string };
};

function formatContextText(args: { messages: Message[] }): string {
  const { messages } = args;
  return messages
    .map((msg) => {
      const sender = msg.profile.name;
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `[${timestamp}] ${sender}: ${msg.text}`;
    })
    .join('\n\n');
}

async function fetchThreadTopic(args: {
  threadId: string;
}): Promise<{ topic: string; title: string }> {
  const { threadId } = args;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('threads')
    .select('topic, title')
    .eq('id', threadId)
    .single();
  if (error || !data) {
    throw new Error('Could not fetch thread topic');
  }
  return { topic: data.topic, title: data.title };
}

async function checkIfOnTopic(args: {
  threadTopic: string;
  threadTitle: string;
  message: string;
}): Promise<boolean> {
  const { threadTopic, threadTitle, message } = args;
  const openai = getOpenAIClient();
  // TODO not working yet
  return true;
  const topicCheckPrompt = `Thread topic: ${threadTopic}\nThread title: ${threadTitle}\nMessage: ${message}\n\nIs this message on-topic for the thread? Reply with only 'yes' or 'no'.`;
  const topicCheckResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
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
        role: 'user',
        content: topicCheckPrompt,
      },
    ],
    temperature: 0,
  });
  return topicCheckResponse.choices[0]?.message?.content
    ?.toLowerCase()
    .trim()
    .includes('yes');
}

async function rephraseMessage(args: {
  contextText: string;
  message: string;
  systemPrompt: string;
}) {
  const { contextText, message, systemPrompt } = args;
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
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
export async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId, systemPrompt } = await req.json();

    if (!message || !threadId) {
      return new Response(
        JSON.stringify({
          rejected: true,
          reason: 'Message and threadId are required',
          rephrasedMessage: null,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch context
    let contextMessages: Message[] = [];
    let threadTopic: string;
    let threadTitle: string;
    try {
      const [messages, topicData] = await Promise.all([
        fetchThreadMessages({ threadId }),
        fetchThreadTopic({ threadId }),
      ]);
      contextMessages = messages;
      threadTopic = topicData.topic;
      threadTitle = topicData.title;
    } catch (err) {
      handleError(err);
      return new Response(
        JSON.stringify({
          rejected: true,
          reason: 'Could not fetch thread topic or messages',
          rephrasedMessage: null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const contextText = formatContextText({ messages: contextMessages });

    const [isOnTopic, rephrasedMessage] = await Promise.all([
      // Check if the message is on topic
      checkIfOnTopic({
        threadTopic,
        threadTitle,
        message,
      }),
      // Rephrase the message
      rephraseMessage({ contextText, message, systemPrompt }),
    ]);

    if (!isOnTopic) {
      return new Response(
        JSON.stringify({
          rejected: true,
          reason: 'Message is off-topic for this thread.',
          rephrasedMessage: null,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ rejected: false, reason: null, rephrasedMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error reviewing message:', error);

    return new Response(
      JSON.stringify({
        rejected: true,
        reason: getErrorMessage(error),
        rephrasedMessage: null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

serve(handler);
