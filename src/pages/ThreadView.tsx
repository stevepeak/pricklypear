import { useParams } from "react-router-dom";
import { useThreadDetails } from "@/hooks/useThreadDetails";
import ThreadHeader from "@/components/thread/ThreadHeader";
import ThreadMessages from "@/components/thread/ThreadMessages";
import ThreadMessageComposer from "@/components/thread/ThreadMessageComposer";
import MessageReviewDialog from "@/components/thread/MessageReviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import ThreadViewSkeleton from "@/components/thread/ThreadViewSkeleton";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();

  const composerRef = useRef<{ focusInput: () => void }>(null);
  const {
    thread,
    messages,
    newMessage,
    isLoading,
    isSending,
    isReviewDialogOpen,
    kindMessage,
    isReviewingMessage,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
  } = useThreadDetails(threadId, composerRef);

  const [hasOpenCloseRequest, setHasOpenCloseRequest] = useState(false);

  useEffect(() => {
    // Find the latest request_close message
    const latestRequestClose = [...messages]
      .reverse()
      .find((m) => m.type === "request_close");

    if (!latestRequestClose) {
      setHasOpenCloseRequest(false);
      return;
    }

    // Get all messages after the latest request_close
    const messagesAfterRequest = messages.slice(
      messages.indexOf(latestRequestClose) + 1,
    );

    // If there are no messages after the request, or if there's no close_declined message,
    // then there is an open close request
    setHasOpenCloseRequest(
      messagesAfterRequest.length === 0 ||
        !messagesAfterRequest.some((m) => m.type === "close_declined"),
    );
  }, [messages]);

  const threadIsOpen = thread?.status === "Open";

  // Ref for scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <ThreadViewSkeleton />;
  }

  return (
    <>
      <div
        className="flex flex-col flex-1"
        style={{ minHeight: "calc(100vh - 50px)" }}
      >
        <ThreadHeader thread={thread} />

        <div className="flex flex-col items-center m-auto h-full p-4 w-full max-w-[700px] mb-8">
          <ThreadMessages
            messages={messages}
            user={user}
            thread={thread}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
      {threadIsOpen && (
        <ThreadMessageComposer
          ref={composerRef}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isSending={isSending || isReviewingMessage}
          onSendMessage={handleSendMessage}
          hasOpenCloseRequest={hasOpenCloseRequest}
          thread={thread}
          loadMessages={loadMessages}
          autoFocus={true}
          messagesEndRef={messagesEndRef}
        />
      )}

      <MessageReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        newMessage={newMessage}
        kindMessage={kindMessage}
        onAccept={handleSendReviewedMessage}
        isLoading={isReviewingMessage}
        requireAiApproval={thread.controls?.requireAiApproval}
      />
    </>
  );
};

export default ThreadView;
