import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex flex-col mb-2 animate-message-appear",
        message.isCurrentUser
          ? "self-end items-end"
          : "self-start items-start",
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
        <span>{message.isCurrentUser ? "You" : message.sender}</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-2xl shadow-sm",
            message.isCurrentUser
              ? "bg-chat-sender1 text-white rounded-tr-none"
              : "bg-chat-gray rounded-tl-none",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
