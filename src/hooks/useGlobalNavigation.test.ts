import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

let navigateSpy: ReturnType<typeof vi.fn>;
let registeredCb: ((path: string) => void) | undefined;
const unregisterSpy = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => {
    navigateSpy = vi.fn();
    return navigateSpy;
  },
}));

vi.mock('@/contexts/GlobalMessagesContext', () => ({
  useGlobalMessages: () => ({
    registerNavigationCallback: (cb: (path: string) => void) => {
      registeredCb = cb;
      return unregisterSpy;
    },
  }),
}));

describe('useGlobalNavigation', () => {
  it('registers navigation callback and navigates when invoked', async () => {
    const { useGlobalNavigation } = await import('./useGlobalNavigation');

    const { unmount } = renderHook(() => useGlobalNavigation());

    // Callback should have been registered
    expect(typeof registeredCb).toBe('function');

    registeredCb!('/threads/123');
    expect(navigateSpy).toHaveBeenCalledWith('/threads/123');

    // Unmount should trigger cleanup
    unmount();
    expect(unregisterSpy).toHaveBeenCalled();
  });
});
