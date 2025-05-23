import { formatThreadTimestamp } from "@/utils/formatTimestamp";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { saveMessage } from "@/services/messageService/save-message";
import { requireCurrentUser } from "@/utils/authCache";
import { toast } from "sonner";

function RequestClose(props: { message: Message }) {
  const { message } = props;
  const isPending = Boolean(
    message.details && (message.details as { pending?: boolean }).pending,
  );
  const isCurrentUserSender = message.isCurrentUser;

  const handleAccept = async () => {
    try {
      const user = await requireCurrentUser();
      const success = await saveMessage({
        text: `${user.user_metadata.name} agreed to close the thread.`,
        threadId: message.threadId,
        type: "close_accepted",
      });
      if (success) {
        toast("Accepted close request", {
          description: "You accepted the close request.",
        });
      } else {
        toast("Failed to accept close request", {
          description: "Could not save message.",
        });
      }
    } catch (err) {
      toast("Failed to accept close request", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };
  const handleDecline = () => {
    // TODO: Implement decline logic
    // toast("Declined close request", { description: "You declined the close request." });
  };

  return (
    <div
      className={cn(
        "flex flex-col mb-2 animate-message-appear items-center justify-center",
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
          {isPending && !isCurrentUserSender && (
            <div className="flex w-full mt-2 justify-center">
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={handleAccept}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline}>
                  Decline
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestClose;
