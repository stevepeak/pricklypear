import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* -------------------------------------------------------------------------- */
/*                             Helper - build mocks                           */
/* -------------------------------------------------------------------------- */

function buildSupabaseMocks() {
  const upload = vi.fn();
  const from = vi.fn(() => ({ upload }));

  const invoke = vi.fn();
  const getSession = vi
    .fn()
    .mockResolvedValue({ data: { session: { access_token: 'token' } } });

  const supabaseStub = {
    storage: { from },
    functions: { invoke },
    auth: { getSession },
  } as const;

  return { supabaseStub, upload, from, invoke, getSession };
}

async function loadHook({ hasUser = true } = {}) {
  const {
    supabaseStub,
    upload: uploadSpy,
    invoke: invokeSpy,
  } = buildSupabaseMocks();

  /* --------------------------- External module mocks --------------------------- */
  vi.doMock('@/integrations/supabase/client', () => ({
    supabase: supabaseStub,
  }));

  vi.doMock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ user: hasUser ? { id: 'u1' } : null }),
  }));

  const trackEvent = vi.fn();
  vi.doMock('@/lib/tracking', () => ({ trackEvent }));

  // Dynamic import AFTER mocks are in place
  const { useDocumentUpload } = await import('./useDocumentUpload');

  return { useDocumentUpload, uploadSpy, invokeSpy, trackEvent };
}

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe('useDocumentUpload', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it('uploads file, processes extract function, tracks analytics, and calls onComplete', async () => {
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });

    const { useDocumentUpload, uploadSpy, invokeSpy, trackEvent } =
      await loadHook();

    // Configure successful mocks
    uploadSpy.mockResolvedValue({
      data: { path: 'u1/123-test.pdf' },
      error: null,
    });

    invokeSpy.mockResolvedValue({
      data: { document_id: 'doc123' },
      error: null,
    });

    const onComplete = vi.fn();

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.upload(file, onComplete);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(uploadSpy).toHaveBeenCalled();
    expect(invokeSpy).toHaveBeenCalledWith(
      'extract-doc-text',
      expect.anything()
    );
    expect(trackEvent).toHaveBeenCalledWith({
      name: 'upload_document',
      user: { id: 'u1' },
    });
    expect(onComplete).toHaveBeenCalledWith('doc123');
    expect(result.current.progress).toBe(100);
  });

  it('returns error state when user is not authenticated', async () => {
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    const { useDocumentUpload } = await loadHook({ hasUser: false });

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'You must be signed in to upload documents.'
    );
  });

  it('sets error state when upload fails', async () => {
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    const { useDocumentUpload, uploadSpy } = await loadHook();

    const uploadError = new Error('upload failed');
    uploadSpy.mockResolvedValue({ data: null, error: uploadError });

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.upload(file);
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('upload failed');
  });
});
