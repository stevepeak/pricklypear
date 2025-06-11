import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConnectedUser } from '@/types/connection';

const orderMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: orderMock,
    })),
  },
}));

vi.mock('@/utils/authCache', () => ({
  requireCurrentUser: vi.fn().mockResolvedValue({ id: 'user1' }),
}));

vi.mock('./utils', () => ({
  handleError: vi.fn().mockReturnValue(false),
}));

const { getMessages } = await import('./get-messages');
const { handleError } = await import('./utils');
const { requireCurrentUser } = await import('@/utils/authCache');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMessages', () => {
  it('returns mapped messages on success', async () => {
    const timestamp = new Date().toISOString();
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: '  Hello  ',
          user_id: 'u2',
          thread_id: 't1',
          timestamp,
          type: 'user_message',
          details: { foo: 'bar' },
        },
      ],
      error: null,
    });

    const connections: ConnectedUser[] = [
      {
        connection_id: 'c1',
        id: 'u2',
        name: 'Bob',
        created_at: '',
        status: 'accepted',
      },
    ];

    const result = await getMessages({ threadId: 't1', connections });

    expect(result).toEqual([
      {
        id: 'm1',
        text: 'Hello',
        sender: {
          connection_id: 'c1',
          id: 'u2',
          name: 'Bob',
          created_at: '',
          status: 'accepted',
        },
        timestamp: new Date(timestamp),
        threadId: 't1',
        isCurrentUser: false,
        type: 'user_message',
        details: { foo: 'bar' },
      },
    ]);
    expect(requireCurrentUser).toHaveBeenCalled();
  });

  it('handles undefined values in message data', async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'm1',
          text: undefined,
          user_id: 'u2',
          thread_id: undefined,
          timestamp: undefined,
          type: 'user_message',
          details: undefined,
        },
      ],
      error: null,
    });

    const connections: ConnectedUser[] = [
      {
        connection_id: 'c1',
        id: 'u2',
        name: 'Bob',
        created_at: '',
        status: 'accepted',
      },
    ];

    const result = await getMessages({ threadId: 't1', connections });

    expect(result).toEqual([
      {
        id: 'm1',
        text: '',
        sender: {
          connection_id: 'c1',
          id: 'u2',
          name: 'Bob',
          created_at: '',
          status: 'accepted',
        },
        timestamp: new Date(''),
        threadId: '',
        isCurrentUser: false,
        type: 'user_message',
        details: undefined,
      },
    ]);
  });

  it('returns empty array on query error', async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: 'fail' } });

    const result = await getMessages({ threadId: 't1', connections: [] });

    expect(handleError).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
