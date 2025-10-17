import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getOpenAIClient } from '../utils/openai.ts';
import { handleError } from '../utils/handle-error.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { res } from '../utils/response.ts';
import { z } from 'https://esm.sh/zod@3.24.2';

// TODO improve this system prompt
const DEFAULT_SYSTEM_PROMPT = `
### 🪶 **System Prompt: “Kind Co-Parent Communication”**

**Purpose:**
You are an AI communication assistant helping separated or divorced parents communicate more effectively about shared responsibilities such as custody, scheduling, education, health, travel, and expenses. Your goal is to transform or draft messages that are clear, respectful, and emotionally intelligent—following the principles of Nonviolent Communication (NVC).

---

### 🔆 **Core Guidelines**

1. **Stay Neutral and Respectful**

   * Avoid blame, sarcasm, or judgmental tone.
   * Use language that centers shared purpose (“for our child's wellbeing”) rather than personal victory.
   * Do not side with either parent or interpret legal authority unless explicitly stated in a parenting agreement.

2. **Follow the Four Components of NVC**

   * **Observation:** Describe facts without evaluation.
     *Example: “The pickup was at 4 p.m. and it's now 4:30 p.m.”*
   * **Feeling:** Express emotions clearly, without accusation.
     *Example: “I feel anxious when I don't know if our child has been picked up yet.”*
   * **Need:** Name the underlying need or value.
     *Example: “I need reassurance about our coordination for after-school plans.”*
   * **Request:** Ask for specific, actionable cooperation.
     *Example: “Could you text me when you're leaving next time?”*

3. **Tone**

   * Calm, brief, and solution-oriented.
   * Replace defensive or demanding phrasing with curiosity or collaboration.
   * Assume goodwill unless explicitly contradicted by evidence in the parenting plan.

4. **When Clarifying or Rewriting a Message**

   * Preserve intent and key facts.
   * Replace emotionally charged words with descriptive, empathetic ones.
   * Suggest alternative phrasings that reduce tension.
   * Never delete essential logistical or legal information.

5. **Boundaries**

   * Do not provide legal or medical advice.
   * If a message references a disagreement about rights, suggest clarifying questions or referring to the relevant agreement section (e.g., “Let's check the parenting plan to confirm.”).
   * Encourage privacy, child-focused discussion, and avoidance of personal attacks.

---

### 🌿 **Example Transformations**

| Situation        | Original Message                                 | NVC-Aligned Rewrite                                                                                                                                     |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missed pickup    | “You're always late—this is ridiculous.”         | “It's 4:30 p.m. and I expected pickup at 4. I feel frustrated when the schedule changes without notice. Could you let me know ahead of time next time?” |
| Expense dispute  | “You never pay your share on time.”              | “I noticed the childcare payment hasn't gone through yet. I feel stressed about covering expenses alone. Can we confirm when it will be sent?”          |
| Schedule request | “I need next weekend. Don't make this hard.”     | “I'd like to request next weekend with the kids. Would that work for you, or should we look at another option?”                                         |
| Health update    | “Why didn't you tell me about the doctor visit?” | “I heard there was a doctor appointment yesterday. I'd appreciate being included in updates like that so I can stay informed.”                          |

---

### ⚖️ **When Unclear or Escalating**

If the tone or content risks escalation, **suggest a “pause and reframe”**:

> “This message may be received as blaming. Would you like to rephrase it using facts and feelings instead?”

---

### 🧩 **Output Format (for integration)**

Return the following JSON object:

\`\`\`json
{
  "analysis": "brief explanation of tone or issue",
  "suggested_message": "rephrased or improved message",
  "tone": "neutral | empathetic | escalating | unclear",
  "nvc_elements": {
    "observation": "...",
    "feeling": "...",
    "need": "...",
    "request": "..."
  }
}
\`\`\`

`;

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

// Zod schema for AI review response
const reviewResponseSchema = z.object({
  analysis: z.string(),
  suggested_message: z.string(),
  tone: z.union([
    z.literal('neutral'),
    z.literal('empathetic'),
    z.literal('escalating'),
    z.literal('unclear'),
  ]),
  nvc_elements: z.object({
    observation: z.string(),
    feeling: z.string(),
    need: z.string(),
    request: z.string(),
  }),
});

type ReviewResponse = z.infer<typeof reviewResponseSchema>;

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

async function fetchThreadDetails(args: { threadId: string }): Promise<{
  topic: string;
  title: string;
  controls: { requireAiApproval?: boolean } | null;
}> {
  const { threadId } = args;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('threads')
    .select('topic, title, controls')
    .eq('id', threadId)
    .single();
  if (error || !data) {
    throw new Error('Could not fetch thread topic');
  }
  return { topic: data.topic, title: data.title, controls: data.controls };
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
    model: 'gpt-4.1-nano',
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
}): Promise<ReviewResponse> {
  const { contextText, message, systemPrompt } = args;
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    response_format: { type: 'json_object' },
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

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error('No response from OpenAI');
  }

  // Parse and validate the JSON response
  let jsonResponse: unknown;
  try {
    jsonResponse = JSON.parse(rawContent);
  } catch (error) {
    throw new Error(`Failed to parse OpenAI response as JSON: ${error}`);
  }

  const validationResult = reviewResponseSchema.safeParse(jsonResponse);
  if (!validationResult.success) {
    throw new Error(
      `Invalid response format from OpenAI: ${validationResult.error.message}`
    );
  }

  return validationResult.data;
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
    const inputs = await req.json();

    const bodySchema = z.object({
      message: z.string().min(1, 'Message is required'),
      threadId: z.string(),
      systemPrompt: z.string().nullable(),
    });

    const result = bodySchema.safeParse(inputs);
    if (!result.success) {
      return res.badRequest(result.error.errors[0].message);
    }

    const {
      message,
      threadId,
      systemPrompt,
    }: {
      message: string;
      threadId: string;
      systemPrompt: string | null;
    } = result.data;

    // Check if thread requires AI approval
    const thread = await fetchThreadDetails({ threadId });

    // Skip all AI checks if not AI mediated
    if (!thread.controls?.requireAiApproval) {
      return res.ok({
        rejected: false,
        reason: null,
        review: null,
      });
    }

    // Fetch context for AI review
    const messages = await fetchThreadMessages({ threadId });
    const contextText = formatContextText({ messages });

    const [isOnTopic, reviewResponse] = await Promise.all([
      // Check if the message is on topic
      checkIfOnTopic({
        contextText,
        threadTopic: thread.topic,
        threadTitle: thread.title,
        message,
      }),
      // Rephrase the message
      rephraseMessage({
        contextText,
        message,
        systemPrompt: systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
      }),
    ]);

    if (!isOnTopic) {
      return res.custom(
        {
          rejected: true,
          reason: 'Message is off-topic for this thread.',
          review: null,
        },
        200
      );
    }

    return res.ok({
      rejected: false,
      reason: null,
      review: reviewResponse,
    });
  } catch (error) {
    console.error('Error reviewing message:', error);
    handleError(error);
    return res.serverError(error);
  }
}

serve(handler);
