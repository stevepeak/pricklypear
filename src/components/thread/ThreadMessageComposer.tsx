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
import {
  Loader2,
  Send,
  Plus,
  Mic,
  FilePlus,
  Lock,
  Check,
  Zap,
  FileDown,
  Copy,
  MessageSquarePlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog.js";
import { saveMessage } from "@/services/messageService/messages.js";
import { Message } from "@/types/message";
import { useToast } from "@/hooks/use-toast";

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  isThreadClosed: boolean;
  onSendMessage: () => void;
  scrollToBottom?: () => void;
  threadId: string;
  loadMessages: () => Promise<Message[]>;
  autoFocus?: boolean;
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
  autoFocus = false,
}: ThreadMessageComposerProps) => {
  const [autoAccept, setAutoAccept] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isRequestingClose, setIsRequestingClose] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

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

  // Focus textarea on mount if autoFocus is true and not disabled
  useEffect(() => {
    if (autoFocus && !isSending && !isThreadClosed && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, isSending, isThreadClosed]);

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

  const handleCopy = async () => {
    try {
      const { getMessages } = await import(
        "@/services/messageService/messages.js"
      );
      const messages = await getMessages(threadId);
      if (!messages.length) {
        toast({
          title: "Nothing to copy",
          description: "No messages found in this thread.",
        });
        return;
      }
      const formatted = messages
        .map((msg) => {
          const date =
            msg.timestamp instanceof Date
              ? msg.timestamp
              : new Date(msg.timestamp);
          const time = date.toLocaleString();
          return `[${time}] ${msg.sender}: ${msg.text}`;
        })
        .join("\n\n");
      await navigator.clipboard.writeText(formatted);
      toast({
        title: "Copied!",
        description: "Thread messages copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy messages to clipboard.",
      });
    }
  };

  return (
    <div className="sticky bottom-10 bg-white border rounded-md shadow-md m-10">
      <Textarea
        ref={textareaRef}
        placeholder={
          isThreadClosed ? "Thread is closed" : "Type your message..."
        }
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending || isThreadClosed}
        className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none px-4 pt-4 shadow-none"
        rows={3}
        autoFocus={autoFocus && !isSending && !isThreadClosed}
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
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuItem onSelect={() => setIsRequestDialogOpen(true)}>
                <Lock className="h-4 w-4 mr-2" /> Request to close thread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleCopy()}>
                <Copy className="h-4 w-4 mr-2" /> Copy to your clipboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquarePlus className="h-4 w-4 mr-2" /> Add as context in
                new AI chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FilePlus className="h-4 w-4 mr-2" /> Add photos and files
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
                    checkedIcon={<Zap className="h-4 w-4 text-primary" />}
                    uncheckedIcon={
                      <Check className="h-4 w-4 text-muted-foreground" />
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                ⚡️ Auto-accept AI suggestions
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || isSending || isThreadClosed}
            size="default"
            className="shrink-0 flex items-center gap-1"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:inline">Send</span>
              </>
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
