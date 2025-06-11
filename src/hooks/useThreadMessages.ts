import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages } from '@/services/messageService';
import {
  saveMessage,
  saveAiMessage,
} from '@/services/messageService/save-message';
import { reviewMessage } from '@/utils/messageReview';
import type { Message } from '@/types/message';
import type { Thread } from '@/types/thread';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/useConnections';
import { isAIThread } from '@/types/thread';
import { useRealtimeMessages } from './useRealtimeMessages';
import { useGlobalMessages } from '@/contexts/GlobalMessagesContext';

export const useThreadMessages = (
  threadId: string | undefined,
  thread: Thread | null,
  composerRef?: React.RefObject<{ focusInput: () => void }>
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [kindMessage, setKindMessage] = useState('');
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);

  const { user } = useAuth();
  const { connections } = useConnections();
  const { registerUnreadCountsCallback } = useGlobalMessages();

  // Load unread count for the thread
  useEffect(() => {
    if (!threadId) return;

    const unsubscribe = registerUnreadCountsCallback((_, threadCounts) => {
      setUnreadCount(threadCounts[threadId] || 0);
    });

    return () => {
      unsubscribe();
    };
  }, [threadId, registerUnreadCountsCallback]);

  const loadMessages = useCallback(async () => {
    if (!threadId) return [];

    const messagesData = await getMessages({
      threadId,
      connections,
    });
    setMessages(messagesData);
    return messagesData;
  }, [threadId, connections]);

  // Subscribe to real-time updates
  useRealtimeMessages({
    onMessageReceived: (message) => {
      // Only process messages for this thread
      if (message.threadId === threadId) {
        setMessages((prev) => [...prev, message]);
      }
    },
    onReadReceiptUpdated: (messageId, readAt) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isRead: true, readAt } : m
        )
      );
    },
  });

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
        toast('Message rejected', {
          description: reason || 'Your message was rejected.',
        });
        if (composerRef && composerRef.current) {
          composerRef.current.focusInput();
        }
        setIsReviewingMessage(false);
        return;
      }
      reviewedText = rephrasedMessage;
    } catch (error) {
      console.error('Error reviewing message:', error);
      setIsReviewDialogOpen(false);
      toast('Error reviewing message', {
        description:
          typeof error === 'string'
            ? error
            : 'An error occurred while reviewing your message.',
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
      typeof window !== 'undefined' &&
      localStorage.getItem('autoAcceptAISuggestions') === 'true';

    if (autoAccept) {
      // Immediately send the reviewed (or original) message
      await handleSendReviewedMessage(reviewedText);
      return; // Skip opening the review dialog
    }

    // Normal flow – show review dialog
    setKindMessage(reviewedText);
    setIsReviewDialogOpen(true);
  };

  const handleSendReviewedMessage = async (selectedMessage: string) => {
    if (!selectedMessage.trim() || !user || !threadId) return;

    setIsSending(true);

    // Save the final message with kind version
    const success = await saveMessage({
      threadId,
      text: selectedMessage,
      type: 'user_message',
    });

    if (success) {
      setNewMessage('');
    } else {
      toast('Error', {
        description: 'Failed to send message. Please try again.',
      });
    }

    setIsSending(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!threadId) return;

    const text = newMessage.trim();

    setIsSending(true);

    try {
      if (isAIThread(thread)) {
        await saveAiMessage({
          threadId,
          text,
        });
        setNewMessage('');
      } else if (thread.type === 'customer_support') {
        await saveMessage({
          threadId,
          text,
          type: 'user_message',
        });
        setNewMessage('');
      } else {
        handleInitiateMessageReview();
      }
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    kindMessage,
    isReviewingMessage,
    unreadCount,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
  };
};
