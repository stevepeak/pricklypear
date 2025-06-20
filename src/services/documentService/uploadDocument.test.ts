import { describe, it, expect, vi, beforeEach } from "vitest";

const uploadMock = vi.fn();
const removeMock = vi.fn();
const invokeMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: uploadMock,
        remove: removeMock,
      })),
    },
    functions: { invoke: invokeMock },
    auth: { getSession: getSessionMock },
  },
}));

const { uploadDocument } = await import("./uploadDocument");

beforeEach(() => {
  vi.clearAllMocks();
  getSessionMock.mockResolvedValue({
    data: { session: { access_token: "t" } },
  });
});

describe("uploadDocument", () => {
  it("returns data on success", async () => {
    uploadMock.mockResolvedValue({ data: { path: "p" }, error: null });
    invokeMock.mockResolvedValue({ data: { status: "success" }, error: null });
    const file = new File(["foo"], "f.txt");
    const result = await uploadDocument(file, "u1");
    expect(result).toEqual({ status: "success" });
    expect(uploadMock).toHaveBeenCalled();
    expect(invokeMock).toHaveBeenCalled();
  });

  it("handles upload error", async () => {
    uploadMock.mockResolvedValue({ data: null, error: { message: "fail" } });
    const file = new File(["foo"], "f.txt");
    const result = await uploadDocument(file, "u1");
    expect(result.status).toBe("error");
    expect(result.message).toMatch("Upload failed");
  });

  it("cleans up on extract error", async () => {
    uploadMock.mockResolvedValue({ data: { path: "p" }, error: null });
    invokeMock.mockResolvedValue({ data: null, error: { message: "extract" } });
    const file = new File(["foo"], "f.txt");
    const result = await uploadDocument(file, "u1");
    expect(removeMock).toHaveBeenCalledWith(["p"]);
    expect(result.status).toBe("error");
  });
});
