import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockConnections: any[] = [];
let mockIsLoading = false;
let mockRefreshConnections = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Reset to default values
  mockConnections = [
    { id: 'c1', status: 'accepted', name: 'Alice' },
    { id: 'c2', status: 'pending', name: 'Bob' },
  ];
  mockIsLoading = false;
  mockRefreshConnections = vi.fn();
});

/* --------------------------- Mock ConnectionsCtx --------------------------- */
vi.mock('@/contexts/ConnectionsContext', () => ({
  useConnectionsContext: () => ({
    connections: mockConnections,
    isLoading: mockIsLoading,
    refreshConnections: mockRefreshConnections,
  }),
}));

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

  it('filters only accepted connections', async () => {
    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    expect(result.current.acceptedConnections.length).toBe(1);
    expect(result.current.acceptedConnections[0].status).toBe('accepted');
  });

  it('exposes loading state from context', async () => {
    mockIsLoading = true;
    mockConnections = [];

    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    expect(result.current.isLoading).toBe(true);
  });

  it('handles empty connections list', async () => {
    mockConnections = [];

    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    expect(result.current.connections).toEqual([]);
    expect(result.current.acceptedConnections).toEqual([]);
    expect(result.current.lookupById('any-id')).toBeUndefined();
  });

  it('calls refreshConnections from context', async () => {
    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    result.current.refreshConnections();

    expect(mockRefreshConnections).toHaveBeenCalled();
  });

  it('lookupById returns connection with all properties', async () => {
    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    const connection = result.current.lookupById('c1');

    expect(connection).toMatchObject({
      id: 'c1',
      status: 'accepted',
      name: 'Alice',
    });
  });

  it('handles connections with different statuses', async () => {
    mockConnections = [
      { id: 'c1', status: 'accepted', name: 'Alice' },
      { id: 'c2', status: 'pending', name: 'Bob' },
      { id: 'c3', status: 'declined', name: 'Charlie' },
      { id: 'c4', status: 'disabled', name: 'Dave' },
    ];

    const { useConnections } = await import('./useConnections');

    const { result } = renderHook(() => useConnections());

    expect(result.current.connections.length).toBe(4);
    expect(result.current.acceptedConnections.length).toBe(1);
    expect(result.current.acceptedConnections[0].id).toBe('c1');
  });
});
