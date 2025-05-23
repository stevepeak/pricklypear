import React, { useRef, useEffect } from "react";
import type { Message } from "@/types/message";
import { markMessagesAsRead } from "@/services/messageService";
import type { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";
import type { Thread } from "@/types/thread";
import MessageFromMe from "@/components/thread/messages/MessageFromMe";
import MessageFromParticipant from "@/components/thread/messages/MessageFromParticipant";
import RequestClose from "@/components/thread/messages/RequestClose";

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
}) => {
  const localMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = externalMessagesEndRef || localMessagesEndRef;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when they are displayed
  useEffect(() => {
    if (user && messages.length > 0) {
      // Get message IDs that aren't from the current user
      const otherUserMessageIds = messages
        .filter((message) => !message.isCurrentUser)
        .map((message) => message.id);

      if (otherUserMessageIds.length > 0) {
        markMessagesAsRead(otherUserMessageIds);
      }
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-grow px-4 py-6 mb-4 mx-10">
      {messages.length > 0 ? (
        <>
          {messages.map((message) => {
            switch (message.type) {
              case "user_message":
                return message.isCurrentUser ? (
                  <MessageFromMe key={message.id} message={message} />
                ) : (
                  <MessageFromParticipant key={message.id} message={message} />
                );
              case "request_close":
                return <RequestClose key={message.id} message={message} />;
              case "close_declined":
              case "close_accepted":
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
        </>
      ) : (
        <div className="text-center text-muted-foreground/60 py-8">
          <div className="flex flex-col items-center gap-2">
            <MessageCircle className="h-12 w-12" />
            <p className="italic">
              No messages yet. Start the conversation below.
            </p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ThreadMessages;
