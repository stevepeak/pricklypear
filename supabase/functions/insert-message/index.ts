import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import { z } from 'https://deno.land/x/zod@v3.24.2/mod.ts';
import { handleError } from '../utils/handle-error.ts';
import { res } from '../utils/response.ts';
import sendEmail from '../utils/send-email.ts';
import { renderEmail } from '../utils/email-render.ts';
import { PricklyPearSupportMessageEmail } from '../templates/support-message.tsx';

const messageSchema = z.object({
  text: z
    .string()
    .min(1, 'Message text is required')
    .transform((val) => val.trim()),
  threadId: z.string().uuid('Invalid thread ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  type: z.enum([
    'user_message',
    'customer_support',
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

    // Send email notification for support messages from users
    if (type === 'user_message') {
      try {
        // Get thread details to check if it's a support thread
        const { data: threadData } = await supabase
          .from('threads')
          .select('type, title')
          .eq('id', threadId)
          .single();

        if (threadData?.type === 'customer_support') {
          // Get user details
          const { data: userData } =
            await supabase.auth.admin.getUserById(userId);

          if (userData?.user?.email) {
            const html = await renderEmail(PricklyPearSupportMessageEmail, {
              userName:
                userData.user.user_metadata?.full_name ||
                userData.user.user_metadata?.name ||
                userData.user.email?.split('@')[0] ||
                'User',
              userEmail: userData.user.email,
              threadTitle: threadData.title,
              threadId,
              messageText: result.data.text,
              dashboardLink: `https://prickly.app/threads/${threadId}`,
            });

            await sendEmail({
              to: 'steve@prickly.app',
              subject: `New Support Message from ${userData.user.email}`,
              html,
            });

            console.log(
              `Sent support notification email for thread ${threadId}`
            );
          }
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        console.error('Failed to send support email notification:', emailError);
        handleError(emailError);
      }
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
