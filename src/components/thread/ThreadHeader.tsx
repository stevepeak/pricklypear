import { Bot, Users, BotMessageSquare, Headset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getThreadTopicInfo, type Thread, isAIThread } from "@/types/thread";
import { AvatarName } from "@/components/ui/avatar-name";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { updateThreadTitle } from "@/services/threadService";
import React, { useState, useRef } from "react";
import { z } from "zod";
import { handleError } from "@/services/messageService/utils";

interface ThreadHeaderProps {
  thread: Thread;
}

const ThreadHeader = ({ thread }: ThreadHeaderProps) => {
  const { label, icon } = getThreadTopicInfo(thread.topic);
  const topicLabel = `${icon} ${label}`;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const titleSchema = z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less");

  React.useEffect(() => {
    setTitle(thread.title);
  }, [thread.title]);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    const trimmed = title.trim();
    const parse = titleSchema.safeParse(trimmed);
    if (!parse.success) {
      toast("Invalid title", { description: parse.error.errors[0].message });
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      return;
    }
    if (trimmed === thread.title) {
      setEditing(false);
      setTitle(thread.title);
      return;
    }
    setLoading(true);
    try {
      await updateThreadTitle({ threadId: thread.id, title: trimmed });
      toast("Title updated", {
        description: "Thread title updated successfully.",
      });
      setEditing(false);
    } catch (e) {
      handleError(e, "updateThreadTitle");
      toast("Error", { description: "Failed to update thread title." });
      setTitle(thread.title);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditing(false);
      setTitle(thread.title);
    }
  };

  return (
    <div className="sticky top-12 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/90 p-6">
      {/* Mobile summary ghost icon trigger */}
      <div className="md:hidden absolute right-6 top-6 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Show summary">
              <BotMessageSquare className="size-6 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>AI Summary</SheetTitle>
              <SheetDescription>
                <span className="text-sm">{thread.summary ?? ""}</span>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        {/* Left Side */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            {thread.status === "Closed" && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-semibold"
              >
                Closed
              </Badge>
            )}
            {isAIThread(thread) ? (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 border-purple-200"
              >
                <Bot className="h-3 w-3 mr-1" />
                AI Chat
              </Badge>
            ) : thread.type === "customer_support" ? (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                <Headset className="h-3 w-3 mr-1" />
                Customer Support
              </Badge>
            ) : (
              <>
                <Badge variant="outline" className="bg-white">
                  {topicLabel}
                </Badge>
                {(thread.controls?.requireAiApproval ?? true) && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    AI-Moderated
                  </Badge>
                )}
              </>
            )}

            <span className="text-sm text-muted-foreground">
              Created {thread.createdAt.toLocaleDateString()}
            </span>
          </div>
          <div className="relative inline-block">
            {editing ? (
              <input
                ref={inputRef}
                className="text-2xl font-bold break-words bg-transparent outline-none border-none p-0 m-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={50}
                style={{ minWidth: 100 }}
              />
            ) : thread.type === "default" ? (
              <div className="text-2xl font-bold break-words">{title}</div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="text-2xl font-bold break-words cursor-pointer hover:underline"
                    onClick={() => setEditing(true)}
                  >
                    {title}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Click to edit</TooltipContent>
              </Tooltip>
            )}
          </div>
          {!isAIThread(thread) && (
            <div className="flex flex-col space-y-2">
              {thread.type === "customer_support" ? (
                <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
                  <Headset className="h-4 w-4" />
                  <span className="text-sm">Prickly Pear Staff</span>
                </div>
              ) : thread.participants && thread.participants.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Participants:</span>
                  <div className="flex flex-wrap gap-4">
                    {thread.participants.map((participant) => (
                      <AvatarName
                        key={participant}
                        name={participant}
                        size="xs"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No other participants
                </div>
              )}
            </div>
          )}
        </div>
        {/* Right Side: summary only on md+ */}
        <div className="md:w-1/2 flex flex-col gap-2 min-w-0 hidden md:flex">
          <div className="text-muted-foreground text-sm break-words">
            <p>{thread.summary ?? ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadHeader;
