import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Thread } from "@/types/thread";
import { getThreadTopicInfo, isAIThread } from "@/types/thread";
import { Bot, Headset } from "lucide-react";

/**
 * Renders a badge for a thread's topic with its icon and label.
 * Usage: <ThreadTopicBadge thread={thread} />
 */
export function ThreadTopicBadge({
  thread,
  className,
}: {
  thread: Thread;
  className?: string;
}) {
  const topicInfo = getThreadTopicInfo(thread.topic);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-2 py-0.5 text-xs font-semibold",
        isAIThread(thread)
          ? "bg-purple-100 text-purple-800 border-purple-200"
          : thread.type === "customer_support"
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : "",
        className,
      )}
    >
      <span className="mr-1">
        {isAIThread(thread) ? (
          <Bot className="h-3 w-3" />
        ) : thread.type === "customer_support" ? (
          <Headset className="h-3 w-3" />
        ) : (
          topicInfo.icon
        )}
      </span>
      {isAIThread(thread)
        ? "AI Chat"
        : thread.type === "customer_support"
          ? "Support"
          : topicInfo.label}
    </Badge>
  );
}

export default ThreadTopicBadge;
