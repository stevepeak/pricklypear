import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDraftManagement } from "./useDraftManagement";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useDraftManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load draft from localStorage when threadId changes", () => {
    const mockDraft = "Test draft message";
    localStorageMock.getItem.mockReturnValue(mockDraft);

    const setNewMessage = vi.fn();

    renderHook(() => useDraftManagement("thread-123", "", setNewMessage));

    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      "thread-draft-thread-123",
    );
    expect(setNewMessage).toHaveBeenCalledWith(mockDraft);
  });

  it("should save draft to localStorage when newMessage changes", () => {
    const setNewMessage = vi.fn();

    const { rerender } = renderHook(
      ({ threadId, newMessage }) =>
        useDraftManagement(threadId, newMessage, setNewMessage),
      {
        initialProps: { threadId: "thread-123", newMessage: "", setNewMessage },
      },
    );

    // Update with new message
    rerender({
      threadId: "thread-123",
      newMessage: "New message",
      setNewMessage,
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "thread-draft-thread-123",
      "New message",
    );
  });

  it("should remove draft from localStorage when message is empty", () => {
    const setNewMessage = vi.fn();

    const { rerender } = renderHook(
      ({ threadId, newMessage }) =>
        useDraftManagement(threadId, newMessage, setNewMessage),
      {
        initialProps: {
          threadId: "thread-123",
          newMessage: "Some message",
          setNewMessage,
        },
      },
    );

    // Update with empty message
    rerender({ threadId: "thread-123", newMessage: "", setNewMessage });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "thread-draft-thread-123",
    );
  });

  it("should not load draft if threadId is undefined", () => {
    const setNewMessage = vi.fn();

    renderHook(() => useDraftManagement(undefined, "", setNewMessage));

    expect(localStorageMock.getItem).not.toHaveBeenCalled();
    expect(setNewMessage).not.toHaveBeenCalled();
  });

  it("should not save draft if threadId is undefined", () => {
    const setNewMessage = vi.fn();

    renderHook(() =>
      useDraftManagement(undefined, "Test message", setNewMessage),
    );

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("should return clearDraftFromStorage function", () => {
    const setNewMessage = vi.fn();

    const { result } = renderHook(() =>
      useDraftManagement("thread-123", "Test message", setNewMessage),
    );

    expect(typeof result.current.clearDraftFromStorage).toBe("function");
  });

  it("should clear draft from localStorage when clearDraftFromStorage is called", () => {
    const setNewMessage = vi.fn();

    const { result } = renderHook(() =>
      useDraftManagement("thread-123", "Test message", setNewMessage),
    );

    act(() => {
      result.current.clearDraftFromStorage("thread-123");
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "thread-draft-thread-123",
    );
  });

  it("should not update message if saved draft is the same as current message", () => {
    const mockDraft = "Same message";
    localStorageMock.getItem.mockReturnValue(mockDraft);

    const setNewMessage = vi.fn();

    renderHook(() =>
      useDraftManagement("thread-123", mockDraft, setNewMessage),
    );

    expect(setNewMessage).not.toHaveBeenCalled();
  });
});
