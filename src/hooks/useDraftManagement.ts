import { useCallback, useEffect, useRef } from 'react';

export function useDraftManagement(
  threadId: string | undefined,
  newMessage: string,
  setNewMessage: (message: string) => void
) {
  const previousMessageRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Helper functions for localStorage
  const getStorageKey = useCallback(
    (threadId: string) => `thread-draft-${threadId}`,
    []
  );

  const saveDraftToStorage = useCallback(
    (threadId: string, content: string) => {
      if (content.trim()) {
        localStorage.setItem(getStorageKey(threadId), content);
      } else {
        localStorage.removeItem(getStorageKey(threadId));
      }
    },
    [getStorageKey]
  );

  const loadDraftFromStorage = useCallback(
    (threadId: string): string => {
      return localStorage.getItem(getStorageKey(threadId)) || '';
    },
    [getStorageKey]
  );

  const clearDraftFromStorage = useCallback(
    (threadId: string) => {
      localStorage.removeItem(getStorageKey(threadId));
    },
    [getStorageKey]
  );

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
