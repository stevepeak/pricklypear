import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

function MessageFromMe(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn(
        "flex flex-col mb-2 animate-message-appear self-end items-end",
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
        <span>You</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm bg-sky-500 text-white rounded-tr-none ml-20",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromMe;
