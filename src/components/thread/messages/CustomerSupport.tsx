import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { Headset } from "lucide-react";

function CustomerSupportMessage(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn(
        "flex flex-col animate-message-appear self-start items-start",
      )}
    >
      <div className="flex items-center gap-2 mb-1 text-xs text-primary font-semibold">
        <Headset className="h-4 w-4 text-primary/70" />
        <span>Customer Support</span>
        <span className="text-muted-foreground font-normal">•</span>
        <span className="text-muted-foreground font-normal">
          {formatThreadTimestamp(message.timestamp)}
        </span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm bg-primary/10 border border-primary/20 text-primary-foreground mr-20",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupportMessage;
