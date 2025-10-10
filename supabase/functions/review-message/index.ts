import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getOpenAIClient } from '../utils/openai.ts';
import { handleError } from '../utils/handle-error.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { res } from '../utils/response.ts';
import { z } from 'https://esm.sh/zod@3.24.2';

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
  contextText: string;
  threadTopic: string;
  threadTitle: string;
  message: string;
}): Promise<boolean> {
  const { contextText, threadTopic, threadTitle, message } = args;
  const openai = getOpenAIClient();
  const topicCheckResponse = await openai.chat.completions.create({
    model: 'o4-mini',
    messages: [
      {
        role: 'system',
        content: `
          You are a specialist in language and conversation analysis
          with the mission to ensure user messages are on-topic.
          
          When evaluating if the user message is on-topic,
          consider if the message is relevant to the thread title, thread topic,
          and context of other messages.

          Thread title: ${threadTitle}
          Thread topic: ${threadTopic}

          Latest messages in conversation:
          <context>
            ${contextText}
          </context>

          We are looking more for flagrant violations, so if you are unsure reply with 'no'.
          Only reply with 'yes' or 'no'.
          `,
      },
      {
        role: 'user',
        content: message,
      },
    ],
  });
  return (
    topicCheckResponse.choices[0]?.message?.content
      ?.toLowerCase()
      .trim()
      .includes('yes') ?? false
  );
}

async function rephraseMessage(args: {
  contextText: string;
  message: string;
  systemPrompt: string;
}) {
  const { contextText, message, systemPrompt } = args;
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'o4-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `
          Latest messages in conversation:
          <context>
            ${contextText}
          </context>
          
          Rephrase this message:
          <message>
            ${message}
          </message>
        `,
      },
    ],
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
    return res.cors();
  }

  try {
    const { message, threadId, systemPrompt } = await req.json();

    if (!message || !threadId) {
      return res.badRequest('Message and threadId are required');
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
      return res.serverError(err);
    }

    const contextText = formatContextText({ messages: contextMessages });

    const [isOnTopic, rephrasedMessage] = await Promise.all([
      // Check if the message is on topic
      checkIfOnTopic({
        contextText,
        threadTopic,
        threadTitle,
        message,
      }),
      // Rephrase the message
      rephraseMessage({ contextText, message, systemPrompt }),
    ]);

    if (!isOnTopic) {
      return res.custom(
        {
          rejected: true,
          reason: 'Message is off-topic for this thread.',
          rephrasedMessage: null,
        },
        200
      );
    }

    return res.ok({ rejected: false, reason: null, rephrasedMessage });
  } catch (error) {
    console.error('Error reviewing message:', error);

    return res.serverError(error);
  }
}

serve(handler);
