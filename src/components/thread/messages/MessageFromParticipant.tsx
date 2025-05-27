import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

function MessageFromParticipant(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn(
        "flex flex-col mb-2 animate-message-appear self-start items-start",
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
        <span>{message.sender}</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm bg-gray-200 rounded-tl-none mr-20",
          )}
        >
          {message.text && message.text !== "<img>" && (
            <ReactMarkdown>{message.text}</ReactMarkdown>
          )}
          {message.details &&
            (message.details as Record<string, string>).imageUrl && (
              <img
                src={(message.details as Record<string, string>).imageUrl}
                alt={
                  (message.details as Record<string, string>).filename ||
                  "uploaded image"
                }
                className="mt-2 max-w-xs rounded"
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default MessageFromParticipant;
