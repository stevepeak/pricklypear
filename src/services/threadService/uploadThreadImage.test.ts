import { describe, it, expect, vi, beforeEach } from "vitest";

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })),
    },
  },
}));

const { uploadThreadImage } = await import("./uploadThreadImage");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadThreadImage", () => {
  it("returns upload info on success", async () => {
    uploadMock.mockResolvedValue({
      data: { path: "thread/t/img.png" },
      error: null,
    });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: "url" } });
    const file = new File(["foo"], "img.png");
    const result = await uploadThreadImage(file, "t");
    expect(result).toEqual({ path: "thread/t/img.png", publicUrl: "url" });
    expect(uploadMock).toHaveBeenCalled();
  });

  it("throws on upload error", async () => {
    uploadMock.mockResolvedValue({ data: null, error: { message: "fail" } });
    const file = new File(["foo"], "img.png");
    await expect(uploadThreadImage(file, "t")).rejects.toThrow("fail");
  });
});
