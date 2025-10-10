import { Resend } from 'https://esm.sh/resend@4.5.0';
import { getSupabaseServiceClient } from './supabase.ts';
import { env } from './env.ts';

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
      }
) {
  const resend = new Resend(env.RESEND_API_KEY);

  let to: string;

  if ('userId' in args) {
    const { data, error: userError } =
      await getSupabaseServiceClient().auth.admin.getUserById(args.userId);
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
    if (!data.user.email) {
      console.error('User has no email address');
      return;
    }
    to = data.user.email;
  } else {
    to = args.to;
  }

  const { error } = await resend.emails.send({
    from: `The Prickly Pear <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject: args.subject,
    html: args.html,
  });

  if (error) console.error('Resend error:', error);
}
