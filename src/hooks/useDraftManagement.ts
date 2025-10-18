import { useCallback, useEffect, useRef } from 'react';
import {
  getThreadDraft,
  setThreadDraft,
  removeThreadDraft,
} from '@/utils/localStorage';

export function useDraftManagement(args: {
  threadId: string | undefined;
  newMessage: string;
  setNewMessage: (message: string) => void;
}) {
  const { threadId, newMessage, setNewMessage } = args;
  const previousMessageRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  const saveDraftToStorage = useCallback(
    (threadId: string, content: string) => {
      if (content.trim()) {
        setThreadDraft(threadId, content);
      } else {
        removeThreadDraft(threadId);
      }
    },
    []
  );

  const loadDraftFromStorage = useCallback((threadId: string): string => {
    return getThreadDraft(threadId);
  }, []);

  const clearDraftFromStorage = useCallback((threadId: string) => {
    removeThreadDraft(threadId);
  }, []);

  // Load draft when thread changes
  useEffect(() => {
    if (threadId) {
      const savedDraft = loadDraftFromStorage(threadId);
      if (savedDraft && savedDraft !== newMessage) {
        setNewMessage(savedDraft);
        previousMessageRef.current = savedDraft;
      } else {
        previousMessageRef.current = newMessage;
      }
      isInitializedRef.current = true;
    }
    // ? Do not add newMesssage as dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, setNewMessage, loadDraftFromStorage]);

  // Save draft when message changes (only if initialized and user actually changed it)
  useEffect(() => {
    if (
      threadId &&
      newMessage !== undefined &&
      isInitializedRef.current &&
      newMessage !== previousMessageRef.current
    ) {
      saveDraftToStorage(threadId, newMessage);
      previousMessageRef.current = newMessage;
    }
  }, [newMessage, threadId, saveDraftToStorage]);

  return {
    clearDraftFromStorage,
  };
}
