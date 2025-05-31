import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Message } from "@/types/message";
import { getAllUnreadCounts } from "@/services/messageService";
import type { Database } from "@/integrations/supabase/types";
import { handleError } from "@/services/messageService/utils";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ReadReceiptRow =
  Database["public"]["Tables"]["message_read_receipts"]["Row"];

interface GlobalMessagesContextType {
  registerMessageCallback: (callback: (message: Message) => void) => () => void;
  registerUnreadCountsCallback: (
    callback: (total: number, threadCounts: Record<string, number>) => void,
  ) => () => void;
  registerReadReceiptCallback: (
    callback: (messageId: string, readAt: Date) => void,
  ) => () => void;
}

const GlobalMessagesContext = createContext<GlobalMessagesContextType | null>(
  null,
);

export const useGlobalMessages = () => {
  const context = useContext(GlobalMessagesContext);
  if (!context) {
    throw new Error(
      "useGlobalMessages must be used within a GlobalMessagesProvider",
    );
  }
  return context;
};

export const GlobalMessagesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messageCallbacksRef = useRef<((message: Message) => void)[]>([]);
  const unreadCountsCallbacksRef = useRef<
    ((total: number, threadCounts: Record<string, number>) => void)[]
  >([]);
  const readReceiptCallbacksRef = useRef<
    ((messageId: string, readAt: Date) => void)[]
  >([]);

  const registerMessageCallback = useCallback(
    (callback: (message: Message) => void) => {
      messageCallbacksRef.current.push(callback);
      return () => {
        messageCallbacksRef.current = messageCallbacksRef.current.filter(
          (cb) => cb !== callback,
        );
      };
    },
    [],
  );

  const registerUnreadCountsCallback = useCallback(
    (
      callback: (total: number, threadCounts: Record<string, number>) => void,
    ) => {
      unreadCountsCallbacksRef.current.push(callback);
      return () => {
        unreadCountsCallbacksRef.current =
          unreadCountsCallbacksRef.current.filter((cb) => cb !== callback);
      };
    },
    [],
  );

  const registerReadReceiptCallback = useCallback(
    (callback: (messageId: string, readAt: Date) => void) => {
      readReceiptCallbacksRef.current.push(callback);
      return () => {
        readReceiptCallbacksRef.current =
          readReceiptCallbacksRef.current.filter((cb) => cb !== callback);
      };
    },
    [],
  );

  useEffect(() => {
    if (!user) return;

    const setupGlobalSubscription = async (retryCount = 0): Promise<void> => {
      try {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
        }

        const channel = supabase
          .channel("global-messages")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
            },
            async (payload) => {
              console.log("💬 New message", payload);
              const newData = payload.new as MessageRow;
              const newMessage: Message = {
                id: newData.id,
                text: newData.text,
                sender: newData.user_id,
                timestamp: new Date(newData.timestamp),
                threadId: newData.thread_id,
                type: newData.type,
                details: newData.details as Record<string, unknown> | null,
                isCurrentUser: newData.user_id === user.id,
              };

              // Notify all registered message callbacks
              messageCallbacksRef.current.forEach((callback) =>
                callback(newMessage),
              );
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "message_read_receipts",
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              console.log("New Read Receipt Change", payload);
              const newData = payload.new as ReadReceiptRow;
              if (newData?.read_at) {
                readReceiptCallbacksRef.current.forEach((callback) =>
                  callback(newData.message_id, new Date(newData.read_at)),
                );
              }
              // Update unread counts for all registered callbacks
              if (unreadCountsCallbacksRef.current.length > 0) {
                const counts = await getAllUnreadCounts();
                const total = Object.values(counts).reduce(
                  (sum, count) => sum + count,
                  0,
                );
                unreadCountsCallbacksRef.current.forEach((callback) =>
                  callback(total, counts),
                );
              }
            },
          )
          .subscribe((status, err) => {
            if (status === "SUBSCRIBED") {
              console.log("Subscribed to global messages");
            } else if (status === "CHANNEL_ERROR") {
              console.error("Channel error, attempting to reconnect...", err);
              setTimeout(
                () => {
                  if (retryCount < 3) {
                    setupGlobalSubscription(retryCount + 1);
                  }
                },
                1000 * Math.pow(2, retryCount),
              );
            }
          });

        channelRef.current = channel;
      } catch (error) {
        handleError(error, "setting up global subscription");
      }
    };

    setupGlobalSubscription();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user]);

  return (
    <GlobalMessagesContext.Provider
      value={{
        registerMessageCallback,
        registerUnreadCountsCallback,
        registerReadReceiptCallback,
      }}
    >
      {children}
    </GlobalMessagesContext.Provider>
  );
};
