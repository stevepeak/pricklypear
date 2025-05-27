import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, getUnreadMessageCount } from "@/services/messageService";
import { saveMessage } from "@/services/messageService/save-message";
import { reviewMessage } from "@/utils/messageReview";
import {
  generateThreadSummary,
  uploadThreadImage,
} from "@/services/threadService";
import type { Message } from "@/types/message";
import type { Thread } from "@/types/thread";
import { toast } from "sonner";
import { useConnections } from "@/hooks/useConnections";

export const useThreadMessages = (
  threadId: string | undefined,
  thread: Thread | null,
  setThread: (thread: Thread | null) => void,
  composerRef?: React.RefObject<{ focusInput: () => void }>,
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [kindMessage, setKindMessage] = useState("");
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);

  const { user } = useAuth();
  const { connections } = useConnections();

  // Load unread count for the thread
  useEffect(() => {
    if (threadId) {
      (async () => {
        try {
          const count = await getUnreadMessageCount(threadId);
          setUnreadCount(count);
        } catch (error) {
          console.error("Failed to load unread count:", error);
          setUnreadCount(0);
        }
      })();
    }
  }, [threadId, messages]);

  const loadMessages = async () => {
    if (!threadId) return [];

    const messagesData = await getMessages({
      threadId,
      connections,
    });
    setMessages(messagesData);
    return messagesData;
  };

  const handleInitiateMessageReview = async () => {
    if (!newMessage.trim() || !user) return;

    setIsReviewingMessage(true);

    let reviewedText: string;
    try {
      const { rephrasedMessage, rejected, reason } = await reviewMessage({
        message: newMessage,
        threadId,
      });
      if (rejected) {
        setIsReviewDialogOpen(false);
        toast("Message rejected", {
          description: reason || "Your message was rejected.",
        });
        if (composerRef && composerRef.current) {
          composerRef.current.focusInput();
        }
        setIsReviewingMessage(false);
        return;
      }
      reviewedText = rephrasedMessage;
    } catch (error) {
      console.error("Error reviewing message:", error);
      setIsReviewDialogOpen(false);
      toast("Error reviewing message", {
        description:
          typeof error === "string"
            ? error
            : "An error occurred while reviewing your message.",
      });
      if (composerRef && composerRef.current) {
        composerRef.current.focusInput();
      }
      setIsReviewingMessage(false);
      return;
    }

    setIsReviewingMessage(false);

    // Decide whether to auto-accept based on stored preference
    const autoAccept =
      typeof window !== "undefined" &&
      localStorage.getItem("autoAcceptAISuggestions") === "true";

    if (autoAccept) {
      // Immediately send the reviewed (or original) message
      await handleSendReviewedMessage(reviewedText);
      return; // Skip opening the review dialog
    }

    // Normal flow – show review dialog
    setKindMessage(reviewedText);
    setIsReviewDialogOpen(true);
  };

  const handleGenerateSummary = async () => {
    if (!threadId || !thread) return;

    setIsGeneratingSummary(true);

    try {
      const summary = await generateThreadSummary({ threadId });

      if (summary) {
        // Update local thread state with the new summary
        setThread({ ...thread, summary });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSendReviewedMessage = async (selectedMessage: string) => {
    if (!selectedMessage.trim() || !user || !threadId) return;

    setIsSending(true);

    // Save the final message with kind version
    const success = await saveMessage({
      threadId,
      text: selectedMessage,
      type: "user_message",
    });

    if (success) {
      // Add to local messages list immediately with isCurrentUser flag
      const newMsg: Message = {
        id: crypto.randomUUID(), // Generate a temporary ID
        text: selectedMessage,
        sender: user.id,
        type: "user_message",
        timestamp: new Date(),
        threadId: threadId,
        isCurrentUser: true, // Explicitly set isCurrentUser to true
        details: null,
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      // Generate a new summary after sending a message
      if (thread) {
        // Always generate summary after sending a message
        handleGenerateSummary();
      }
    } else {
      toast("Error", {
        description: "Failed to send message. Please try again.",
      });
    }

    setIsSending(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (thread.ai) {
      handleSendReviewedMessage(newMessage.trim());
      // TODO add some feedback that AI is thinking
      // TODO have AI handle the question
    } else {
      handleInitiateMessageReview();
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!threadId || !user) return;
    setIsSending(true);
    try {
      const { publicUrl } = await uploadThreadImage(file, threadId);
      const success = await saveMessage({
        threadId,
        text: "<img>",
        type: "user_message",
        details: { imageUrl: publicUrl, filename: file.name },
      });
      if (success) {
        const newMsg: Message = {
          id: crypto.randomUUID(),
          text: "<img>",
          sender: user.id,
          type: "user_message",
          timestamp: new Date(),
          threadId,
          isCurrentUser: true,
          details: { imageUrl: publicUrl, filename: file.name },
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      toast("Upload failed", {
        description: err instanceof Error ? err.message : "Upload failed",
      });
    }
    setIsSending(false);
  };

  return {
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    kindMessage,
    isReviewingMessage,
    isGeneratingSummary,
    unreadCount,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    handleUploadImage,
    setIsReviewDialogOpen,
    loadMessages,
  };
};
