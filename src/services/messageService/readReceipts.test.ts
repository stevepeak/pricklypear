import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markMessagesInThreadAsRead, getAllUnreadCounts } from './readReceipts';
import {
  createMockSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  createMockUser,
} from '@/test-utils';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

vi.mock('@/utils/authCache', () => ({
  requireCurrentUser: vi.fn(),
}));

const { requireCurrentUser } = await import('@/utils/authCache');

describe('readReceipts', () => {
  let supabaseMock: ReturnType<typeof createMockSupabaseClient>;
  const mockUser = createMockUser({ id: 'user-123' });
  const mockThreadId = 'thread-123';

  beforeEach(async () => {
    vi.clearAllMocks();
    supabaseMock = createMockSupabaseClient();
    vi.mocked(requireCurrentUser).mockResolvedValue(mockUser as any);

    // Replace the mock
    const supabaseModule = await import('@/integrations/supabase/client');
    Object.assign(supabaseModule.supabase, supabaseMock.supabase);
  });

  describe('markMessagesInThreadAsRead', () => {
    it('should mark messages as read successfully', async () => {
      // Mock unread messages
      const mockMessages = [
        {
          id: 'msg-1',
          message_read_receipts: [{ user_id: mockUser.id, read_at: null }],
        },
        {
          id: 'msg-2',
          message_read_receipts: [{ user_id: mockUser.id, read_at: null }],
        },
      ];

      // Setup query chain
      const mockIs = vi
        .fn()
        .mockResolvedValue(createSuccessResponse(mockMessages));
      const mockEq2 = vi.fn().mockReturnValue({ is: mockIs });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'messages') {
          return { select: mockSelect } as any;
        }
        if (table === 'message_read_receipts') {
          return {
            upsert: vi.fn().mockResolvedValue(createSuccessResponse({})),
          } as any;
        }
        return {} as any;
      });

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });

      expect(result).toBe(true);
      expect(mockSelect).toHaveBeenCalledWith(
        'id, message_read_receipts!inner(user_id, read_at)'
      );
    });

    it('should handle no unread messages', async () => {
      const mockIs = vi.fn().mockResolvedValue(createSuccessResponse([]));
      const mockEq2 = vi.fn().mockReturnValue({ is: mockIs });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'messages') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });

      expect(result).toBe(true);
    });

    it('should handle errors when fetching messages', async () => {
      const mockIs = vi
        .fn()
        .mockResolvedValue(createErrorResponse('Database error'));
      const mockEq2 = vi.fn().mockReturnValue({ is: mockIs });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'messages') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });

      expect(result).toBe(false);
    });

    it('should handle errors when upserting read receipts', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          message_read_receipts: [{ user_id: mockUser.id, read_at: null }],
        },
      ];

      const mockIs = vi
        .fn()
        .mockResolvedValue(createSuccessResponse(mockMessages));
      const mockEq2 = vi.fn().mockReturnValue({ is: mockIs });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'messages') {
          return { select: mockSelect } as any;
        }
        if (table === 'message_read_receipts') {
          return {
            upsert: vi
              .fn()
              .mockResolvedValue(createErrorResponse('Upsert failed')),
          } as any;
        }
        return {} as any;
      });

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });

      expect(result).toBe(false);
    });
  });

  describe('getAllUnreadCounts', () => {
    it('should return unread message counts by thread', async () => {
      const mockUnreadMessages = [
        {
          message_id: 'msg-1',
          messages: { thread_id: 'thread-1', user_id: 'other-user' },
        },
        {
          message_id: 'msg-2',
          messages: { thread_id: 'thread-1', user_id: 'other-user' },
        },
        {
          message_id: 'msg-3',
          messages: { thread_id: 'thread-2', user_id: 'other-user' },
        },
      ];

      const mockIs = vi
        .fn()
        .mockResolvedValue(createSuccessResponse(mockUnreadMessages));
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'message_read_receipts') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const result = await getAllUnreadCounts();

      expect(result).toEqual({
        'thread-1': 2,
        'thread-2': 1,
      });
    });

    it('should return empty object when no unread messages', async () => {
      const mockIs = vi.fn().mockResolvedValue(createSuccessResponse([]));
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'message_read_receipts') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const result = await getAllUnreadCounts();

      expect(result).toEqual({});
    });

    it('should handle errors gracefully', async () => {
      const mockIs = vi
        .fn()
        .mockResolvedValue(createErrorResponse('Database error'));
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'message_read_receipts') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const result = await getAllUnreadCounts();

      expect(result).toEqual({});
    });

    it('should return empty object when no user is found', async () => {
      vi.mocked(requireCurrentUser).mockResolvedValue(null);

      const result = await getAllUnreadCounts();

      expect(result).toEqual({});
    });

    it('counts all unread messages regardless of sender', async () => {
      const mockUnreadMessages = [
        {
          message_id: 'msg-1',
          messages: { thread_id: 'thread-1', user_id: 'other-user' },
        },
        {
          message_id: 'msg-2',
          messages: { thread_id: 'thread-1', user_id: mockUser.id }, // From current user
        },
        {
          message_id: 'msg-3',
          messages: { thread_id: 'thread-2', user_id: 'other-user' },
        },
      ];

      const mockIs = vi
        .fn()
        .mockResolvedValue(createSuccessResponse(mockUnreadMessages));
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      supabaseMock.mocks.from.mockImplementation((table: string) => {
        if (table === 'message_read_receipts') {
          return { select: mockSelect } as any;
        }
        return {} as any;
      });

      const result = await getAllUnreadCounts();

      // Counts all unread messages, even from current user
      expect(result).toEqual({
        'thread-1': 2,
        'thread-2': 1,
      });
    });
  });
});
