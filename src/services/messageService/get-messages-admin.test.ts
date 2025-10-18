import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMessages } from './get-messages';
import { requireCurrentUser } from '@/utils/authCache';
import { supabase } from '@/integrations/supabase/client';
import type { ConnectedUser } from '@/types/connection';

vi.mock('@/integrations/supabase/client');
vi.mock('@/utils/authCache');

const mockRequireCurrentUser = vi.mocked(requireCurrentUser);

describe('getMessages - Admin Support Features', () => {
  const selectMock = vi.fn();
  const eqMock = vi.fn();
  const orderMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCurrentUser.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    selectMock.mockReturnValue({
      eq: eqMock,
    } as any);

    eqMock.mockReturnValue({
      order: orderMock,
    } as any);
  });

  it('fetches user profiles for support thread messages', async () => {
    const timestamp = new Date().toISOString();
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: 'Need help',
          user_id: 'user-1',
          thread_id: 'thread-1',
          timestamp,
          type: 'user_message',
          details: null,
          profiles: {
            id: 'user-1',
            name: 'Regular User',
          },
        },
        {
          id: 'm2',
          text: 'How can I help?',
          user_id: 'admin-1',
          thread_id: 'thread-1',
          timestamp,
          type: 'customer_support',
          details: null,
          profiles: {
            id: 'admin-1',
            name: 'Customer Support',
          },
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
    expect(selectMock).toHaveBeenCalledWith('*, profiles:user_id(id, name)');
  });

  it('falls back to connections for regular threads', async () => {
    const timestamp = new Date().toISOString();
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: 'Hello',
          user_id: 'user-2',
          thread_id: 'thread-1',
          timestamp,
          type: 'user_message',
          details: null,
          profiles: null, // Profile might not be joined in some cases
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
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: 'Message',
          user_id: 'unknown-user',
          thread_id: 'thread-1',
          timestamp,
          type: 'user_message',
          details: null,
          profiles: null,
        },
      ],
      error: null,
    });

    const connections: ConnectedUser[] = [];
    const result = await getMessages({ threadId: 'thread-1', connections });

    expect(result).toHaveLength(1);
    expect(result[0].sender).toBeUndefined();
    expect(result[0].isCurrentUser).toBe(false);
  });
});
