import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  markMessagesInThreadAsRead,
  getAllUnreadCounts,
} from "../readReceipts";
import { supabase } from "../../../integrations/supabase/client";
import { requireCurrentUser } from "../../../utils/authCache";

// Mock the dependencies
vi.mock("../../../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../../../utils/authCache", () => ({
  requireCurrentUser: vi.fn(),
}));

describe("readReceipts", () => {
  const mockUser = { id: "user-123" };
  const mockThreadId = "thread-123";

  beforeEach(() => {
    vi.clearAllMocks();
    (
      requireCurrentUser as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockUser);
  });

  describe("markMessagesInThreadAsRead", () => {
    it("should mark messages as read successfully", async () => {
      // Mock unread messages
      const mockMessages = [
        {
          id: "msg-1",
          message_read_receipts: [{ user_id: mockUser.id, read_at: null }],
        },
        {
          id: "msg-2",
          message_read_receipts: [{ user_id: mockUser.id, read_at: null }],
        },
      ];

      // Mock Supabase responses
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          if (table === "messages") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    is: () => ({
                      data: mockMessages,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === "message_read_receipts") {
            return {
              upsert: () => ({
                error: null,
              }),
            };
          }
          return {};
        },
      );

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });
      expect(result).toBe(true);
    });

    it("should handle no unread messages", async () => {
      // Mock empty messages array
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          if (table === "messages") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    is: () => ({
                      data: [],
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      );

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });
      expect(result).toBe(true);
    });

    it("should handle errors when fetching messages", async () => {
      // Mock error response
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          if (table === "messages") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    is: () => ({
                      data: null,
                      error: new Error("Database error"),
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      );

      const result = await markMessagesInThreadAsRead({
        threadId: mockThreadId,
      });
      expect(result).toBe(false);
    });
  });

  describe("getAllUnreadCounts", () => {
    it("should return unread message counts by thread", async () => {
      const mockUnreadMessages = [
        {
          message_id: "msg-1",
          messages: { thread_id: "thread-1", user_id: "other-user" },
        },
        {
          message_id: "msg-2",
          messages: { thread_id: "thread-1", user_id: "other-user" },
        },
        {
          message_id: "msg-3",
          messages: { thread_id: "thread-2", user_id: "other-user" },
        },
      ];

      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          if (table === "message_read_receipts") {
            return {
              select: () => ({
                eq: () => ({
                  is: () => ({
                    data: mockUnreadMessages,
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        },
      );

      const result = await getAllUnreadCounts();
      expect(result).toEqual({
        "thread-1": 2,
        "thread-2": 1,
      });
    });

    it("should return empty object when no unread messages", async () => {
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          if (table === "message_read_receipts") {
            return {
              select: () => ({
                eq: () => ({
                  is: () => ({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {};
        },
      );

      const result = await getAllUnreadCounts();
      expect(result).toEqual({});
    });

    it("should handle errors gracefully", async () => {
      (supabase.from as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (table: string) => {
          if (table === "message_read_receipts") {
            return {
              select: () => ({
                eq: () => ({
                  is: () => ({
                    data: null,
                    error: new Error("Database error"),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      );

      const result = await getAllUnreadCounts();
      expect(result).toEqual({});
    });

    it("should return empty object when no user is found", async () => {
      (
        requireCurrentUser as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      const result = await getAllUnreadCounts();
      expect(result).toEqual({});
    });
  });
});
