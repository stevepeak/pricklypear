import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

function CloseDecision(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn(
        "flex flex-col animate-message-appear items-center justify-center",
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
            "px-4 py-2 rounded-xl shadow-sm bg-gray-200 text-gray-700",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default CloseDecision;
