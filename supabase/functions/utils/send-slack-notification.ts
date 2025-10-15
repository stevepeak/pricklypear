import { env } from './env.ts';

/**
 * Send a notification to Slack via webhook. Logs on failure but never throws.
 */
export async function sendSlackNotification(args: {
  text: string;
  blocks?: unknown[];
}) {
  // Skip Slack notifications if webhook URL is not configured
  if (!env.SLACK_WEBHOOK_URL) {
    console.log(
      'Slack notification skipped (webhook not configured):',
      args.text
    );
    return;
  }

  const payload: Record<string, unknown> = { text: args.text };
  if (args.blocks) payload.blocks = args.blocks;

  try {
    const response = await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack webhook error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Slack webhook exception:', error);
  }
}
