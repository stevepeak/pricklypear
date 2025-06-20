import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* -------------------------------------------------------------------------- */
/*                               Window helpers                               */
/* -------------------------------------------------------------------------- */

// JSDOM makes window.location mostly read-only; redefine for tests
const ORIGINAL_LOCATION = window.location;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  // @ts-expect-error – redefine for tests
  delete window.location;
  // minimal location object with origin + href mutable
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  window.location = {
    origin: 'http://localhost',
    href: 'about:blank',
  } as Location;
});

afterEach(() => {
  // Restore original location
  // @ts-expect-error override restore
  window.location = ORIGINAL_LOCATION;
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */
/*                                    Mocks                                   */
/* -------------------------------------------------------------------------- */

function setupMocks() {
  const invoke = vi.fn();
  vi.doMock('@/integrations/supabase/client', () => ({
    supabase: { functions: { invoke } },
  }));

  vi.doMock('@/utils/authCache', () => ({
    requireCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }),
  }));

  vi.doMock('sonner', () => ({ toast: vi.fn() }));

  return { invoke };
}

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe('useSubscription', () => {
  it('starts checkout session and redirects user', async () => {
    const { invoke } = setupMocks();

    invoke.mockResolvedValue({
      data: { url: 'https://stripe.com/checkout' },
      error: null,
    });

    const { useSubscription } = await import('./useSubscription');

    const { result } = renderHook(() => useSubscription());

    await act(async () => {
      await result.current.createCheckoutSession();
    });

    expect(invoke).toHaveBeenCalledWith(
      'create-checkout-session',
      expect.anything()
    );
    expect(window.location.href).toBe('https://stripe.com/checkout');
    expect(result.current.isLoading).toBe(false);
  });

  it('opens customer portal and redirects user', async () => {
    const { invoke } = setupMocks();
    invoke.mockResolvedValue({
      data: { url: 'https://stripe.com/portal' },
      error: null,
    });

    const { useSubscription } = await import('./useSubscription');
    const { result } = renderHook(() => useSubscription());

    await act(async () => {
      await result.current.openCustomerPortal();
    });

    expect(invoke).toHaveBeenCalledWith(
      'create-portal-session',
      expect.anything()
    );
    expect(window.location.href).toBe('https://stripe.com/portal');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles error from supabase function', async () => {
    const { invoke } = setupMocks();
    const err = new Error('boom');
    invoke.mockResolvedValue({ data: null, error: err });
    const toastSpy = vi.fn();

    vi.doMock('sonner', () => ({ toast: toastSpy }));

    const { useSubscription } = await import('./useSubscription');
    const { result } = renderHook(() => useSubscription());

    await act(async () => {
      await result.current.createCheckoutSession();
    });

    expect(toastSpy).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
