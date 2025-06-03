import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { updateMessageDetails } from "@/services/messageService";

function MessageFromParticipant(props: {
  message: Message;
  threadIsOpen?: boolean;
}) {
  const { message, threadIsOpen } = props;
  const { user } = useAuth();
  const [emoji, setEmoji] = useState(
    (message.details?.emoji as Record<string, string> | undefined)?.[
      user?.id ?? ""
    ] ?? "",
  );

  const handleSelect = async (e: { native: string }) => {
    if (!user) return;
    const details = {
      ...(message.details || {}),
      emoji: {
        ...(message.details?.emoji as Record<string, string> | undefined),
        [user.id]: e.native,
      },
    } as Record<string, unknown>;
    const success = await updateMessageDetails({
      messageId: message.id,
      details,
    });
    if (success) {
      setEmoji(e.native);
    }
  };
  return (
    <div
      className={cn(
        "flex flex-col animate-message-appear self-start items-start group",
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
        <span>{message.senderName}</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-xl shadow-sm bg-muted text-muted-foreground rounded-tl-none mr-20 relative",
          )}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
          {emoji && <span className="ml-2">{emoji}</span>}
          {threadIsOpen && user && (
            <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 rounded-md hover:bg-accent">
                    <Smile className="size-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none bg-transparent">
                  <Picker
                    data={data}
                    onEmojiSelect={handleSelect}
                    theme="light"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageFromParticipant;
