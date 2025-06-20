import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';
import { renderEmail } from '../utils/email-render.ts';
import { InvitationEmail } from '../templates/InvitationEmail.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      inviterName,
      isExistingUser = false,
      preview = false,
    } = await req.json();

    if (!to || !inviterName) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = await renderEmail(InvitationEmail, {
      inviterName,
      recipientEmail: to,
      isExistingUser: Boolean(isExistingUser),
    });

    const subject = `${inviterName} invited you to connect on The Prickly Pear`;

    // Preview only - return HTML without sending
    if (preview) {
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    await resend.emails.send({
      from: 'The Prickly Pear <hello@prickly.app>',
      to,
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('emails edge-function error:', error);
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
