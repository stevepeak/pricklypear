import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

function MessageFromMe(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn("flex flex-col animate-message-appear self-end items-end")}
    >
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>You</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm bg-primary text-primary-foreground rounded-tr-none ml-20",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromMe;
