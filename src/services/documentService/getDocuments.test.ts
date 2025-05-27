import { describe, it, expect, vi, beforeEach } from "vitest";

const orderMock = vi.fn();
const singleMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: orderMock,
      single: singleMock,
    })),
  },
}));

const { getDocuments, getDocument } = await import("./getDocuments");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDocuments", () => {
  it("returns docs on success", async () => {
    orderMock.mockResolvedValue({ data: [{ id: "d1" }], error: null });
    const result = await getDocuments("u1");
    expect(result).toEqual([{ id: "d1" }]);
  });

  it("throws on error", async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: "fail" } });
    await expect(getDocuments("u1")).rejects.toThrow(
      "Failed to fetch documents: fail",
    );
  });
});

describe("getDocument", () => {
  it("returns null when not found", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const result = await getDocument("d1", "u1");
    expect(result).toBeNull();
  });

  it("throws on other errors", async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { code: "Other", message: "fail" },
    });
    await expect(getDocument("d1", "u1")).rejects.toThrow(
      "Failed to fetch document: fail",
    );
  });
});
