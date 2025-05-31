import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";
import { getErrorMessage, handleError } from "../utils/handle-error.ts";
import sendEmail from "../utils/send-email.ts";
import { sendSlackNotification } from "../utils/send-slack-notification.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const messageSchema = z.object({
  text: z
    .string()
    .min(1, "Message text is required")
    .transform((val) => val.trim()),
  threadId: z.string().uuid("Invalid thread ID format"),
  userId: z.string().uuid("Invalid user ID format"),
  type: z.enum([
    "user_message",
    "request_close",
    "close_accepted",
    "close_declined",
  ]),
});

const participantSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    notifications: z
      .object({
        newMessages: z
          .object({
            email: z.boolean().nullable(),
          })
          .nullable(),
      })
      .nullable(),
  }),
);

function errorResponse(args: { message: string; status: number }) {
  const { message, status } = args;
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createReadReceipts(args: {
  messageId: string;
  participantIds: string[];
}) {
  const supabase = getSupabaseServiceClient();
  const { messageId, participantIds } = args;

  const readReceipts = participantIds.map((id) => ({
    message_id: messageId,
    user_id: id,
  }));

  const { error } = await supabase
    .from("message_read_receipts")
    .insert(readReceipts);
  if (error) {
    return { error };
  }
  return { error: null };
}

export type HandlerDeps = {
  getSupabaseServiceClient?: typeof getSupabaseServiceClient;
  sendEmail?: typeof sendEmail;
  sendSlackNotification?: typeof sendSlackNotification;
};

export async function handler(req: Request, deps: HandlerDeps = {}) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, threadId, userId, type } = await req.json();

    // Validate the input
    const result = messageSchema.safeParse({ text, threadId, userId, type });
    if (!result.success) {
      return errorResponse({
        message: result.error.errors[0].message,
        status: 400,
      });
    }

    const getSupabase =
      deps.getSupabaseServiceClient ?? getSupabaseServiceClient;

    const sendEmailFn = deps.sendEmail ?? sendEmail;
    const sendSlackFn = deps.sendSlackNotification ?? sendSlackNotification;

    const supabase = getSupabase();

    // Insert the message
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        text: result.data.text,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
        type,
      })
      .select("id")
      .single();

    if (error || !messageData?.id) {
      handleError(error);
      console.error("insert-message error:", error);
      return errorResponse({
        message: error?.message || "Failed to insert message",
        status: 500,
      });
    }

    (async () => {
      // Fetch all participants
      const { data, error: participantsError } = await supabase
        .from("thread_participants")
        .select(
          `
        profiles (
          id,
          name,
          notifications
        )
      `,
        )
        .eq("thread_id", threadId);

      if (participantsError) {
        handleError(participantsError);
        return errorResponse({
          message: participantsError?.message || "No participants found",
          status: 500,
        });
      }

      const participants = participantSchema.parse(data.map((p) => p.profiles));

      // Find sender's name for email body
      const senderName =
        participants.find((p) => p.id === userId)?.name || "Someone";

      const [readReceiptsRes, closeThreadRes] = await Promise.all([
        // Create read receipts using already-fetched participants
        createReadReceipts({
          messageId: messageData.id,
          participantIds: participants
            .filter((p) => p.id !== userId)
            .map((p) => p.id),
        }),
        // Mark thread as closed
        type === "close_accepted"
          ? supabase
              .from("threads")
              .update({ status: "Closed" })
              .eq("id", threadId)
          : null,
        // Send Slack notification
        sendSlackFn({
          text: result.data.text,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Thread ID:* ${threadId}\n*Sender:* ${senderName}`,
              },
            },
          ],
        }),
        // Send emails to participants
        ...participants
          // remove sender
          .filter((participant) => participant.id !== userId)
          // remove if you have email notification disabled
          .filter(
            (participant) =>
              participant.notifications?.newMessages?.email !== false,
          )
          .map((participant) =>
            sendEmailFn({
              userId: participant.id,
              subject: `🌵 New message from ${senderName} via The Prickly Pear`,
              html: `<p>${senderName} sent a new message: ${result.data.text}</p>`,
            }),
          ),
      ]);

      if (readReceiptsRes?.error) {
        handleError(readReceiptsRes.error);
        console.error("readReceiptsRes.error:", readReceiptsRes.error);
      }

      if (closeThreadRes?.error) {
        handleError(closeThreadRes.error);
        console.error("closeThreadRes.error:", closeThreadRes.error);
      }
    })();

    return new Response(JSON.stringify({ id: messageData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("insert-message error:", error);
    handleError(error);
    return errorResponse({ message: getErrorMessage(error), status: 500 });
  }
}

// @ts-expect-error TS2345
serve(handler);
