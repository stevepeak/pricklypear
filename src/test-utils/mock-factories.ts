/**
 * Mock data factories for tests
 * These provide type-safe default values for common data structures
 */

import type { Message, ListMessage } from '@/types/message';
import type { Thread, ThreadTopic } from '@/types/thread';
import type { ConnectedUser } from '@/types/connection';
import type { Database } from '@/integrations/supabase/types';

type MessageType = Database['public']['Enums']['message_type'];
type ThreadType = Database['public']['Enums']['thread_type'];
type ThreadStatus = Database['public']['Enums']['thread_status'];
type ConnectionStatus = Database['public']['Enums']['connection_status'];

/**
 * Creates a mock Message with sensible defaults
 */
export function createMockMessage(overrides: Partial<Message> = {}): Message {
  const defaults: Message = {
    id: 'msg-1',
    text: 'Test message',
    sender: { id: 'user-1', name: 'Test User' },
    timestamp: new Date('2025-01-01T12:00:00Z'),
    threadId: 'thread-1',
    isCurrentUser: false,
    isRead: false,
    readAt: null,
    type: 'user_message' as MessageType,
    details: {},
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a mock ListMessage with sensible defaults
 */
export function createMockListMessage(
  overrides: Partial<ListMessage> = {}
): ListMessage {
  const defaults: ListMessage = {
    threadId: 'thread-1',
    threadTitle: 'Test Thread',
    threadTopic: 'other' as ThreadTopic,
    threadType: 'default' as ThreadType,
    id: 'msg-1',
    text: 'Test message',
    sender: { id: 'user-1', name: 'Test User' },
    timestamp: new Date('2025-01-01T12:00:00Z'),
    type: 'user_message' as MessageType,
    readAt: null,
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a mock Thread with sensible defaults
 */
export function createMockThread(overrides: Partial<Thread> = {}): Thread {
  const defaults: Thread = {
    id: 'thread-1',
    title: 'Test Thread',
    createdAt: new Date('2025-01-01T12:00:00Z'),
    status: 'Open' as ThreadStatus,
    participants: ['user-1'],
    summary: null,
    topic: 'other' as ThreadTopic,
    type: 'default' as ThreadType,
    controls: undefined,
    createdBy: undefined,
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a mock AI chat Thread
 */
export function createMockAIThread(overrides: Partial<Thread> = {}): Thread {
  return createMockThread({
    type: 'ai_chat' as ThreadType,
    title: 'AI Chat',
    ...overrides,
  });
}

/**
 * Creates a mock ConnectedUser with sensible defaults
 */
export function createMockConnectedUser(
  overrides: Partial<ConnectedUser> = {}
): ConnectedUser {
  const defaults: ConnectedUser = {
    connection_id: 'conn-1',
    id: 'user-1',
    name: 'Test User',
    invitee_email: 'test@example.com',
    status: 'accepted' as ConnectionStatus,
    createdByMe: false,
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a mock User (for auth context)
 */
export function createMockUser(
  overrides: {
    id?: string;
    email?: string;
    name?: string;
  } = {}
) {
  return {
    id: overrides.id ?? 'user-1',
    email: overrides.email ?? 'test@example.com',
    name: overrides.name ?? 'Test User',
  };
}

/**
 * Creates a mock User Profile
 */
export function createMockProfile(
  overrides: {
    id?: string;
    name?: string;
    email?: string;
    notifications?: Record<string, unknown>;
  } = {}
) {
  return {
    id: overrides.id ?? 'user-1',
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? 'test@example.com',
    notifications: overrides.notifications ?? {},
  };
}

/**
 * Creates multiple mock messages
 */
export function createMockMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) =>
    createMockMessage({
      id: `msg-${i + 1}`,
      text: `Test message ${i + 1}`,
      timestamp: new Date(`2025-01-01T12:${String(i).padStart(2, '0')}:00Z`),
    })
  );
}

/**
 * Creates multiple mock threads
 */
export function createMockThreads(count: number): Thread[] {
  return Array.from({ length: count }, (_, i) =>
    createMockThread({
      id: `thread-${i + 1}`,
      title: `Test Thread ${i + 1}`,
    })
  );
}

/**
 * Creates multiple mock connected users
 */
export function createMockConnectedUsers(count: number): ConnectedUser[] {
  return Array.from({ length: count }, (_, i) =>
    createMockConnectedUser({
      connection_id: `conn-${i + 1}`,
      id: `user-${i + 1}`,
      name: `Test User ${i + 1}`,
      invitee_email: `user${i + 1}@example.com`,
    })
  );
}
