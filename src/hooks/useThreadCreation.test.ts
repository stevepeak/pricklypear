import { renderHook, act } from "@testing-library/react";
import { useThreadCreation } from "./useThreadCreation";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@supabase/supabase-js";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("sonner", () => ({ toast: vi.fn() }));

const createThread = vi
  .fn()
  .mockResolvedValue({ id: "t1", title: "My Thread" });
const generateThreadConversation = vi.fn();

vi.mock("@/services/threadService", () => ({
  createThread: (...args: unknown[]) => createThread(...args),
  generateThreadConversation: (...args: unknown[]) =>
    generateThreadConversation(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useThreadCreation", () => {
  it("calls createThread when handleCreateThread is invoked", async () => {
    const onCreated = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => useThreadCreation(onCreated, onClose));

    act(() => {
      result.current.setNewThreadTitle("My Thread");
      result.current.setSelectedContactIds(["u1"]);
      result.current.setSelectedTopic("other");
    });

    await act(async () => {
      await result.current.handleCreateThread({ id: "user1" } as User);
    });

    expect(createThread).toHaveBeenCalledWith({
      title: "My Thread",
      ai: false,
      participantIds: ["u1"],
      topic: "other",
      controls: { requireAiApproval: true },
    });
    expect(onCreated).toHaveBeenCalledWith({ id: "t1", title: "My Thread" });
  });

  it("creates AI chat when handleCreateAIChat is called", async () => {
    const { result } = renderHook(() => useThreadCreation(vi.fn(), vi.fn()));

    await act(async () => {
      await result.current.handleCreateAIChat({ id: "user1" } as User);
    });

    expect(createThread).toHaveBeenCalledWith({
      title: "AI Chat",
      ai: true,
      topic: "other",
    });
  });
});
