import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import sendEmail from "../send-email/index.ts";
import { getSupabaseServiceClient } from "../utils/supabase.ts";

const APP_CONNECTIONS_URL = "https://prickly.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function fetchInviterName({ supabase, userId }) {
  const { data: inviterProfile, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  if (error || !inviterProfile) throw new Error("Inviter profile not found");
  return inviterProfile.name;
}

async function fetchInviteeUser({ supabase, email }) {
  const { data, error } = await supabase.auth.admin.listUsers({ email });
  if (error) throw error;
  const user = data.users.find(
    (u) => u.email && u.email.toLowerCase() === email.toLowerCase(),
  );
  return user ?? null;
}

async function sendInvitationEmail({ to, inviterName, isExistingUser }) {
  const subject = `${inviterName} invited you to connect on The Prickly Pear`;
  const htmlExisting = `
    <p>Hi there,</p>
    <p><strong>${inviterName}</strong> has invited you to connect on The Prickly Pear.</p>
    <p>Please <a href="${APP_CONNECTIONS_URL}/connections">visit your connections</a> to accept the request.</p>
    <p>- The Prickly Pear</p>
  `;
  const htmlNew = `
    <p>Hi there,</p>
    <p><strong>${inviterName}</strong> has invited you to join The Prickly Pear.</p>
    <p><a href="${APP_CONNECTIONS_URL}/auth">Create an account</a> to start the conversation with ${inviterName}</a>.</p>
    <p>Best,</p>
    <p>The Prickly Pear</p>
  `;
  await sendEmail({
    to,
    subject,
    html: isExistingUser ? htmlExisting : htmlNew,
  });
}

async function connectionExists({ supabase, userId, inviteeId }) {
  const { data: existing1 } = await supabase
    .from("connections")
    .select("id")
    .eq("user_id", userId)
    .eq("connected_user_id", inviteeId)
    .maybeSingle();
  const { data: existing2 } = await supabase
    .from("connections")
    .select("id")
    .eq("user_id", inviteeId)
    .eq("connected_user_id", userId)
    .maybeSingle();
  return Boolean(existing1 || existing2);
}

async function createPendingConnection({ supabase, userId, inviteeUser }) {
  const { data: connection, error } = await supabase
    .from("connections")
    .insert({
      user_id: userId,
      connected_user_id: inviteeUser.id,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return connection;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { userId, email } = await req.json();
    if (!userId || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Both userId and email are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const supabase = getSupabaseServiceClient();
    const inviterName = await fetchInviterName({ supabase, userId });
    const inviteeUser = await fetchInviteeUser({ supabase, email });

    if (inviteeUser) {
      // Check if connection already exists
      const exists = await connectionExists({
        supabase,
        userId,
        inviteeId: inviteeUser.id,
      });
      if (exists) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Connection already exists",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Create pending connection
      const connection = await createPendingConnection({
        supabase,
        userId,
        inviteeUser,
      });

      // Send email
      await sendInvitationEmail({
        to: email,
        inviterName,
        isExistingUser: Boolean(inviteeUser),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Connection request sent to ${inviteeUser.email}`,
          connection: {
            id: connection.id,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else {
      // Invitee not yet a user: email sent, create pending connection with NULL connected_user_id
      const { data: connection, error } = await supabase
        .from("connections")
        .insert({
          user_id: userId,
          connected_user_id: null,
          status: "pending",
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
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Send email
      await sendInvitationEmail({
        to: email,
        inviterName,
        isExistingUser: Boolean(inviteeUser),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation email sent to ${email} and pending connection created`,
          connection: {
            id: connection.id,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("invite-by-email error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
