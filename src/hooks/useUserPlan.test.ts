import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function setupMocks({ success = true } = {}) {
  const single = vi.fn();
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq, single }));
  const from = vi.fn(() => ({ select, eq, single }));
  const supabaseStub = { from };

  vi.doMock('@/integrations/supabase/client', () => ({
    supabase: supabaseStub,
  }));

  vi.doMock('@/utils/authCache', () => ({
    requireCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
  }));

  const toastSpy = vi.fn();
  vi.doMock('sonner', () => ({ toast: toastSpy }));

  if (success) {
    single.mockResolvedValue({ data: { plan: 'premium' }, error: null });
  } else {
    single.mockResolvedValue({ data: null, error: new Error('db fail') });
  }

  return { toastSpy, supabaseStub };
}

describe('useUserPlan', () => {
  it('fetches user plan successfully', async () => {
    setupMocks();
    const { useUserPlan } = await import('./useUserPlan');

    const { result } = renderHook(() => useUserPlan());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.plan).toBe('premium');
    expect(result.current.error).toBeNull();
  });

  it('handles error when fetching fails', async () => {
    const { toastSpy } = setupMocks({ success: false });
    const { useUserPlan } = await import('./useUserPlan');

    const { result } = renderHook(() => useUserPlan());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(
      'Failed to load subscription information'
    );
    expect(toastSpy).toHaveBeenCalled();
  });

  it('refreshPlan refetches data', async () => {
    const { supabaseStub } = setupMocks();
    const { useUserPlan } = await import('./useUserPlan');

    const { result } = renderHook(() => useUserPlan());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Trigger refresh
    act(() => {
      result.current.refreshPlan();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(supabaseStub.from).toHaveBeenCalledTimes(2); // initial + refresh
  });
});
