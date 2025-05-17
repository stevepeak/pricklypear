import { describe, expect, it, vi } from "vitest";
import { createThread } from "./createThread.js";

// --- mocks ---------------------------------------------------------------
const rpcMock = vi.fn();

// Supabase client mock
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: rpcMock },
}));

// Auth cache mock
vi.mock("@/utils/authCache", () => ({
  requireCurrentUser: () => Promise.resolve({ id: "user1" }),
}));

// -------------------------------------------------------------------------

describe("createThread()", () => {
  it("returns null and does NOT call RPC when title exceeds 50 characters", async () => {
    const longTitle = "a".repeat(51);

    const result = await createThread(longTitle, ["contact-1"]);

    expect(result).toBeNull();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("trims, validates and calls RPC for a valid title", async () => {
    const rawTitle = "   Valid Thread Title   ";
    const trimmedTitle = "Valid Thread Title";
    const fakeThreadId = "thread-123";

    rpcMock.mockResolvedValueOnce({ data: fakeThreadId, error: null });

    const result = await createThread(rawTitle, ["contact-2"]);

    expect(rpcMock).toHaveBeenCalledWith("create_thread", {
      title: trimmedTitle,
      topic: "other",
      participant_ids: ["contact-2"],
    });

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      id: fakeThreadId,
      title: trimmedTitle,
      participants: ["contact-2"],
      status: "open",
      summary: null,
      topic: "other",
    });
    expect(result?.createdAt).toBeInstanceOf(Date);
  });
});
