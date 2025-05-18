import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Plus, Mic } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog.js";
import { saveMessage } from "@/services/messageService/messages.js";
import { Message } from "@/types/message";

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  isThreadClosed: boolean;
  onSendMessage: () => void;
  scrollToBottom?: () => void;
  threadId: string;
  loadMessages: () => Promise<Message[]>;
}

const ThreadMessageComposer = ({
  newMessage,
  setNewMessage,
  isSending,
  isThreadClosed,
  onSendMessage,
  scrollToBottom,
  threadId,
  loadMessages,
}: ThreadMessageComposerProps) => {
  const [autoAccept, setAutoAccept] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isRequestingClose, setIsRequestingClose] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialise from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("autoAcceptAISuggestions");
    setAutoAccept(stored === "true");
  }, []);

  // Auto-resize textarea when newMessage changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    if (scrollToBottom) {
      scrollToBottom();
    }
  }, [newMessage, scrollToBottom]);

  const handleToggleAutoAccept = (value: boolean) => {
    setAutoAccept(value);
    localStorage.setItem("autoAcceptAISuggestions", value.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) sends the message
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (newMessage.trim() && !isSending && !isThreadClosed) {
        onSendMessage();
      }
    }
  };

  const handleRequestClose = async () => {
    if (!threadId) return;
    setIsRequestingClose(true);
    const text = "Requested to close this thread.";
    const success = await saveMessage(
      text,
      threadId,
      undefined,
      "request_close",
    );
    if (success) {
      setIsRequestDialogOpen(false);
      await loadMessages();
    }
    setIsRequestingClose(false);
  };

  return (
    <div className="relative bg-white dark:bg-transparent border rounded-md">
      <Textarea
        ref={textareaRef}
        placeholder={
          isThreadClosed ? "Thread is closed" : "Type your message..."
        }
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending || isThreadClosed}
        className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-4 pt-4"
        rows={1}
      />
      <div className="flex justify-between items-center px-4 pb-4">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                disabled={isThreadClosed}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => setIsRequestDialogOpen(true)}>
                Request to close thread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled={isThreadClosed}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Switch
                    id="auto-accept-toggle"
                    checked={autoAccept}
                    disabled={isThreadClosed}
                    onCheckedChange={handleToggleAutoAccept}
                  />
                  <Label
                    htmlFor="auto-accept-toggle"
                    className="cursor-pointer select-none"
                  >
                    Auto-accept AI suggestions
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                Automatically send the AI-reviewed message without opening the
                review dialog.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || isSending || isThreadClosed}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to close thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to request to close this thread?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleRequestClose}
              disabled={isRequestingClose}
              variant="default"
            >
              {isRequestingClose ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Make request to close"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThreadMessageComposer;
