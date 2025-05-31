import React, { useRef, useEffect } from "react";
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

interface ThreadMessagesProps {
  messages: Message[];
  user: User | null;
  thread: Thread;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

const ThreadMessages: React.FC<ThreadMessagesProps> = ({
  messages,
  user,
  messagesEndRef: externalMessagesEndRef,
  thread,
}) => {
  const localMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = externalMessagesEndRef || localMessagesEndRef;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  // Mark messages as read when they are displayed
  useEffect(() => {
    if (user && messages.length > 0) {
      markMessagesInThreadAsRead({ threadId: thread.id });
    }
  }, [messages, user, thread.id]);

  return (
    <>
      {messages.length > 0 ? (
        <div className="flex flex-col w-full gap-4">
          {messages.map((message, idx) => {
            switch (message.type) {
              case "user_message":
                return message.isCurrentUser ? (
                  <MessageFromMe key={message.id} message={message} />
                ) : (
                  <MessageFromParticipant key={message.id} message={message} />
                );
              case "ai_message":
                return <MessageFromAI key={message.id} message={message} />;
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
      ) : (
        <div className="flex flex-col flex-1 items-center justify-center h-full text-center text-muted-foreground/60 px-2 py-3 mb-2 mx-2 md:px-4 md:py-6 md:mb-4 md:mx-10">
          <MessageCircle className="h-12 w-12 mb-2" />
          <p className="italic">
            No messages yet. Start the conversation below.
          </p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
};

export default ThreadMessages;
