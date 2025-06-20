import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Message } from '@/types/message';
import type { Thread } from '@/types/thread';

/* -------------------------------------------------------------------------- */
/*                               Helper / mocks                               */
/* -------------------------------------------------------------------------- */

function mockDeps() {
  /* ---------------------------- Auth + Connections --------------------------- */
  vi.doMock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'u1' } }),
  }));

  vi.doMock('@/hooks/useConnections', () => ({
    useConnections: () => ({ connections: [] }),
  }));

  /* -------------------------------- Services -------------------------------- */
  const getMessages = vi.fn();
  const saveMessage = vi.fn().mockResolvedValue(true);
  const saveAiMessage = vi.fn().mockResolvedValue(true);

  vi.doMock('@/services/messageService', () => ({ getMessages }));
  vi.doMock('@/services/messageService/save-message', () => ({
    saveMessage,
    saveAiMessage,
  }));

  const reviewMessage = vi.fn();
  vi.doMock('@/utils/messageReview', () => ({ reviewMessage }));

  vi.doMock('sonner', () => ({ toast: vi.fn() }));

  /* ----------------------- Global messages (unread) ------------------------- */
  let unreadCb: (
    total: number,
    counts: Record<string, number>
  ) => void = () => {};
  vi.doMock('@/contexts/GlobalMessagesContext', () => ({
    useGlobalMessages: () => ({
      registerUnreadCountsCallback: (cb: typeof unreadCb) => {
        unreadCb = cb;
        return vi.fn();
      },
    }),
  }));

  /* --------------------------- Realtime messages ---------------------------- */
  vi.doMock('./useRealtimeMessages', () => ({
    useRealtimeMessages: vi.fn(),
  }));

  return {
    getMessages,
    saveMessage,
    saveAiMessage,
    reviewMessage,
    getUnreadCb: () => unreadCb,
  };
}

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('useThreadMessages', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it('loads messages via loadMessages helper', async () => {
    const threadId = 't1';
    const messages: Message[] = [
      {
        id: 'm1',
        text: 'Hello',
        threadId,
        createdAt: new Date(),
        authorId: 'u1',
        isRead: false,
      } as any,
    ];

    const { getMessages } = mockDeps();
    getMessages.mockResolvedValue(messages);

    const { useThreadMessages } = await import('./useThreadMessages');

    const { result } = renderHook(() =>
      useThreadMessages(threadId, {
        id: threadId,
        type: 'customer_support',
      } as Thread)
    );

    await act(async () => {
      await result.current.loadMessages();
    });

    expect(getMessages).toHaveBeenCalledWith({ threadId, connections: [] });
    expect(result.current.messages).toEqual(messages);
  });

  it('sends AI chat message with saveAiMessage', async () => {
    const threadId = 't1';

    const { saveAiMessage } = mockDeps();

    const { useThreadMessages } = await import('./useThreadMessages');

    const aiThread: Thread = {
      id: threadId,
      title: 'AI',
      createdAt: new Date(),
      status: 'open' as any,
      participants: [],
      topic: 'other',
      type: 'ai_chat',
    };

    const { result } = renderHook(() => useThreadMessages(threadId, aiThread));

    act(() => {
      result.current.setNewMessage('Hi AI');
    });

    await act(async () => {
      await result.current.handleSendMessage();
    });

    expect(saveAiMessage).toHaveBeenCalledWith({ threadId, text: 'Hi AI' });
    expect(result.current.newMessage).toBe('');
    expect(result.current.isSending).toBe(false);
  });
});
