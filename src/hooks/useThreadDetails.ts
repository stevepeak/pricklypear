import { useEffect } from "react";
import { useThreadState } from "./useThreadState";
import { useThreadMessages } from "./useThreadMessages";

export const useThreadDetails = (
  threadId: string | undefined,
  composerRef?: React.RefObject<{ focusInput: () => void }>,
) => {
  // Get thread state management
  const { thread, isLoading } = useThreadState(threadId);

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

  // Initialize messages when thread is loaded
  useEffect(() => {
    if (thread) {
      loadMessages();
    }
  }, [thread, loadMessages]);

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
