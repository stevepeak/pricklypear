import { describe, it, expect, vi, beforeEach } from "vitest";

const upsertMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: upsertMock,
    })),
  },
}));

vi.mock("@/utils/authCache", () => ({
  requireCurrentUser: vi.fn().mockResolvedValue({ id: "user1" }),
}));

vi.mock("./utils", () => ({
  handleError: vi.fn().mockReturnValue(false),
}));

const { markMessagesAsRead } = await import("./readReceipts");
const { handleError } = await import("./utils");

beforeEach(() => {
  vi.clearAllMocks();
  upsertMock.mockResolvedValue({ error: null });
});

describe("markMessagesAsRead", () => {
  it("returns true on success", async () => {
    const result = await markMessagesAsRead(["m1"]);
    expect(result).toBe(true);
    expect(upsertMock).toHaveBeenCalled();
  });

  it("returns false on error", async () => {
    upsertMock.mockResolvedValue({ error: { message: "fail" } });
    const result = await markMessagesAsRead(["m1"]);
    expect(handleError).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
