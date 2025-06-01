import { useEffect } from "react";
import { useThreadState } from "./useThreadState";
import { useThreadMessages } from "./useThreadMessages";

export const useThreadDetails = (
  threadId: string | undefined,
  composerRef?: React.RefObject<{ focusInput: () => void }>,
) => {
  // Get thread state management
  const { thread, isLoading, setIsLoading, loadThread } =
    useThreadState(threadId);

  // Get message handling
  const {
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    kindMessage,
    isReviewingMessage,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
  } = useThreadMessages(threadId, thread, composerRef);

  // Initialize thread and messages
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const threadData = await loadThread();
      if (threadData) {
        await loadMessages();
      }
      setIsLoading(false);
    };

    initialize();
  }, [loadThread, loadMessages, setIsLoading]);

  // Return all the hooks' values and methods
  return {
    // From useThreadState
    thread,
    isLoading,

    // From useThreadMessages
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    kindMessage,
    isReviewingMessage,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
  };
};
