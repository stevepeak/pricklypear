import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Builds the required mocks for a single test-run and returns the freshly
 * imported `useUnreadMessages` hook alongside all relevant spies & helpers.
 */
async function loadHook() {
  /* ---------------------- Mock: getAllUnreadCounts ---------------------- */
  const mockGetAllUnreadCounts = vi.fn();
  vi.doMock('@/services/messageService', () => ({
    getAllUnreadCounts: mockGetAllUnreadCounts,
  }));

  /* --------------------------- Mock: useAuth --------------------------- */
  vi.doMock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'user-1' } }),
  }));

  /* ----------------------- Mock: useRealtimeMessages -------------------- */
  let realtimeCb: (
    total: number,
    counts: Record<string, number>
  ) => void = () => {};

  vi.doMock('./useRealtimeMessages', () => ({
    useRealtimeMessages: ({
      onUnreadCountsUpdated,
    }: {
      onUnreadCountsUpdated?: (
        total: number,
        counts: Record<string, number>
      ) => void;
    }) => {
      if (onUnreadCountsUpdated) realtimeCb = onUnreadCountsUpdated;
    },
  }));

  /* --------------------------- Import hook ----------------------------- */
  const { useUnreadMessages } = await import('./useUnreadMessages');

  return {
    useUnreadMessages,
    mockGetAllUnreadCounts,
    getRealtimeCb: () => realtimeCb,
  };
}

/* -------------------------------------------------------------------------- */
describe('useUnreadMessages', () => {
  beforeEach(() => {
    vi.resetModules(); // reset module graph between tests
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches initial unread counts on mount and populates state', async () => {
    const counts = { 'thread-1': 2, 'thread-2': 3 };

    const { useUnreadMessages, mockGetAllUnreadCounts } = await loadHook();
    mockGetAllUnreadCounts.mockResolvedValue(counts);

    const { result } = renderHook(() => useUnreadMessages());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalUnread).toBe(5);
    expect(result.current.threadCounts).toEqual(counts);
  });

  it('sets and clears the loading flag correctly around fetch', async () => {
    const counts = { 'thread-1': 1 };

    // Create a deferred promise so we can inspect state mid-fetch
    let resolvePromise: (v: unknown) => void = () => {};
    const deferred = new Promise<Record<string, number>>((res) => {
      resolvePromise = res;
    });

    const { useUnreadMessages, mockGetAllUnreadCounts } = await loadHook();
    mockGetAllUnreadCounts
      .mockReturnValueOnce(deferred)
      .mockResolvedValue(counts);

    const { result } = renderHook(() => useUnreadMessages());

    expect(result.current.isLoading).toBe(true);

    // Resolve fetch
    act(() => resolvePromise(counts));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.threadCounts).toEqual(counts);
  });

  it('handles errors from getAllUnreadCounts and clears loading flag', async () => {
    const error = new Error('boom');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { useUnreadMessages, mockGetAllUnreadCounts } = await loadHook();
    mockGetAllUnreadCounts.mockRejectedValue(error);

    const { result } = renderHook(() => useUnreadMessages());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalUnread).toBe(0);
    expect(result.current.threadCounts).toEqual({});
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching unread counts:',
      error
    );
  });

  it('reacts to real-time unread count updates', async () => {
    const initialCounts = { 'thread-1': 2 };
    const updatedCounts = { 'thread-1': 2, 'thread-2': 4 };
    const updatedTotal = 6;

    const { useUnreadMessages, mockGetAllUnreadCounts, getRealtimeCb } =
      await loadHook();
    mockGetAllUnreadCounts.mockResolvedValue(initialCounts);

    const { result } = renderHook(() => useUnreadMessages());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Emit real-time update
    act(() => {
      getRealtimeCb()(updatedTotal, updatedCounts);
    });

    expect(result.current.totalUnread).toBe(updatedTotal);
    expect(result.current.threadCounts).toEqual(updatedCounts);
  });
});
