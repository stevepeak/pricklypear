import { describe, it, expect, beforeEach, vi } from "vitest";
import { uploadThreadImage } from "./fileUpload";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
      })),
    },
  },
}));

describe("fileUpload", () => {
  const mockFile = new File(["test content"], "test.jpg", {
    type: "image/jpeg",
  });
  const threadId = "thread-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload image successfully", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any);

    const result = await uploadThreadImage(mockFile, threadId);

    expect(supabase.storage.from).toHaveBeenCalledWith("threads");
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${threadId}/[a-f0-9-]+\\.jpg$`)),
      mockFile,
    );
    expect(result).toMatch(new RegExp(`^${threadId}/[a-f0-9-]+\\.jpg$`));
  });

  it("should handle different file extensions", async () => {
    const pngFile = new File(["test content"], "test.png", {
      type: "image/png",
    });

    const { supabase } = await import("@/integrations/supabase/client");
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any);

    const result = await uploadThreadImage(pngFile, threadId);

    expect(result).toMatch(new RegExp(`^${threadId}/[a-f0-9-]+\\.png$`));
  });

  it("should throw error when upload fails", async () => {
    const uploadError = new Error("Upload failed");

    const { supabase } = await import("@/integrations/supabase/client");
    const mockUpload = vi.fn().mockResolvedValue({ error: uploadError });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any);

    await expect(uploadThreadImage(mockFile, threadId)).rejects.toThrow(
      "Upload failed",
    );
  });

  it("should generate unique file paths for each upload", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any);

    const result1 = await uploadThreadImage(mockFile, threadId);
    const result2 = await uploadThreadImage(mockFile, threadId);

    expect(result1).not.toBe(result2);
    expect(result1).toMatch(new RegExp(`^${threadId}/[a-f0-9-]+\\.jpg$`));
    expect(result2).toMatch(new RegExp(`^${threadId}/[a-f0-9-]+\\.jpg$`));
  });
});
