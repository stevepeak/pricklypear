import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Thread } from '@/types/thread';

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

const loadMessagesSpy = vi.fn();

/* ----------------------------- Mock child hooks ---------------------------- */

vi.mock('./useThreadState', () => {
  const thread: Thread = {
    id: 't1',
    title: 'Test Thread',
    createdAt: new Date(),
    participants: [],
    topic: 'other',
    status: 'open' as any,
    type: 'default',
  };
  return {
    useThreadState: () => ({ thread, isLoading: false }),
  };
});

vi.mock('./useThreadMessages', () => ({
  useThreadMessages: () => ({
    messages: [],
    newMessage: '',
    isSending: false,
    isReviewDialogOpen: false,
    reviewResponse: null,
    isReviewingMessage: false,
    setNewMessage: vi.fn(),
    handleSendMessage: vi.fn(),
    handleSendReviewedMessage: vi.fn(),
    setIsReviewDialogOpen: vi.fn(),
    loadMessages: loadMessagesSpy,
  }),
}));

describe('useThreadDetails', () => {
  it('calls loadMessages when thread becomes available', async () => {
    const { useThreadDetails } = await import('./useThreadDetails');

    renderHook(() => useThreadDetails('t1'));

    await waitFor(() => expect(loadMessagesSpy).toHaveBeenCalled());
  });
});
