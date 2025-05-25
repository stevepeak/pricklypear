import { Resend } from "https://esm.sh/resend@4.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export function getSupabaseServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }
  return createClient(supabaseUrl, supabaseKey);
}


/**
 * Send an email via the Resend SDK. Logs on failure but never throws.
 */
export default async function sendEmail(
  args:
    | {
        userId: string;
        subject: string;
        html: string;
      }
    | {
        to: string;
        subject: string;
        html: string;
      },
) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing – skipping email send");
    return;
  }

  const resend = new Resend(apiKey);
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  if (!fromEmail) {
    console.warn("RESEND_FROM_EMAIL missing – skipping email send");
    return;
  }

  let to: string;

  if ("userId" in args) {
    const { data, error: userError } =
      await getSupabaseServiceClient().auth.admin.getUserById(args.userId);
    if (userError) {
      console.error("Error getting user:", userError);
      return;
    }
    to = data.user.email;
  } else {
    to = args.to;
  }

  const { error } = await resend.emails.send({
    from: `The Prickly Pear <${fromEmail}>`,
    to,
    subject: args.subject,
    html: args.html,
  });

  if (error) console.error("Resend error:", error);
}
