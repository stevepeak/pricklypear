import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";

function MessageFromAI(props: { message: Message }) {
  const { message } = props;
  return (
    <div
      className={cn(
        "flex flex-col animate-message-appear self-start items-start",
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn("px-4 py-2 mr-20")}>
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromAI;
