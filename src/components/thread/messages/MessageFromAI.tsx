import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

function MessageFromAI(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn(
        "flex flex-col mb-2 animate-message-appear self-start items-start",
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-purple-500">
        <span>Prickly AI</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm bg-gray-100 border border-gray-200 text-gray-700 rounded-tl-none mr-20 italic",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromAI;
