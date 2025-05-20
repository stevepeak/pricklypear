import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMessages,
  saveMessage,
  getUnreadMessageCount,
} from "@/services/messageService";
import { reviewMessage } from "@/utils/messageReview";
import { generateThreadSummary } from "@/services/threadService";
import type { Message } from "@/types/message";
import type { Thread } from "@/types/thread";

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

  const { toast } = useToast();
  const { user } = useAuth();

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

    const messagesData = await getMessages(threadId);
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
        toast({
          title: "Message rejected",
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
      toast({
        title: "Error reviewing message",
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
    const success = await saveMessage(
      newMessage,
      threadId,
      selectedMessage, // Using the reviewed/selected text as the final text
    );

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
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      // Generate a new summary after sending a message
      if (thread) {
        // Always generate summary after sending a message
        handleGenerateSummary();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }

    setIsSending(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    handleInitiateMessageReview();
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
    setIsReviewDialogOpen,
    loadMessages,
  };
};
