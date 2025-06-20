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
});
