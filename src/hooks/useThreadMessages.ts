import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages } from '@/services/messageService';
import {
  saveMessage,
  saveAiMessage,
} from '@/services/messageService/save-message';
import { reviewMessage, type ReviewResponse } from '@/utils/messageReview';
import type { Message } from '@/types/message';
import type { Thread } from '@/types/thread';
import { toast } from 'sonner';
import { useConnections } from '@/hooks/useConnections';
import { isAIThread } from '@/types/thread';
import { useRealtimeMessages } from './useRealtimeMessages';
import { useGlobalMessages } from '@/contexts/GlobalMessagesContext';
import { supabase } from '@/integrations/supabase/client';

export const useThreadMessages = (
  threadId: string | undefined,
  thread: Thread | null,
  composerRef?: React.RefObject<{ focusInput: () => void }>
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(
    null
  );
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);
  const [offTopicInfo, setOffTopicInfo] = useState<{
    rejected: boolean;
    reason: string;
  } | null>(null);

  const { user } = useAuth();
  const { connections } = useConnections();
  const { registerUnreadCountsCallback } = useGlobalMessages();

  // Check if user is admin
  useEffect(() => {
    let isMounted = true;
    const checkAdminStatus = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (isMounted) {
        setIsAdmin(data?.is_admin || false);
      }
    };
    checkAdminStatus();
    return () => {
      isMounted = false;
    };
  }, [user]);

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
        setMessages((prev) => {
          // Avoid duplicates by checking if message already exists
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
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

    let response: ReviewResponse;
    try {
      const { review, rejected, reason, offTopic } = await reviewMessage({
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
      if (!review) {
        throw new Error('No review response received');
      }
      response = review;

      // Store off-topic information to be included with the message
      setOffTopicInfo(offTopic || null);
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
      await handleSendReviewedMessage(response.suggested_message);
      return; // Skip opening the review dialog
    }

    // Normal flow – show review dialog
    setReviewResponse(response);
    setIsReviewDialogOpen(true);
  };

  const handleSendReviewedMessage = async (selectedMessage: string) => {
    if (!selectedMessage.trim() || !user || !threadId) return;

    setIsSending(true);

    // Save the final message with AI review response, original message, and off-topic info
    const success = await saveMessage({
      threadId,
      text: selectedMessage,
      type: 'user_message',
      details: reviewResponse
        ? {
            aiResponse: reviewResponse,
            originalMessage: newMessage.trim(),
            offTopic: offTopicInfo,
          }
        : undefined,
    });

    if (success) {
      setNewMessage('');
      setOffTopicInfo(null);
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
        // Admins send customer_support type, regular users send user_message type
        await saveMessage({
          threadId,
          text,
          type: isAdmin ? 'customer_support' : 'user_message',
        });
        setNewMessage('');
      } else if (thread.controls?.requireAiApproval) {
        // Only run AI review if thread requires it
        handleInitiateMessageReview();
      } else {
        // Skip AI review and send message directly
        await saveMessage({
          threadId,
          text,
          type: 'user_message',
        });
        setNewMessage('');
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
    reviewResponse,
    isReviewingMessage,
    unreadCount,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
  };
};
