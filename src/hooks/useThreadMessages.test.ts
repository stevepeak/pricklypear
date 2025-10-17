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

  it('sends message directly when AI approval is not required', async () => {
    const threadId = 't1';

    const { saveMessage } = mockDeps();

    const { useThreadMessages } = await import('./useThreadMessages');

    const regularThread: Thread = {
      id: threadId,
      title: 'Regular Chat',
      createdAt: new Date(),
      status: 'open' as any,
      participants: [],
      topic: 'other',
      type: 'chat',
      controls: { requireAiApproval: false },
    };

    const { result } = renderHook(() =>
      useThreadMessages(threadId, regularThread)
    );

    act(() => {
      result.current.setNewMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSendMessage();
    });

    expect(saveMessage).toHaveBeenCalledWith({
      threadId,
      text: 'Hello',
      type: 'user_message',
    });
    expect(result.current.newMessage).toBe('');
    expect(result.current.isSending).toBe(false);
  });

  it('sends message directly when controls are undefined', async () => {
    const threadId = 't1';

    const { saveMessage } = mockDeps();

    const { useThreadMessages } = await import('./useThreadMessages');

    const regularThread: Thread = {
      id: threadId,
      title: 'Regular Chat',
      createdAt: new Date(),
      status: 'open' as any,
      participants: [],
      topic: 'other',
      type: 'chat',
    };

    const { result } = renderHook(() =>
      useThreadMessages(threadId, regularThread)
    );

    act(() => {
      result.current.setNewMessage('Hello again');
    });

    await act(async () => {
      await result.current.handleSendMessage();
    });

    expect(saveMessage).toHaveBeenCalledWith({
      threadId,
      text: 'Hello again',
      type: 'user_message',
    });
    expect(result.current.newMessage).toBe('');
  });

  it('triggers AI review when requireAiApproval is true', async () => {
    const threadId = 't1';

    const { reviewMessage, saveMessage } = mockDeps();
    reviewMessage.mockResolvedValue({
      review: {
        analysis: 'test',
        suggested_message: 'Improved message',
        tone: 'neutral',
        nvc_elements: {
          observation: 'obs',
          feeling: 'feel',
          need: 'need',
          request: 'req',
        },
      },
      rejected: false,
      reason: null,
    });

    const { useThreadMessages } = await import('./useThreadMessages');

    const aiMediatedThread: Thread = {
      id: threadId,
      title: 'AI Mediated',
      createdAt: new Date(),
      status: 'open' as any,
      participants: [],
      topic: 'other',
      type: 'chat',
      controls: { requireAiApproval: true },
    };

    const { result } = renderHook(() =>
      useThreadMessages(threadId, aiMediatedThread)
    );

    act(() => {
      result.current.setNewMessage('Test message');
    });

    await act(async () => {
      await result.current.handleSendMessage();
    });

    expect(reviewMessage).toHaveBeenCalledWith({
      message: 'Test message',
      threadId,
    });
    expect(saveMessage).not.toHaveBeenCalled();
    expect(result.current.isReviewDialogOpen).toBe(true);
  });
});
