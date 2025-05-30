import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      functions: {
        invoke: vi.fn(),
      },
    },
  };
});

let supabase;

beforeEach(async () => {
  vi.resetModules();
  ({ supabase } = await import("@/integrations/supabase/client"));
});

async function load() {
  return await import("./messageReview");
}

describe("reviewMessage", () => {
  it("returns data on success", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { rephrasedMessage: "hi", rejected: false, reason: null },
      error: null,
    });
    const mod = await load();
    const res = await mod.reviewMessage({ message: "hello", threadId: "t1" });
    expect(res).toEqual({
      rephrasedMessage: "hi",
      rejected: false,
      reason: null,
    });
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "review-message",
      expect.objectContaining({
        body: expect.objectContaining({
          message: "hello",
          threadId: "t1",
        }),
      }),
    );
  });

  it("handles supabase errors", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "bad" },
    });
    const mod = await load();
    const res = await mod.reviewMessage({ message: "msg", threadId: "t2" });
    expect(res).toEqual({
      rephrasedMessage: "msg",
      rejected: true,
      reason: "bad",
    });
  });

  it("handles thrown errors", async () => {
    supabase.functions.invoke.mockRejectedValue(new Error("oops"));
    const mod = await load();
    const res = await mod.reviewMessage({ message: "x", threadId: "t3" });
    expect(res).toEqual({
      rephrasedMessage: "x",
      rejected: true,
      reason: "oops",
    });
  });
});
