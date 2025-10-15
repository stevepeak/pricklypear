import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      functions: {
        invoke: vi.fn(),
      },
    },
  };
});

let supabase;

beforeEach(async () => {
  vi.resetModules();
  ({ supabase } = await import('@/integrations/supabase/client'));
});

async function load() {
  return await import('./messageReview');
}

describe('reviewMessage', () => {
  it('returns data on success', async () => {
    const mockReview = {
      analysis: 'Test analysis',
      suggested_message: 'hi',
      tone: 'neutral' as const,
      nvc_elements: {
        observation: 'obs',
        feeling: 'feel',
        need: 'need',
        request: 'req',
      },
    };
    supabase.functions.invoke.mockResolvedValue({
      data: { review: mockReview, rejected: false, reason: null },
      error: null,
    });
    const mod = await load();
    const res = await mod.reviewMessage({ message: 'hello', threadId: 't1' });
    expect(res).toEqual({
      review: mockReview,
      rejected: false,
      reason: null,
    });
    expect(supabase.functions.invoke).toHaveBeenCalledWith('review-message', {
      body: { message: 'hello', threadId: 't1', systemPrompt: null },
    });
  });

  it('handles supabase errors', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'bad' },
    });
    const mod = await load();
    const res = await mod.reviewMessage({ message: 'msg', threadId: 't2' });
    expect(res).toEqual({
      review: null,
      rejected: true,
      reason: 'bad',
    });
  });

  it('handles thrown errors', async () => {
    supabase.functions.invoke.mockRejectedValue(new Error('oops'));
    const mod = await load();
    const res = await mod.reviewMessage({ message: 'x', threadId: 't3' });
    expect(res).toEqual({
      review: null,
      rejected: true,
      reason: 'oops',
    });
  });
});
