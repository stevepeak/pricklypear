import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import {
  GlobalMessagesProvider,
  useGlobalMessages,
} from './GlobalMessagesContext';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useConnections', () => ({
  useConnections: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(),
  },
}));

vi.mock('@/services/messageService', () => ({
  getAllUnreadCounts: vi.fn(),
}));

vi.mock('@/services/messageService/utils', () => ({
  handleError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const { useAuth } = await import('@/contexts/AuthContext');
const { useConnections } = await import('@/hooks/useConnections');
const { supabase } = await import('@/integrations/supabase/client');
const { getAllUnreadCounts } = await import('@/services/messageService');

describe('GlobalMessagesContext', () => {
  let channelMock: {
    on: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
  };
  let messageInsertCallback: (payload: any) => void;
  let readReceiptCallback: (payload: any) => void;
  let calendarEventCallback: (payload: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup channel mock
    channelMock = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    };

    // Capture callbacks when .on() is called
    channelMock.on.mockImplementation((_event, config, callback) => {
      if (config.table === 'messages') {
        messageInsertCallback = callback;
      } else if (config.table === 'message_read_receipts') {
        readReceiptCallback = callback;
      } else if (config.table === 'calendar_events') {
        calendarEventCallback = callback;
      }
      return channelMock;
    });

    vi.mocked(supabase.channel).mockReturnValue(channelMock as any);

    // Mock auth and connections
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      sendMagicLink: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(useConnections).mockReturnValue({
      connections: [],
      acceptedConnections: [],
      isLoading: false,
      lookupById: vi.fn((id) => ({
        id,
        name: 'Test User',
        status: 'accepted',
      })) as any,
      refreshConnections: vi.fn(),
    });

    vi.mocked(getAllUnreadCounts).mockResolvedValue({});
  });

  describe('useGlobalMessages hook', () => {
    it('throws error when used outside GlobalMessagesProvider', () => {
      expect(() => renderHook(() => useGlobalMessages())).toThrow(
        'useGlobalMessages must be used within a GlobalMessagesProvider'
      );
    });
  });

  describe('GlobalMessagesProvider', () => {
    it('does not subscribe when user is not logged in', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      renderHook(() => useGlobalMessages(), { wrapper });

      expect(supabase.channel).not.toHaveBeenCalled();
    });

    it('subscribes to realtime channels when user is logged in', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith('global-messages');
      });

      expect(channelMock.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'messages',
        }),
        expect.any(Function)
      );

      expect(channelMock.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes on unmount', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { unmount } = renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(channelMock.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(channelMock.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('registerMessageCallback', () => {
    it('registers and calls message callback when new message arrives', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { result } = renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(channelMock.subscribe).toHaveBeenCalled();
      });

      const messageCallback = vi.fn();
      act(() => {
        result.current.registerMessageCallback(messageCallback);
      });

      // Simulate new message from realtime
      const newMessagePayload = {
        new: {
          id: 'msg-1',
          text: 'Hello',
          user_id: 'user-2',
          thread_id: 'thread-1',
          timestamp: new Date().toISOString(),
          type: 'user_message',
          details: {},
        },
      };

      await act(async () => {
        messageInsertCallback(newMessagePayload);
      });

      expect(messageCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'msg-1',
          text: 'Hello',
          threadId: 'thread-1',
        })
      );
    });

    it('unregisters message callback correctly', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { result } = renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(channelMock.subscribe).toHaveBeenCalled();
      });

      const messageCallback = vi.fn();
      let unregister: () => void = () => {};

      act(() => {
        unregister = result.current.registerMessageCallback(messageCallback);
      });

      // Unregister the callback
      act(() => {
        unregister();
      });

      // Simulate new message
      const newMessagePayload = {
        new: {
          id: 'msg-1',
          text: 'Hello',
          user_id: 'user-2',
          thread_id: 'thread-1',
          timestamp: new Date().toISOString(),
          type: 'user_message',
          details: {},
        },
      };

      await act(async () => {
        messageInsertCallback(newMessagePayload);
      });

      expect(messageCallback).not.toHaveBeenCalled();
    });
  });

  describe('registerUnreadCountsCallback', () => {
    it('registers and calls unread counts callback', async () => {
      vi.mocked(getAllUnreadCounts).mockResolvedValue({
        'thread-1': 3,
        'thread-2': 5,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { result } = renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(channelMock.subscribe).toHaveBeenCalled();
      });

      const countsCallback = vi.fn();
      act(() => {
        result.current.registerUnreadCountsCallback(countsCallback);
      });

      // Simulate read receipt change
      const readReceiptPayload = {
        new: {
          message_id: 'msg-1',
          user_id: 'user-1',
          read_at: new Date().toISOString(),
        },
      };

      await act(async () => {
        readReceiptCallback(readReceiptPayload);
      });

      await waitFor(() => {
        expect(countsCallback).toHaveBeenCalledWith(8, {
          'thread-1': 3,
          'thread-2': 5,
        });
      });
    });
  });

  describe('registerReadReceiptCallback', () => {
    it('registers and calls read receipt callback', async () => {
      vi.mocked(getAllUnreadCounts).mockResolvedValue({});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { result } = renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(channelMock.subscribe).toHaveBeenCalled();
      });

      const receiptCallback = vi.fn();
      act(() => {
        result.current.registerReadReceiptCallback(receiptCallback);
      });

      const readAt = new Date().toISOString();
      const readReceiptPayload = {
        new: {
          message_id: 'msg-1',
          user_id: 'user-1',
          read_at: readAt,
        },
      };

      await act(async () => {
        readReceiptCallback(readReceiptPayload);
      });

      await waitFor(() => {
        expect(receiptCallback).toHaveBeenCalledWith('msg-1', new Date(readAt));
      });
    });
  });

  describe('registerCalendarEventCallback', () => {
    it('registers and calls calendar event callback', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { result } = renderHook(() => useGlobalMessages(), { wrapper });

      await waitFor(() => {
        expect(channelMock.subscribe).toHaveBeenCalled();
      });

      const calendarCallback = vi.fn();
      act(() => {
        result.current.registerCalendarEventCallback(calendarCallback);
      });

      const eventPayload = {
        new: {
          id: 'event-1',
          title: 'Meeting',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: null as string | null,
          location: null as string | null,
          thread_id: null as string | null,
        },
      };

      act(() => {
        calendarEventCallback(eventPayload);
      });

      expect(calendarCallback).toHaveBeenCalledWith(eventPayload.new);
    });
  });

  describe('registerNavigationCallback', () => {
    it('registers navigation callback', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GlobalMessagesProvider>{children}</GlobalMessagesProvider>
      );

      const { result } = renderHook(() => useGlobalMessages(), { wrapper });

      const navCallback = vi.fn();
      act(() => {
        result.current.registerNavigationCallback(navCallback);
      });

      expect(result.current.registerNavigationCallback).toBeDefined();
    });
  });
});
