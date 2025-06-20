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

const { updateDocumentLabels } = await import("./updateDocumentLabels");

beforeEach(() => {
  vi.clearAllMocks();
  eqMock.mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqMock });
});

describe("updateDocumentLabels", () => {
  it("completes on success", async () => {
    await updateDocumentLabels("d1", []);
    expect(updateMock).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    updateMock.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
    });
    await expect(updateDocumentLabels("d1", [])).rejects.toThrow(
      "Failed to update document labels: fail",
    );
  });
});
