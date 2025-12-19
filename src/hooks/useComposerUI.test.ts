import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useComposerUI } from './useComposerUI';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useComposerUI', () => {
  const mockMessagesEndRef = {
    current: {
      getBoundingClientRect: vi.fn(),
      scrollIntoView: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    localStorageMock.getItem.mockReturnValue('false');

    const { result } = renderHook(() => useComposerUI({}));

    expect(result.current.autoAccept).toBe(false);
    expect(result.current.showJumpToLatest).toBe(false);
    expect(typeof result.current.handleToggleAutoAccept).toBe('function');
    expect(typeof result.current.handleJumpToLatest).toBe('function');
  });

  it('should initialize with correct default state from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');

    const { result } = renderHook(() => useComposerUI({}));

    expect(result.current.autoAccept).toBe(true);
  });

  it('should load auto-accept preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');

    renderHook(() => useComposerUI({}));

    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'autoAcceptAISuggestions'
    );
  });

  it('should handle toggle auto-accept preference', () => {
    localStorageMock.getItem.mockReturnValue('false');

    const { result } = renderHook(() => useComposerUI({}));

    act(() => {
      result.current.handleToggleAutoAccept(true);
    });

    expect(result.current.autoAccept).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'autoAcceptAISuggestions',
      'true'
    );
  });

  it('should handle jump to latest', () => {
    const { result } = renderHook(() =>
      useComposerUI({
        messagesEndRef: mockMessagesEndRef as any,
      })
    );

    act(() => {
      result.current.handleJumpToLatest();
    });

    expect(mockMessagesEndRef.current.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('should show jump to latest button when not at bottom', () => {
    mockMessagesEndRef.current.getBoundingClientRect.mockReturnValue({
      bottom: window.innerHeight + 100, // Not at bottom
    });

    const { result } = renderHook(() =>
      useComposerUI({
        messagesEndRef: mockMessagesEndRef as any,
      })
    );

    // Simulate scroll event
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.showJumpToLatest).toBe(true);
  });

  it('should hide jump to latest button when at bottom', () => {
    mockMessagesEndRef.current.getBoundingClientRect.mockReturnValue({
      bottom: window.innerHeight - 50, // At bottom (more than 40px from bottom)
    });

    const { result } = renderHook(() =>
      useComposerUI({
        messagesEndRef: mockMessagesEndRef as any,
      })
    );

    // Simulate scroll event
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.showJumpToLatest).toBe(false);
  });

  it('should handle undefined messagesEndRef gracefully', () => {
    const { result } = renderHook(() => useComposerUI({}));

    // Should not throw error
    expect(() => {
      act(() => {
        result.current.handleJumpToLatest();
      });
    }).not.toThrow();
  });
});
