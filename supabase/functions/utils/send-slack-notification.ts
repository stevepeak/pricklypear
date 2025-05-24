/**
 * Send a notification to Slack via webhook. Logs on failure but never throws.
 */
export async function sendSlackNotification(args: {
  text: string;
  blocks?: unknown[];
}) {
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL") ?? "";
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL missing, skipping Slack notification");
    return;
  }

  const payload: Record<string, unknown> = { text: args.text };
  if (args.blocks) payload.blocks = args.blocks;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Slack webhook error:", response.status, errorText);
    }
  } catch (error) {
    console.error("Slack webhook exception:", error);
  }
}
