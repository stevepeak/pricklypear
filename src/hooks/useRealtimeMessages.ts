import { useEffect } from "react";
import type { Message } from "@/types/message";
import { useGlobalMessages } from "@/contexts/GlobalMessagesContext";

interface UseRealtimeMessagesProps {
  onUnreadCountsUpdated?: (
    totalUnread: number,
    threadCounts: Record<string, number>,
  ) => void;
  onMessageReceived?: (message: Message) => void;
  onReadReceiptUpdated?: (messageId: string, readAt: Date) => void;
}

export const useRealtimeMessages = ({
  onUnreadCountsUpdated,
  onMessageReceived,
  onReadReceiptUpdated,
}: UseRealtimeMessagesProps): void => {
  const {
    registerMessageCallback,
    registerUnreadCountsCallback,
    registerReadReceiptCallback,
  } = useGlobalMessages();

  useEffect(() => {
    const unregisterCallbacks: (() => void)[] = [];

    if (onMessageReceived) {
      const unregister = registerMessageCallback(onMessageReceived);
      unregisterCallbacks.push(unregister);
    }

    if (onUnreadCountsUpdated) {
      const unregister = registerUnreadCountsCallback(onUnreadCountsUpdated);
      unregisterCallbacks.push(unregister);
    }

    if (onReadReceiptUpdated) {
      const unregister = registerReadReceiptCallback(onReadReceiptUpdated);
      unregisterCallbacks.push(unregister);
    }

    return () => {
      unregisterCallbacks.forEach((unregister) => unregister());
    };
  }, [
    onMessageReceived,
    onUnreadCountsUpdated,
    onReadReceiptUpdated,
    registerMessageCallback,
    registerUnreadCountsCallback,
    registerReadReceiptCallback,
  ]);
};
