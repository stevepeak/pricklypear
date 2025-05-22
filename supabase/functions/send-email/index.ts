import { Resend } from "https://esm.sh/resend@4.5.0";

/**
 * Send an email via the Resend SDK. Logs on failure but never throws.
 */
export default async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing – skipping email send");
    return;
  }

  const resend = new Resend(apiKey);
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!from) {
    console.warn("RESEND_FROM_EMAIL missing – skipping email send");
    return;
  }

  const { error } = await resend.emails.send({
    from: `The Prickly Pear <${from}>`,
    // temporary
    to: "steve@stevepeak.net", // args.to,
    subject: args.subject,
    html: args.html,
  });

  if (error) console.error("Resend error:", error);
}
