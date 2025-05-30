import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isAIThread, type Thread } from "@/types/thread";

/**
 * Renders a badge for a thread's status/type (AI, support, open, closed, etc).
 * Usage: <ThreadBadge thread={thread} />
 */
export function ThreadBadge({
  thread,
  className,
}: {
  thread: Thread;
  className?: string;
}) {
  return (
    <Badge
      variant={thread.status === "Open" ? "default" : "outline"}
      className={cn(
        "px-2 py-0.5 text-xs font-semibold",
        isAIThread(thread)
          ? "bg-purple-100 text-purple-800 border-purple-200"
          : thread.type === "customer_support"
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : thread.status === "Open"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-muted text-muted-foreground border-muted",
        className,
      )}
    >
      {isAIThread(thread)
        ? "AI Chat"
        : thread.type === "customer_support"
          ? "Support"
          : thread.status}
    </Badge>
  );
}

export default ThreadBadge;
