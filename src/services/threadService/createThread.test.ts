import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createThread } from "./createThread";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: "thread123", error: null }),
  },
}));

vi.mock("@/utils/authCache", () => ({
  requireCurrentUser: vi.fn().mockResolvedValue({ id: "user1" }),
  getUserProfile: vi.fn().mockResolvedValue({ name: "Alice" }),
}));

const { supabase } = await import("@/integrations/supabase/client");
const { requireCurrentUser, getUserProfile } = await import(
  "@/utils/authCache"
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createThread", () => {
  it("returns null for blank titles", async () => {
    const result = await createThread({
      title: "   ",
      ai: false,
      participantIds: ["u1"],
      topic: "other",
    });
    expect(result).toBeNull();
    expect(requireCurrentUser).not.toHaveBeenCalled();
  });

  it("returns null for titles over 50 chars", async () => {
    const longTitle = "a".repeat(51);
    const result = await createThread({
      title: longTitle,
      ai: false,
      participantIds: ["u1"],
      topic: "other",
    });
    expect(result).toBeNull();
    expect(requireCurrentUser).not.toHaveBeenCalled();
  });

  it("creates thread with trimmed title", async () => {
    const result = await createThread({
      title: " My Thread ",
      ai: false,
      participantIds: ["u1"],
      topic: "other",
    });
    expect(result).toEqual({
      id: "thread123",
      title: "My Thread",
      createdAt: expect.any(Date),
      status: "Open",
      participants: ["u1"],
      summary: "New thread created by Alice",
      topic: "other",
      controls: undefined,
      ai: false,
    });
    expect(requireCurrentUser).toHaveBeenCalledTimes(1);
    expect(getUserProfile).toHaveBeenCalledTimes(1);
    expect(supabase.rpc).toHaveBeenCalledWith("create_thread", {
      title: "My Thread",
      ai: false,
      topic: "other",
      participant_ids: ["u1"],
      controls: undefined,
    });
  });
});
