import { renderHook, act } from '@testing-library/react';
import { useThreadCreation } from './useThreadCreation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('sonner', () => ({ toast: vi.fn() }));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

const createThread = vi.fn().mockResolvedValue({
  id: 't1',
  title: 'My Thread',
  type: 'default',
  topic: 'other',
  participants: ['u1'],
});
const generateThreadConversation = vi.fn();

vi.mock('@/services/threadService', () => ({
  createThread: (...args: unknown[]) => createThread(...args),
  generateThreadConversation: (...args: unknown[]) =>
    generateThreadConversation(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useThreadCreation', () => {
  it('calls createThread when handleCreateThread is invoked', async () => {
    const onCreated = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => useThreadCreation(onCreated, onClose));

    act(() => {
      result.current.setNewThreadTitle('My Thread');
      result.current.setSelectedContactIds(['u1']);
      result.current.setSelectedTopic('other');
    });

    await act(async () => {
      await result.current.handleCreateThread();
    });

    expect(createThread).toHaveBeenCalledWith({
      title: 'My Thread',
      type: 'default',
      participantIds: ['u1'],
      topic: 'other',
      controls: { requireAiApproval: true },
    });
    expect(onCreated).toHaveBeenCalledWith({
      id: 't1',
      title: 'My Thread',
      type: 'default',
      topic: 'other',
      participants: ['u1'],
    });
  });

  it('creates AI chat when handleCreateAIChat is called', async () => {
    const { result } = renderHook(() => useThreadCreation(vi.fn(), vi.fn()));

    await act(async () => {
      await result.current.handleCreateAIChat();
    });

    expect(createThread).toHaveBeenCalledWith({
      title: 'AI Chat',
      type: 'ai_chat',
      topic: 'other',
    });
  });
});
