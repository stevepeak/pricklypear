import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useThreadDetails } from "@/hooks/useThreadDetails";
import ThreadHeader from "@/components/thread/ThreadHeader";
import ThreadMessages from "@/components/thread/ThreadMessages";
import ThreadMessageComposer from "@/components/thread/ThreadMessageComposer";
import MessageReviewDialog from "@/components/MessageReviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useRef } from "react";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();

  const {
    thread,
    messages,
    newMessage,
    isLoading,
    isSending,
    isReviewDialogOpen,
    kindMessage,
    isReviewingMessage,
    isGeneratingSummary,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
  } = useThreadDetails(threadId);

  const isThreadClosed = thread?.status === "closed";

  // Ref for scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-50px)] flex flex-col py-8 container">
      {thread && (
        <div className="flex flex-col flex-1">
          <ThreadHeader
            thread={thread}
            isGeneratingSummary={isGeneratingSummary}
          />

          <ThreadMessages
            messages={messages}
            user={user}
            thread={thread}
            messagesEndRef={messagesEndRef}
          />

          <ThreadMessageComposer
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending || isReviewingMessage}
            isThreadClosed={isThreadClosed}
            onSendMessage={handleSendMessage}
            scrollToBottom={scrollToBottom}
          />
        </div>
      )}

      <MessageReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        newMessage={newMessage}
        kindMessage={kindMessage}
        onAccept={handleSendReviewedMessage}
        isLoading={isReviewingMessage}
      />
    </div>
  );
};

export default ThreadView;
