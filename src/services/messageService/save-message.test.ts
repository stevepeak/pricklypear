import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Database } from '@/integrations/supabase/types';

const invokeMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: invokeMock },
  },
}));

vi.mock('@/utils/authCache', () => ({
  requireCurrentUser: vi.fn().mockResolvedValue({ id: 'user1' }),
}));

vi.mock('./utils', () => ({
  handleError: vi.fn().mockReturnValue(false),
}));

const { saveMessage } = await import('./save-message');
const { handleError } = await import('./utils');
const { supabase } = await import('@/integrations/supabase/client');

const msgType = 'user_message' as Database['public']['Enums']['message_type'];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('saveMessage', () => {
  it('returns true on success', async () => {
    invokeMock.mockResolvedValue({ data: { id: 'm1' }, error: null });
    const result = await saveMessage({
      text: 'hi',
      threadId: 't1',
      type: msgType,
    });
    expect(result).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalled();
  });

  it('returns false when supabase errors', async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: 'fail' } });
    const result = await saveMessage({
      text: 'hi',
      threadId: 't1',
      type: msgType,
    });
    expect(handleError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('returns false on exception', async () => {
    invokeMock.mockRejectedValue(new Error('boom'));
    const result = await saveMessage({
      text: 'hi',
      threadId: 't1',
      type: msgType,
    });
    expect(handleError).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
