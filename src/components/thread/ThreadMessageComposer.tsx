import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
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
  FilePlus,
  Lock,
  FileDown,
  Copy,
  MessageSquarePlus,
  ArrowUp,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import { saveMessage } from "@/services/messageService/save-message";
import { Message } from "@/types/message";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { useConnections } from "@/hooks/useConnections";
import { getMessages } from "@/services/messageService/get-messages";
import { Thread } from "@/types/thread";
import { SystemPromptDialog } from "./composer/SystemPrompt";
import { archiveThread, unarchiveThread } from "@/services/threadService";
import { Switch } from "@/components/ui/switch";

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  scrollToBottom?: () => void;
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
      scrollToBottom,
      thread,
      loadMessages,
      autoFocus = false,
      messagesEndRef,
      hasOpenCloseRequest,
    },
    ref,
  ) => {
    const [autoAccept, setAutoAccept] = useState(
      thread.type === "ai_chat" ? false : true,
    );
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [isRequestingClose, setIsRequestingClose] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showJumpToLatest, setShowJumpToLatest] = useState(false);
    const { connections } = useConnections();
    const [isSystemPromptDialogOpen, setIsSystemPromptDialogOpen] =
      useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isUnarchiving, setIsUnarchiving] = useState(false);

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
      if (autoFocus && !isSending && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [autoFocus, isSending]);

    // Show 'Jump to latest message' button if bottom is not visible
    useEffect(() => {
      const handleScroll = () => {
        if (!messagesEndRef?.current) return;
        const rect = messagesEndRef.current.getBoundingClientRect();
        const atBottom = rect.bottom <= window.innerHeight - 40;
        setShowJumpToLatest(!atBottom);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [messagesEndRef]);

    // Expose focusInput method via ref
    React.useImperativeHandle(ref, () => ({
      focusInput: () => {
        textareaRef.current?.focus();
      },
    }));

    const handleToggleAutoAccept = (value: boolean) => {
      setAutoAccept(value);
      localStorage.setItem("autoAcceptAISuggestions", value.toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) sends the message
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (newMessage.trim() && !isSending) {
          onSendMessage();
        }
      }
    };

    const handleRequestClose = async () => {
      if (!thread?.id) return;
      setIsRequestingClose(true);
      const text = "Requested to close this thread.";
      const success = await saveMessage({
        text,
        threadId: thread.id,
        type: "request_close",
      });
      if (success) {
        setIsRequestDialogOpen(false);
        await loadMessages();
      }
      setIsRequestingClose(false);
    };

    const handleCopy = async () => {
      try {
        const messages = await getMessages({
          threadId: thread.id,
          connections,
        });
        if (!messages.length) {
          toast("Nothing to copy", {
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
        toast("Copied!", {
          description: "Thread messages copied to clipboard.",
        });
      } catch (err) {
        toast("Copy failed", {
          description: "Failed to copy messages to clipboard.",
        });
      }
    };

    const isAiThread = thread.type === "ai_chat";

    const handleArchive = async () => {
      setIsArchiving(true);
      const success = await archiveThread({ threadId: thread.id });
      if (success) {
        toast("Thread archived", {
          description: "This thread has been archived.",
        });
        await loadMessages();
      } else {
        toast("Archive failed", {
          description: "Could not archive the thread.",
        });
      }
      setIsArchiving(false);
    };

    const handleUnarchive = async () => {
      setIsUnarchiving(true);
      const success = await unarchiveThread({ threadId: thread.id });
      if (success) {
        toast("Thread unarchived", {
          description: "This thread has been unarchived.",
        });
        await loadMessages();
      } else {
        toast("Unarchive failed", {
          description: "Could not unarchive the thread.",
        });
      }
      setIsUnarchiving(false);
    };

    return (
      <>
        <div className="sticky bottom-2 bg-white border rounded-md shadow-md w-full max-w-[800px]">
          {showJumpToLatest && scrollToBottom && (
            <div className="absolute left-1/2 -translate-x-1/2 mb-2 -top-10">
              <Button size="sm" variant="secondary" onClick={scrollToBottom}>
                Jump to latest message
              </Button>
            </div>
          )}
          <Textarea
            ref={textareaRef}
            placeholder={"Type your message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none px-4 pt-4 shadow-none"
            rows={3}
            autoFocus={autoFocus && !isSending}
          />
          <div className="flex justify-between items-center px-4 pb-4">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                  <DropdownMenuLabel>Exporting</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <FileDown className="h-4 w-4 mr-2" /> Export as PDF{" "}
                    <Badge variant="secondary" className="ml-2">
                      Coming soon
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" /> Copy to your clipboard
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquarePlus className="h-4 w-4 mr-2" /> Add as
                    context in new AI chat{" "}
                    <Badge variant="secondary" className="ml-2">
                      Coming soon
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() => setIsSystemPromptDialogOpen(true)}
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2" /> Update System
                    Prompt
                  </DropdownMenuItem>
                  {!isAiThread && (
                    <DropdownMenuItem asChild>
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Auto-accept AI rephrasing
                        </span>
                        <Switch
                          checked={autoAccept}
                          onCheckedChange={handleToggleAutoAccept}
                          aria-label="Auto-accept AI rephrasing"
                        />
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {!isAiThread && (
                    <DropdownMenuItem
                      onSelect={() => setIsRequestDialogOpen(true)}
                      disabled={hasOpenCloseRequest}
                    >
                      {hasOpenCloseRequest ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" /> Request to close
                          thread pending...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" /> Request to close
                          thread
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {isAiThread && thread.status === "Open" && (
                    <DropdownMenuItem
                      onSelect={handleArchive}
                      disabled={isArchiving}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      {isArchiving ? "Archiving..." : "Archive"}
                    </DropdownMenuItem>
                  )}
                  {isAiThread && thread.status === "Archived" && (
                    <DropdownMenuItem
                      onSelect={handleUnarchive}
                      disabled={isUnarchiving}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      {isUnarchiving ? "Unarchiving..." : "Unarchive"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <FilePlus className="h-4 w-4 mr-2" /> Add photos and files{" "}
                    <Badge variant="secondary" className="ml-2">
                      Coming soon
                    </Badge>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/*
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Start voice input (coming soon)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              */}
            </div>
            <div className="flex items-center gap-2">
              {!isAiThread && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Toggle
                          aria-label="Auto-accept AI rephrasing"
                          pressed={autoAccept}
                          onPressedChange={handleToggleAutoAccept}
                        >
                          {autoAccept ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </Toggle>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {autoAccept
                        ? "AI rephrasing is automatically accepted."
                        : "You will confirm AI rephrasing before sending."}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                onClick={onSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="default"
                className={`shrink-0 flex items-center gap-1 ${
                  isAiThread ? "bg-purple-600 hover:bg-purple-700" : ""
                }`}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isAiThread ? (
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
          <Dialog
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
          >
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
          <SystemPromptDialog
            open={isSystemPromptDialogOpen}
            onOpenChange={setIsSystemPromptDialogOpen}
          />
        </div>
      </>
    );
  },
);

export default ThreadMessageComposer;
