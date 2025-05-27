import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useThreadMessages } from "./useThreadMessages";
import type { Thread } from "@/types/thread";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user1" } }),
}));

vi.mock("@/hooks/useConnections", () => ({
  useConnections: () => ({ connections: [] }),
}));

vi.mock("sonner", () => ({ toast: vi.fn() }));

const getMessages = vi.fn().mockResolvedValue([
  {
    id: "m1",
    text: "hello",
    sender: "user1",
    timestamp: new Date(),
    threadId: "t1",
    isCurrentUser: true,
    type: "user_message",
    details: null,
  },
]);
const getUnreadMessageCount = vi.fn().mockResolvedValue(0);

vi.mock("@/services/messageService", () => ({
  getMessages: (...args: unknown[]) => getMessages(...args),
  getUnreadMessageCount: (...args: unknown[]) => getUnreadMessageCount(...args),
}));

const saveMessage = vi.fn().mockResolvedValue(true);
vi.mock("@/services/messageService/save-message", () => ({
  saveMessage: (...args: unknown[]) => saveMessage(...args),
}));

vi.mock("@/services/threadService", () => ({
  generateThreadSummary: vi.fn().mockResolvedValue("summary"),
  uploadThreadImage: vi.fn().mockResolvedValue({ publicUrl: "url" }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useThreadMessages", () => {
  it("loads messages", async () => {
    const setThread = vi.fn();
    const { result } = renderHook(() =>
      useThreadMessages("t1", null as unknown as Thread, setThread),
    );

    await act(async () => {
      await result.current.loadMessages();
    });

    expect(getMessages).toHaveBeenCalledWith({
      threadId: "t1",
      connections: [],
    });
    expect(result.current.messages).toHaveLength(1);
  });

  it("saves message when handleSendReviewedMessage is called", async () => {
    const setThread = vi.fn();
    const { result } = renderHook(() =>
      useThreadMessages("t1", null as unknown as Thread, setThread),
    );

    await act(async () => {
      await result.current.handleSendReviewedMessage("hi");
    });

    expect(saveMessage).toHaveBeenCalledWith({
      threadId: "t1",
      text: "hi",
      type: "user_message",
    });
    expect(result.current.messages[0].text).toBe("hi");
  });

  it("uploads image and saves message", async () => {
    const setThread = vi.fn();
    const { result } = renderHook(() =>
      useThreadMessages("t1", null as unknown as Thread, setThread),
    );

    const file = new File(["foo"], "pic.png");
    await act(async () => {
      await result.current.handleUploadImage(file);
    });

    expect(saveMessage).toHaveBeenCalledWith({
      threadId: "t1",
      text: "<img>",
      type: "user_message",
      details: { imageUrl: "url", filename: "pic.png" },
    });
    expect(result.current.messages[0].details).toEqual({
      imageUrl: "url",
      filename: "pic.png",
    });
  });
});
