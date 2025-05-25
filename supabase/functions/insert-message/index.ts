import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";
import { z } from "https://deno.land/x/zod@v3.24.2/mod.ts";
import { handleError } from "../utils/handle-error.ts";
import sendEmail from "../send-email/index.ts";
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

function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createReadReceipts(args: {
  messageId: string;
  participants: { user_id: string }[];
}) {
  const supabase = getSupabaseServiceClient();
  const { messageId, participants } = args;

  const readReceipts = participants.map(({ user_id }) => ({
    message_id: messageId,
    user_id,
    read_at: null,
  }));

  const { error } = await supabase
    .from("message_read_receipts")
    .insert(readReceipts);
  if (error) {
    return { error };
  }
  return { error: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, threadId, userId, type } = await req.json();

    // Validate the input
    const result = messageSchema.safeParse({ text, threadId, userId, type });
    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400);
    }

    const supabase = getSupabaseServiceClient();

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
      return errorResponse(error?.message || "Failed to insert message");
    }

    // Fetch all participants
    const { data: participants, error: participantsError } = await supabase
      .from("thread_participants")
      .select(
        `
        user_id,
        auth_users:user_id (
          email
        ),
        profiles:user_id (
          full_name,
          notifications
        )
      `,
      )
      .eq("thread_id", threadId);

    if (!participants || participantsError) {
      handleError(participantsError);
      console.error("participantsError:", participantsError);
      return errorResponse(
        participantsError?.message || "No participants found",
      );
    }

    // Find sender's name for email body
    const sender = participants.find((p) => p.user_id === userId);
    const senderName = sender?.profiles?.full_name || "Someone";

    const [readReceiptsRes, closeThreadRes, slackNotificationRes] = await Promise.all([
      // Create read receipts using already-fetched participants
      createReadReceipts({
        messageId: messageData.id,
        participants: participants.filter((p) => p.user_id !== userId),
      }),
      // Mark thread as closed
      type === "close_accepted"
        ? supabase
            .from("threads")
            .update({ status: "closed" })
            .eq("id", threadId)
        : null,
      // Send Slack notification
      sendSlackNotification({
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
        .filter((participant) => participant.user_id !== userId)
        // remove if you have email notification disabled
        .filter(
          (participant) =>
            participant.profiles.notifications?.newMessages?.email !== false,
        )
        .map((participant) =>
          sendEmail({
            to: participant.auth_users.email,
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

    if (slackNotificationRes?.error) {
      handleError(slackNotificationRes.error);
      console.error("slackNotificationRes.error:", slackNotificationRes.error);
    }

    return new Response(JSON.stringify({ id: messageData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("insert-message error:", error);
    handleError(error);
    return errorResponse(error.message);
  }
});
