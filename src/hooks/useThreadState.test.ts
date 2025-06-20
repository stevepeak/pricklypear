import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Thread } from '@/types/thread';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

function buildNavigateMock() {
  const navigate = vi.fn();
  vi.doMock('react-router-dom', () => ({ useNavigate: () => navigate }));
  return navigate;
}

vi.doMock('sonner', () => ({ toast: vi.fn() }));

const threadData: Thread = {
  id: 't1',
  title: 'Thread',
  createdAt: new Date(),
  participants: [],
  topic: 'other',
  status: 'open' as any,
  type: 'default',
};

describe('useThreadState', () => {
  it('navigates away when threadId is undefined', async () => {
    const navigate = buildNavigateMock();

    vi.doMock('./useThread', () => ({
      useThread: () => ({ data: null, isLoading: false, error: undefined }),
    }));

    const { useThreadState } = await import('./useThreadState');
    const { result } = renderHook(() => useThreadState(undefined));

    await act(async () => {
      await result.current.loadThread();
    });

    expect(navigate).toHaveBeenCalledWith('/threads');
  });

  it('handles error from useThread and navigates', async () => {
    const navigate = buildNavigateMock();
    const toastSpy = vi.fn();
    vi.doMock('sonner', () => ({ toast: toastSpy }));

    vi.doMock('./useThread', () => ({
      useThread: () => ({
        data: null,
        isLoading: false,
        error: new Error('nf'),
      }),
    }));

    const { useThreadState } = await import('./useThreadState');
    const { result } = renderHook(() => useThreadState('t1'));

    await act(async () => {
      await result.current.loadThread();
    });

    expect(toastSpy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/threads');
  });

  it('returns thread data when available', async () => {
    buildNavigateMock(); // navigation not expected in this test

    vi.doMock('./useThread', () => ({
      useThread: () => ({
        data: threadData,
        isLoading: false,
        error: undefined,
      }),
    }));

    const { useThreadState } = await import('./useThreadState');
    const { result } = renderHook(() => useThreadState('t1'));

    const thread = await result.current.loadThread();
    expect(thread).toEqual(threadData);
  });
});
