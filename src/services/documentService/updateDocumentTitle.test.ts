import { describe, it, expect, vi, beforeEach } from "vitest";

const updateMock = vi.fn();
const eqMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      update: updateMock,
    })),
  },
}));

const { updateDocumentTitle } = await import("./updateDocumentTitle");

beforeEach(() => {
  vi.clearAllMocks();
  eqMock.mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqMock });
});

describe("updateDocumentTitle", () => {
  it("completes on success", async () => {
    await updateDocumentTitle("d1", "Title");
    expect(updateMock).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    updateMock.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
    });
    await expect(updateDocumentTitle("d1", "Title")).rejects.toThrow(
      "Failed to update document title: fail",
    );
  });
});
