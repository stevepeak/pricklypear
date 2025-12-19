import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, ArrowUp } from 'lucide-react';
import { saveMessage } from '@/services/messageService/save-message';
import { Thread, isAIThread } from '@/types/thread';
import { Message } from '@/types/message';
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog';
import { useDraftManagement } from '@/hooks/useDraftManagement';
import { useComposerActions } from '@/hooks/useComposerActions';
import { useComposerUI } from '@/hooks/useComposerUI';
import { JumpToLatestButton } from './composer/JumpToLatestButton';
import { RequestCloseDialog } from './composer/RequestCloseDialog';
import { ComposerTextarea } from './composer/ComposerTextarea';
import { ComposerActionsMenu } from './composer/ComposerActionsMenu';

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  thread: Thread;
  loadMessages: () => Promise<Message[]>;
  autoFocus?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  hasOpenCloseRequest?: boolean;
}

const ThreadMessageComposer = React.forwardRef<
  { focusInput: () => void },
  ThreadMessageComposerProps
>(
  (
    {
      newMessage,
      setNewMessage,
      isSending,
      onSendMessage,
      thread,
      loadMessages,
      autoFocus = false,
      messagesEndRef,
      hasOpenCloseRequest,
    },
    ref
  ) => {
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [isRequestingClose, setIsRequestingClose] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);

    // Custom hooks
    const { clearDraftFromStorage } = useDraftManagement({
      threadId: thread?.id,
      newMessage,
      setNewMessage,
    });

    const {
      isArchiving,
      isUnarchiving,
      isUploading,
      handleCopy,
      handleArchive,
      handleUnarchive,
      handleImageUpload,
    } = useComposerActions({ thread, loadMessages });

    const {
      autoAccept,
      showJumpToLatest,
      handleToggleAutoAccept,
      handleJumpToLatest,
    } = useComposerUI({ messagesEndRef });

    // Expose focusInput method via ref
    React.useImperativeHandle(ref, () => ({
      focusInput: () => {
        textareaRef.current?.focus();
      },
    }));

    // Clear draft when message is sent
    const handleSendMessage = () => {
      if (thread?.id) {
        clearDraftFromStorage(thread.id);
      }
      onSendMessage();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends the message, Shift+Enter adds a new line
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (newMessage.trim() && !isSending) {
          handleSendMessage();
        }
      }
    };

    const handleRequestClose = async () => {
      if (!thread?.id) return;
      setIsRequestingClose(true);
      const success = await saveMessage({
        threadId: thread.id,
        type: 'request_close',
      });
      if (success) {
        setIsRequestDialogOpen(false);
        await loadMessages();
      }
      setIsRequestingClose(false);
    };

    const handleFileUpload = () => {
      fileInputRef.current?.click();
    };

    const handleCalendarEvent = () => {
      setIsCalendarDialogOpen(true);
    };

    return (
      <div className="sticky bottom-4 w-full">
        <div className="bg-background border rounded-md shadow-lg m-auto max-w-[800px]">
          <JumpToLatestButton
            show={showJumpToLatest}
            onClick={handleJumpToLatest}
          />
          <ComposerTextarea
            value={newMessage}
            onChange={setNewMessage}
            onKeyDown={handleKeyDown}
            disabled={isSending || isUploading}
            autoFocus={autoFocus}
            thread={thread}
            messagesEndRef={messagesEndRef}
          />
          <div className="flex justify-between items-center px-4 pb-4">
            <div className="flex gap-2">
              <ComposerActionsMenu
                thread={thread}
                autoAccept={autoAccept}
                isArchiving={isArchiving}
                isUnarchiving={isUnarchiving}
                isUploading={isUploading}
                hasOpenCloseRequest={hasOpenCloseRequest}
                onToggleAutoAccept={handleToggleAutoAccept}
                onCopy={handleCopy}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onFileUpload={handleFileUpload}
                onCalendarEvent={handleCalendarEvent}
                onRequestClose={() => setIsRequestDialogOpen(true)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending || isUploading}
                size="default"
                variant="success"
                className={`shrink-0 flex items-center gap-1`}
                data-testid="thread-send-button"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only md:not-sr-only md:inline">
                      Uploading image
                    </span>
                  </>
                ) : isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isAIThread(thread) ? (
                      <>
                        <ArrowUp className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:inline">
                          Ask Prickly AI
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:inline">
                          Send
                        </span>
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
          <RequestCloseDialog
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
            onRequestClose={handleRequestClose}
            isRequesting={isRequestingClose}
          />
          <CreateEventDialog
            open={isCalendarDialogOpen}
            onOpenChange={setIsCalendarDialogOpen}
            threadId={thread.id}
          />
        </div>
      </div>
    );
  }
);

export default ThreadMessageComposer;
