import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

/* --------------------------- Mock ConnectionsCtx --------------------------- */
vi.mock('@/contexts/ConnectionsContext', () => {
  const connections = [
    { id: 'c1', status: 'accepted', name: 'Alice' },
    { id: 'c2', status: 'pending', name: 'Bob' },
  ];
  const refreshConnections = vi.fn();
  return {
    useConnectionsContext: () => ({
      connections,
      isLoading: false,
      refreshConnections,
    }),
  };
});

/* ---------------------------------- Tests --------------------------------- */

describe('useConnections', () => {
  it('returns connections, acceptedConnections & lookupById', async () => {
    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    expect(result.current.connections.length).toBe(2);
    expect(result.current.acceptedConnections).toEqual([
      expect.objectContaining({ id: 'c1' }),
    ]);

    expect(result.current.lookupById('c1')).toEqual(
      expect.objectContaining({ id: 'c1' })
    );
    expect(result.current.lookupById('missing')).toBeUndefined();
  });
});
