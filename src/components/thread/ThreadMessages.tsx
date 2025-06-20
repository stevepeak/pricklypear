import React, { useEffect } from "react";
import type { Message } from "@/types/message";
import { markMessagesInThreadAsRead } from "@/services/messageService";
import type { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";
import type { Thread } from "@/types/thread";
import MessageFromMe from "@/components/thread/messages/MessageFromMe";
import MessageFromParticipant from "@/components/thread/messages/MessageFromParticipant";
import MessageFromAI from "@/components/thread/messages/MessageFromAI";
import RequestClose from "@/components/thread/messages/RequestClose";
import CloseDecision from "./messages/CloseDecision";
import CustomerSupportMessage from "./messages/CustomerSupport";
import OpenedAt from "./messages/OpenedAt";

interface ThreadMessagesProps {
  messages: Message[];
  user: User | null;
  thread: Thread;
  onImagesLoaded?: () => void;
}

const ThreadMessages: React.FC<ThreadMessagesProps> = ({
  messages,
  user,
  thread,
  onImagesLoaded,
}) => {
  // Mark messages as read when they are displayed
  useEffect(() => {
    if (user && messages.length > 0) {
      markMessagesInThreadAsRead({ threadId: thread.id });
    }
  }, [messages, user, thread.id]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center m-auto text-muted-foreground w-full gap-4 my-[100px]">
        <MessageCircle className="h-12 w-12 mb-2" />
        <p className="italic">No messages yet. Start the conversation below.</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-1 items-center m-auto w-full max-w-[700px] gap-4 mb-8 my-10"
      data-testid="thread-message-list"
    >
      <OpenedAt thread={thread} />
      {messages.map((message, idx) => {
        switch (message.type) {
          case "user_message":
            return message.isCurrentUser ? (
              <MessageFromMe
                key={message.id}
                message={message}
                onImagesLoaded={onImagesLoaded}
              />
            ) : (
              <MessageFromParticipant
                key={message.id}
                message={message}
                onImagesLoaded={onImagesLoaded}
              />
            );
          case "ai_message":
            return (
              <MessageFromAI
                key={message.id}
                message={message}
                onImagesLoaded={onImagesLoaded}
              />
            );
          case "request_close": {
            // isPending is true only if this is the newest request_close and there are no close_declined after it
            const isNewestRequestClose =
              messages
                .slice(idx + 1)
                .find((m) => m.type === "request_close") === undefined;
            const hasDeclinedAfter = messages
              .slice(idx + 1)
              .some((m) => m.type === "close_declined");
            const isPending = isNewestRequestClose && !hasDeclinedAfter;
            return (
              <RequestClose
                key={message.id}
                message={message}
                threadStatus={thread.status}
                isPending={isPending}
              />
            );
          }
          case "customer_support":
            return (
              <CustomerSupportMessage key={message.id} message={message} />
            );
          case "close_declined":
          case "close_accepted":
            return <CloseDecision key={message.id} message={message} />;
          default:
            return (
              <div
                key={message.id}
                className="text-center text-xs text-gray-400 my-2"
              >
                Unhandled message type: {message.type}
              </div>
            );
        }
      })}
    </div>
  );
};

export default ThreadMessages;
