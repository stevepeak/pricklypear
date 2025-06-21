import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { renderEmail } from '../utils/email-render.ts';
import { PricklyPearInviteUserEmail } from '../templates/invite-user.tsx';
import { PricklyPearUnreadMessagesEmail } from '../templates/unread-messages.tsx';
import { Resend } from 'https://esm.sh/resend@4.5.0';
import { env } from '../utils/env.ts';
import { handleError } from '../utils/handle-error.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Define available email templates
const emailTemplates = {
  'invite-user': {
    component: PricklyPearInviteUserEmail,
    previewProps: PricklyPearInviteUserEmail.PreviewProps,
  },
  'unread-messages': {
    component: PricklyPearUnreadMessagesEmail,
    previewProps: PricklyPearUnreadMessagesEmail.PreviewProps,
  },
} as const;

// Zod schema for request validation
const requestSchema = z.object({
  emailName: z.enum(['invite-user', 'unread-messages']),
  preview: z.boolean().optional().default(false),
  to: z.string().email().default('steve@prickly.app'),
  props: z.record(z.string(), z.any()),
});

/**
 * Send test email to see how the template works
 */
export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { emailName, preview, to, props } = requestSchema.parse(body);

    const template = emailTemplates[emailName];
    if (!template) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Email template '${emailName}' not found`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await renderEmail(template.component, {
      ...template.previewProps,
      ...props,
    });

    // Preview only - return HTML without sending
    if (preview) {
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'The Prickly Pear <hello@prickly.app>',
      to,
      subject: 'Test email',
      html,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    handleError(error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

serve(handler);
