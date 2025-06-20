import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* -------------------------------------------------------------------------- */
/*                               Helper / mocks                               */
/* -------------------------------------------------------------------------- */

function buildSupabaseMock() {
  const chainFetch = vi.fn();
  const order = vi.fn();
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq, order }));
  const fetchFrom = vi.fn(() => ({ select, insert, delete: del }));

  // insert chain
  const single = vi.fn();
  const selectAfterInsert = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select: selectAfterInsert, single }));

  // delete chain
  const delEq = vi.fn();
  const del = vi.fn(() => ({ eq: delEq }));

  const supabaseStub = {
    from: fetchFrom,
  } as any;

  return {
    supabaseStub,
    fetchFrom,
    select,
    eq,
    order,
    insert,
    single,
    del,
    delEq,
  };
}

function setupMocks(subs: any[] = []) {
  const { supabaseStub, order, single, delEq } = buildSupabaseMock();

  /* --------------------------- Mock Supabase Client -------------------------- */
  vi.doMock('@/integrations/supabase/client', () => ({
    supabase: supabaseStub,
  }));

  /* ---------------------- Mock requireCurrentUser util ----------------------- */
  vi.doMock('@/utils/authCache', () => ({
    requireCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
  }));

  // Successful fetch
  order.mockResolvedValue({ data: subs, error: null });

  // insert success – will return new sub
  const inserted = {
    id: 'newSub',
    name: 'My Cal',
    user_id: 'u1',
    created_at: new Date().toISOString(),
  };
  single.mockResolvedValue({ data: inserted, error: null });

  // delete success
  delEq.mockResolvedValue({ error: null });

  return { inserted };
}

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('useCalendarSubscriptions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it('fetches subscriptions on mount', async () => {
    const subs = [
      {
        id: 's1',
        name: 'Cal 1',
        user_id: 'u1',
        created_at: new Date().toISOString(),
      },
    ];
    setupMocks(subs);

    const { useCalendarSubscriptions } = await import(
      './useCalendarSubscriptions'
    );

    const { result } = renderHook(() => useCalendarSubscriptions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subscriptions).toEqual(subs);
  });

  it('createSubscription adds new sub to state', async () => {
    const { inserted } = setupMocks();

    const { useCalendarSubscriptions } = await import(
      './useCalendarSubscriptions'
    );

    const { result } = renderHook(() => useCalendarSubscriptions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createSubscription('My Cal');
    });

    expect(result.current.subscriptions[0]).toEqual(inserted);
  });

  it('deleteSubscription removes sub from state', async () => {
    const subs = [
      {
        id: 's1',
        name: 'Cal 1',
        user_id: 'u1',
        created_at: new Date().toISOString(),
      },
    ];
    setupMocks(subs);

    const { useCalendarSubscriptions } = await import(
      './useCalendarSubscriptions'
    );

    const { result } = renderHook(() => useCalendarSubscriptions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subscriptions.length).toBe(1);

    await act(async () => {
      await result.current.deleteSubscription('s1');
    });

    expect(result.current.subscriptions.length).toBe(0);
  });
});
