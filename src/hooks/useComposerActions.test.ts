import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useComposerActions } from './useComposerActions';

// Mock dependencies
vi.mock('@/hooks/useConnections', () => ({
  useConnections: () => ({
    connections: [],
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/services/messageService/get-messages', () => ({
  getMessages: vi.fn(),
}));

vi.mock('@/services/threadService', () => ({
  archiveThread: vi.fn(),
  unarchiveThread: vi.fn(),
}));

vi.mock('@/services/messageService/save-message', () => ({
  saveMessage: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
      })),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

vi.mock('@/services/messageService/utils', () => ({
  handleError: vi.fn(),
}));

describe('useComposerActions', () => {
  const mockThread = {
    id: 'thread-123',
    type: 'ai' as const,
    status: 'Open' as const,
  };

  const mockLoadMessages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useComposerActions({ thread: mockThread, loadMessages: mockLoadMessages })
    );

    expect(result.current.isArchiving).toBe(false);
    expect(result.current.isUnarchiving).toBe(false);
    expect(result.current.isUploading).toBe(false);
    expect(typeof result.current.handleCopy).toBe('function');
    expect(typeof result.current.handleArchive).toBe('function');
    expect(typeof result.current.handleUnarchive).toBe('function');
    expect(typeof result.current.handleImageUpload).toBe('function');
  });

  describe('handleCopy', () => {
    it('should copy messages to clipboard successfully', async () => {
      const mockMessages = [
        {
          id: '1',
          text: 'Hello',
          timestamp: new Date('2023-01-01'),
          sender: { name: 'User' },
        },
      ];

      const { getMessages } = await import(
        '@/services/messageService/get-messages'
      );
      vi.mocked(getMessages).mockResolvedValue(mockMessages);

      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleCopy();
      });

      expect(getMessages).toHaveBeenCalledWith({
        threadId: mockThread.id,
        connections: [],
      });
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should show error toast when no messages found', async () => {
      const { getMessages } = await import(
        '@/services/messageService/get-messages'
      );
      vi.mocked(getMessages).mockResolvedValue([]);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleCopy();
      });

      expect(vi.mocked(toast)).toHaveBeenCalledWith('Nothing to copy', {
        description: 'No messages found in this thread.',
      });
    });
  });

  describe('handleArchive', () => {
    it('should archive thread successfully', async () => {
      const { archiveThread } = await import('@/services/threadService');
      vi.mocked(archiveThread).mockResolvedValue(true);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(archiveThread).toHaveBeenCalledWith({ threadId: mockThread.id });
      expect(mockLoadMessages).toHaveBeenCalled();
      expect(vi.mocked(toast)).toHaveBeenCalledWith('Thread archived', {
        description: 'This thread has been archived.',
      });
    });

    it('should show error toast when archive fails', async () => {
      const { archiveThread } = await import('@/services/threadService');
      vi.mocked(archiveThread).mockResolvedValue(false);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleArchive();
      });

      expect(vi.mocked(toast)).toHaveBeenCalledWith('Archive failed', {
        description: 'Could not archive the thread.',
      });
    });
  });

  describe('handleUnarchive', () => {
    it('should unarchive thread successfully', async () => {
      const { unarchiveThread } = await import('@/services/threadService');
      vi.mocked(unarchiveThread).mockResolvedValue(true);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleUnarchive();
      });

      expect(unarchiveThread).toHaveBeenCalledWith({ threadId: mockThread.id });
      expect(mockLoadMessages).toHaveBeenCalled();
      expect(vi.mocked(toast)).toHaveBeenCalledWith('Thread unarchived', {
        description: 'This thread has been unarchived.',
      });
    });
  });

  describe('handleImageUpload', () => {
    it('should upload image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const { saveMessage } = await import(
        '@/services/messageService/save-message'
      );
      vi.mocked(saveMessage).mockResolvedValue(true);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleImageUpload(mockFile);
      });

      expect(vi.mocked(toast)).toHaveBeenCalledWith('Uploading image', {
        description: 'Please wait while your image is being uploaded...',
      });
      expect(mockUpload).toHaveBeenCalled();
      expect(saveMessage).toHaveBeenCalledWith({
        text: 'Uploaded an image',
        threadId: mockThread.id,
        type: 'user_message',
        details: {
          assets: expect.arrayContaining([
            expect.stringContaining('thread-123/'),
          ]),
        },
      });
      expect(mockLoadMessages).toHaveBeenCalled();
      expect(vi.mocked(toast)).toHaveBeenCalledWith('Image uploaded', {
        description: 'Your image has been uploaded successfully.',
      });
    });

    it('should use the correct storage bucket (threads)', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const { saveMessage } = await import(
        '@/services/messageService/save-message'
      );
      vi.mocked(saveMessage).mockResolvedValue(true);

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleImageUpload(mockFile);
      });

      expect(supabase.storage.from).toHaveBeenCalledWith('threads');
    });

    it('should generate correct file path with thread id and uuid', async () => {
      const mockFile = new File(['test'], 'test.webp', {
        type: 'image/webp',
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const { saveMessage } = await import(
        '@/services/messageService/save-message'
      );
      vi.mocked(saveMessage).mockResolvedValue(true);

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleImageUpload(mockFile);
      });

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^thread-123\/[a-f0-9-]+\.webp$/),
        mockFile
      );
    });

    it('should handle different image file extensions', async () => {
      const testCases = [
        { ext: 'jpg', type: 'image/jpeg' },
        { ext: 'png', type: 'image/png' },
        { ext: 'gif', type: 'image/gif' },
      ];

      for (const { ext, type } of testCases) {
        vi.clearAllMocks();

        const mockFile = new File(['test'], `test.${ext}`, { type });

        const { supabase } = await import('@/integrations/supabase/client');
        const mockUpload = vi.fn().mockResolvedValue({ error: null });
        vi.mocked(supabase.storage.from).mockReturnValue({
          upload: mockUpload,
        } as any);

        const { saveMessage } = await import(
          '@/services/messageService/save-message'
        );
        vi.mocked(saveMessage).mockResolvedValue(true);

        const { result } = renderHook(() =>
          useComposerActions({
            thread: mockThread,
            loadMessages: mockLoadMessages,
          })
        );

        await act(async () => {
          await result.current.handleImageUpload(mockFile);
        });

        expect(mockUpload).toHaveBeenCalledWith(
          expect.stringMatching(new RegExp(`\\.${ext}$`)),
          mockFile
        );
      }
    });

    it('should not upload when thread is missing', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const { result } = renderHook(() =>
        useComposerActions({
          thread: null as any,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleImageUpload(mockFile);
      });

      expect(result.current.isUploading).toBe(false);
    });

    it('should handle upload error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpload = vi
        .fn()
        .mockResolvedValue({ error: new Error('Upload failed') });
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleImageUpload(mockFile);
      });

      expect(vi.mocked(toast)).toHaveBeenCalledWith('Uploading image', {
        description: 'Please wait while your image is being uploaded...',
      });
      expect(vi.mocked(toast)).toHaveBeenCalledWith('Upload failed', {
        description: 'Failed to upload image.',
      });
    });

    it('should handle message save failure after successful upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const { saveMessage } = await import(
        '@/services/messageService/save-message'
      );
      vi.mocked(saveMessage).mockResolvedValue(false);

      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useComposerActions({
          thread: mockThread,
          loadMessages: mockLoadMessages,
        })
      );

      await act(async () => {
        await result.current.handleImageUpload(mockFile);
      });

      expect(mockUpload).toHaveBeenCalled();
      expect(saveMessage).toHaveBeenCalled();
      // Should not show success message
      expect(vi.mocked(toast)).not.toHaveBeenCalledWith('Image uploaded', {
        description: 'Your image has been uploaded successfully.',
      });
    });
  });
});
