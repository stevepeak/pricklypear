import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import sendEmail from '../utils/send-email.ts';
import { renderEmail } from '../utils/email-render.ts';
import { InvitationEmail } from '../templates/InvitationEmail.tsx';
import { getSupabaseServiceClient } from '../utils/supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

async function fetchInviterName(args: { userId: string }) {
  const { userId } = args;
  const supabase = getSupabaseServiceClient();
  const { data: inviterProfile, error } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();
  if (error || !inviterProfile) throw new Error('Inviter profile not found');
  return inviterProfile.name;
}

async function fetchInviteeUser(args: {
  email: string;
}): Promise<{ id: string; email: string } | null> {
  console.log('fetchInviteeUser', args);
  // TODO unsure how to select by email
  return null;
  // const { email } = args;
  // const supabase = getSupabaseServiceClient();

  // const { data, error } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();

  // if (error) throw error;
  // const user = data.users.find(
  //   (u: { email: string }) =>
  //     u.email && u.email.toLowerCase() === email.toLowerCase(),
  // );
  // return user ?? null;
}

async function sendInvitationEmail(
  args: { to: string; inviterName: string; isExistingUser: boolean },
  sendEmailFn: typeof sendEmail = sendEmail
) {
  const { to, inviterName, isExistingUser } = args;
  const subject = `${inviterName} invited you to connect on The Prickly Pear`;
  // Render the React Email template
  const html = await renderEmail(InvitationEmail, {
    inviterName,
    recipientEmail: to,
    isExistingUser,
  });
  await sendEmailFn({
    to,
    subject,
    html,
  });
}

async function connectionExists(args: { userId: string; inviteeId: string }) {
  const { userId, inviteeId } = args;
  const supabase = getSupabaseServiceClient();
  const { data: existing1 } = await supabase
    .from('connections')
    .select('id')
    .eq('user_id', userId)
    .eq('connected_user_id', inviteeId)
    .maybeSingle();
  const { data: existing2 } = await supabase
    .from('connections')
    .select('id')
    .eq('user_id', inviteeId)
    .eq('connected_user_id', userId)
    .maybeSingle();
  return Boolean(existing1 || existing2);
}

async function createPendingConnection(args: {
  userId: string;
  inviteeUser: { id: string };
}) {
  const { userId, inviteeUser } = args;
  const supabase = getSupabaseServiceClient();
  const { data: connection, error } = await supabase
    .from('connections')
    .insert({
      user_id: userId,
      connected_user_id: inviteeUser.id,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return connection;
}

export type HandlerDeps = {
  getSupabaseServiceClient?: typeof getSupabaseServiceClient;
  sendEmail?: typeof sendEmail;
};

export async function handler(req: Request, deps: HandlerDeps = {}) {
  if (req.method === 'OPTIONS')
    return new Response(null, { headers: corsHeaders });

  try {
    const { userId, email } = await req.json();
    if (!userId || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Both userId and email are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    const getSupabase =
      deps.getSupabaseServiceClient ?? getSupabaseServiceClient;
    const sendEmailFn = deps.sendEmail ?? sendEmail;

    const supabase = getSupabase();
    const inviterName = await fetchInviterName({ userId });
    const inviteeUser = await fetchInviteeUser({ email });

    if (inviteeUser) {
      // Check if connection already exists
      const exists = await connectionExists({
        userId,
        inviteeId: inviteeUser.id,
      });
      if (exists) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Connection already exists',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create pending connection
      const connection = await createPendingConnection({
        userId,
        inviteeUser,
      });

      // Send email
      await sendInvitationEmail(
        { to: email, inviterName, isExistingUser: Boolean(inviteeUser) },
        sendEmailFn
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: `Connection request sent to ${inviteeUser.email}`,
          connection: {
            id: connection.id,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Invitee not yet a user: email sent, create pending connection with NULL connected_user_id
      const { data: connection, error } = await supabase
        .from('connections')
        .insert({
          user_id: userId,
          connected_user_id: null,
          status: 'pending',
          invitee_email: email,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Failed to create pending invitation: ${error.message}`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send email
      await sendInvitationEmail(
        { to: email, inviterName, isExistingUser: Boolean(inviteeUser) },
        sendEmailFn
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation email sent to ${email} and pending connection created`,
          connection: {
            id: connection.id,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('invite-by-email error:', error);
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

// @ts-expect-error TS2345
serve(handler);
