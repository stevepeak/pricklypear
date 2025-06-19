import { describe, it, expect } from 'vitest';
import { formatMessagesForClipboard } from './messageFormatting';

// Mock Message type for testing
type Message = {
  id: string;
  text: string;
  timestamp: Date | string;
  sender?: { name: string } | undefined;
  threadId: string;
  isCurrentUser: boolean;
  type: string;
  details: Record<string, unknown>;
};

describe('messageFormatting', () => {
  describe('formatMessagesForClipboard', () => {
    it('should format messages correctly', () => {
      const messages: Message[] = [
        {
          id: '1',
          text: 'Hello there',
          timestamp: new Date('2023-01-01T10:00:00'),
          sender: { name: 'John' },
          threadId: 'thread-1',
          isCurrentUser: false,
          type: 'user_message',
          details: {},
        },
        {
          id: '2',
          text: 'Hi John!',
          timestamp: new Date('2023-01-01T10:01:00'),
          sender: { name: 'Jane' },
          threadId: 'thread-1',
          isCurrentUser: false,
          type: 'user_message',
          details: {},
        },
      ];

      const result = formatMessagesForClipboard(messages);

      expect(result).toContain('[1/1/2023, 10:00:00 AM] John: Hello there');
      expect(result).toContain('[1/1/2023, 10:01:00 AM] Jane: Hi John!');
      expect(result).toContain('\n\n');
    });

    it('should handle messages with string timestamps', () => {
      const messages: Message[] = [
        {
          id: '1',
          text: 'Test message',
          timestamp: '2023-01-01T10:00:00',
          sender: { name: 'User' },
          threadId: 'thread-1',
          isCurrentUser: false,
          type: 'user_message',
          details: {},
        },
      ];

      const result = formatMessagesForClipboard(messages);

      expect(result).toContain('[1/1/2023, 10:00:00 AM] User: Test message');
    });

    it('should handle messages without sender name', () => {
      const messages: Message[] = [
        {
          id: '1',
          text: 'Anonymous message',
          timestamp: new Date('2023-01-01T10:00:00'),
          sender: undefined,
          threadId: 'thread-1',
          isCurrentUser: false,
          type: 'user_message',
          details: {},
        },
      ];

      const result = formatMessagesForClipboard(messages);

      expect(result).toContain(
        '[1/1/2023, 10:00:00 AM] someone: Anonymous message'
      );
    });

    it('should return empty string for empty messages array', () => {
      const messages: Message[] = [];

      const result = formatMessagesForClipboard(messages);

      expect(result).toBe('');
    });

    it('should handle single message', () => {
      const messages: Message[] = [
        {
          id: '1',
          text: 'Single message',
          timestamp: new Date('2023-01-01T10:00:00'),
          sender: { name: 'User' },
          threadId: 'thread-1',
          isCurrentUser: false,
          type: 'user_message',
          details: {},
        },
      ];

      const result = formatMessagesForClipboard(messages);

      expect(result).toBe('[1/1/2023, 10:00:00 AM] User: Single message');
      expect(result).not.toContain('\n\n');
    });
  });
});
