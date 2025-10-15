import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

let registerMessageCbSpy: (cb: any) => void;
let registerUnreadCbSpy: (cb: any) => void;
let registerReadReceiptCbSpy: (cb: any) => void;
const unregister1 = vi.fn();
const unregister2 = vi.fn();
const unregister3 = vi.fn();

vi.mock('@/contexts/GlobalMessagesContext', () => ({
  useGlobalMessages: () => ({
    registerMessageCallback: (cb: any) => {
      registerMessageCbSpy = cb;
      return unregister1;
    },
    registerUnreadCountsCallback: (cb: any) => {
      registerUnreadCbSpy = cb;
      return unregister2;
    },
    registerReadReceiptCallback: (cb: any) => {
      registerReadReceiptCbSpy = cb;
      return unregister3;
    },
  }),
}));

describe('useRealtimeMessages', () => {
  it('registers callbacks and cleans up on unmount', async () => {
    const { useRealtimeMessages } = await import('./useRealtimeMessages');

    const props = {
      onMessageReceived: vi.fn(),
      onUnreadCountsUpdated: vi.fn(),
      onReadReceiptUpdated: vi.fn(),
    };

    const { unmount } = renderHook(() => useRealtimeMessages(props));

    // Callbacks should be registered
    expect(typeof registerMessageCbSpy).toBe('function');
    expect(typeof registerUnreadCbSpy).toBe('function');
    expect(typeof registerReadReceiptCbSpy).toBe('function');

    // Unmount triggers unregistration
    unmount();
    expect(unregister1).toHaveBeenCalled();
    expect(unregister2).toHaveBeenCalled();
    expect(unregister3).toHaveBeenCalled();
  });

  it('invokes onMessageReceived when message callback is triggered', async () => {
    const { useRealtimeMessages } = await import('./useRealtimeMessages');

    const props = {
      onMessageReceived: vi.fn(),
      onUnreadCountsUpdated: vi.fn(),
      onReadReceiptUpdated: vi.fn(),
    };

    renderHook(() => useRealtimeMessages(props));

    // Simulate message received
    const mockMessage = {
      id: 'msg-1',
      text: 'Hello',
      threadId: 'thread-1',
      sender: { id: 'user-1', name: 'Test User' },
      timestamp: new Date(),
      type: 'user_message' as const,
      details: {},
    };

    registerMessageCbSpy(mockMessage);

    expect(props.onMessageReceived).toHaveBeenCalledWith(mockMessage);
  });

  it('invokes onUnreadCountsUpdated when unread counts callback is triggered', async () => {
    const { useRealtimeMessages } = await import('./useRealtimeMessages');

    const props = {
      onMessageReceived: vi.fn(),
      onUnreadCountsUpdated: vi.fn(),
      onReadReceiptUpdated: vi.fn(),
    };

    renderHook(() => useRealtimeMessages(props));

    // Simulate unread counts update
    const totalUnread = 5;
    const threadCounts = { 'thread-1': 3, 'thread-2': 2 };

    registerUnreadCbSpy(totalUnread, threadCounts);

    expect(props.onUnreadCountsUpdated).toHaveBeenCalledWith(
      totalUnread,
      threadCounts
    );
  });

  it('invokes onReadReceiptUpdated when read receipt callback is triggered', async () => {
    const { useRealtimeMessages } = await import('./useRealtimeMessages');

    const props = {
      onMessageReceived: vi.fn(),
      onUnreadCountsUpdated: vi.fn(),
      onReadReceiptUpdated: vi.fn(),
    };

    renderHook(() => useRealtimeMessages(props));

    // Simulate read receipt update
    const messageId = 'msg-1';
    const readAt = new Date();

    registerReadReceiptCbSpy(messageId, readAt);

    expect(props.onReadReceiptUpdated).toHaveBeenCalledWith(messageId, readAt);
  });

  it('handles missing optional callbacks gracefully', async () => {
    const { useRealtimeMessages } = await import('./useRealtimeMessages');

    // Only provide onMessageReceived
    const props = {
      onMessageReceived: vi.fn(),
    };

    const { unmount } = renderHook(() => useRealtimeMessages(props));

    // Should not throw when optional callbacks are triggered
    expect(() => {
      registerUnreadCbSpy?.(5, {});
      registerReadReceiptCbSpy?.('msg-1', new Date());
    }).not.toThrow();

    unmount();
  });
});
