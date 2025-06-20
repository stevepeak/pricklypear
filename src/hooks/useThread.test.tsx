import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Thread } from '@/types/thread';
import React from 'react';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

const threadData: Thread = {
  id: 't1',
  title: 'Test',
  createdAt: new Date(),
  participants: [],
  topic: 'other',
  status: 'open' as any,
  type: 'default',
};

vi.mock('@/services/threadService', () => ({
  getThread: vi.fn().mockResolvedValue(threadData),
}));

describe('useThread', () => {
  it('returns thread data via react-query', async () => {
    const { useThread } = await import('./useThread');

    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useThread('t1'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(threadData));
  });

  it('does not execute query when threadId is undefined', async () => {
    const { useThread } = await import('./useThread');
    const { getThread } = await import('@/services/threadService');

    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useThread(undefined), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(vi.mocked(getThread)).not.toHaveBeenCalled();
  });
});
