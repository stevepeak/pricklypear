import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMessages } from './get-messages';
import { requireCurrentUser } from '@/utils/authCache';
import { supabase } from '@/integrations/supabase/client';
import type { ConnectedUser } from '@/types/connection';

vi.mock('@/integrations/supabase/client');
vi.mock('@/utils/authCache');

const mockRequireCurrentUser = vi.mocked(requireCurrentUser);

describe('getMessages - Admin Support Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCurrentUser.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
    } as any);
  });

  it('fetches user profiles for support thread messages', async () => {
    const timestamp = new Date().toISOString();

    // Mock the messages query
    const messagesSelectMock = vi.fn();
    const messagesEqMock = vi.fn();
    const messagesOrderMock = vi.fn();

    // Mock the profiles query
    const profilesSelectMock = vi.fn();
    const profilesInMock = vi.fn();

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'messages') {
        return {
          select: messagesSelectMock,
        } as any;
      } else if (table === 'profiles') {
        return {
          select: profilesSelectMock,
        } as any;
      }
      return {} as any;
    });

    messagesSelectMock.mockReturnValue({
      eq: messagesEqMock,
    } as any);

    messagesEqMock.mockReturnValue({
      order: messagesOrderMock,
    } as any);

    messagesOrderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: 'Need help',
          user_id: 'user-1',
          thread_id: 'thread-1',
          timestamp,
          type: 'user_message',
          details: null,
        },
        {
          id: 'm2',
          text: 'How can I help?',
          user_id: 'admin-1',
          thread_id: 'thread-1',
          timestamp,
          type: 'customer_support',
          details: null,
        },
      ],
      error: null,
    });

    profilesSelectMock.mockReturnValue({
      in: profilesInMock,
    } as any);

    profilesInMock.mockResolvedValue({
      data: [
        {
          id: 'user-1',
          name: 'Regular User',
        },
      ],
      error: null,
    });

    const connections: ConnectedUser[] = [];
    const result = await getMessages({ threadId: 'thread-1', connections });

    expect(result).toHaveLength(2);
    expect(result[0].sender).toEqual({
      id: 'user-1',
      name: 'Regular User',
    });
    expect(result[0].isCurrentUser).toBe(false);
    expect(result[1].sender).toEqual({
      id: 'admin-1',
      name: 'You',
    });
    expect(result[1].isCurrentUser).toBe(true);
  });

  it('falls back to connections for regular threads', async () => {
    const timestamp = new Date().toISOString();

    // Mock the messages query
    const messagesSelectMock = vi.fn();
    const messagesEqMock = vi.fn();
    const messagesOrderMock = vi.fn();

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'messages') {
        return {
          select: messagesSelectMock,
        } as any;
      }
      return {} as any;
    });

    messagesSelectMock.mockReturnValue({
      eq: messagesEqMock,
    } as any);

    messagesEqMock.mockReturnValue({
      order: messagesOrderMock,
    } as any);

    messagesOrderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: 'Hello',
          user_id: 'user-2',
          thread_id: 'thread-1',
          timestamp,
          type: 'user_message',
          details: null,
        },
      ],
      error: null,
    });

    const connections: ConnectedUser[] = [
      {
        connection_id: 'c1',
        id: 'user-2',
        name: 'Bob',
        created_at: '',
        status: 'accepted',
      },
    ];

    const result = await getMessages({ threadId: 'thread-1', connections });

    expect(result).toHaveLength(1);
    expect(result[0].sender).toEqual({
      connection_id: 'c1',
      id: 'user-2',
      name: 'Bob',
      created_at: '',
      status: 'accepted',
    });
  });

  it('handles messages with no sender info gracefully', async () => {
    const timestamp = new Date().toISOString();

    // Mock the messages query
    const messagesSelectMock = vi.fn();
    const messagesEqMock = vi.fn();
    const messagesOrderMock = vi.fn();

    // Mock the profiles query
    const profilesSelectMock = vi.fn();
    const profilesInMock = vi.fn();

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'messages') {
        return {
          select: messagesSelectMock,
        } as any;
      } else if (table === 'profiles') {
        return {
          select: profilesSelectMock,
        } as any;
      }
      return {} as any;
    });

    messagesSelectMock.mockReturnValue({
      eq: messagesEqMock,
    } as any);

    messagesEqMock.mockReturnValue({
      order: messagesOrderMock,
    } as any);

    messagesOrderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: 'Message',
          user_id: 'unknown-user',
          thread_id: 'thread-1',
          timestamp,
          type: 'user_message',
          details: null,
        },
      ],
      error: null,
    });

    profilesSelectMock.mockReturnValue({
      in: profilesInMock,
    } as any);

    // Return empty profiles data to simulate user not found
    profilesInMock.mockResolvedValue({
      data: [],
      error: null,
    });

    const connections: ConnectedUser[] = [];
    const result = await getMessages({ threadId: 'thread-1', connections });

    expect(result).toHaveLength(1);
    expect(result[0].sender).toBeUndefined();
    expect(result[0].isCurrentUser).toBe(false);
  });
});
