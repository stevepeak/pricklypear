import type { Message } from '@/types/message';

export function formatMessagesForClipboard(messages: Message[]): string {
  if (!messages.length) {
    return '';
  }

  return messages
    .map((msg) => {
      const date =
        msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
      const time = date.toLocaleString();
      return `[${time}] ${msg.sender?.name || 'someone'}: ${msg.text}`;
    })
    .join('\n\n');
}
