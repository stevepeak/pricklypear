import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getThreadTopicInfo } from "@/types/thread";
import type { Thread } from "@/types/thread";
import { NotificationBadge } from "@/components/ui/notification-badge";

interface ThreadCardProps {
  thread: Thread;
  unreadCount?: number;
}

const ThreadCard = ({ thread, unreadCount = 0 }: ThreadCardProps) => {
  const topicInfo = getThreadTopicInfo(thread.topic);

  return (
    <Link
      to={`/threads/${thread.id}`}
      className="block group focus:outline-none"
      tabIndex={0}
      aria-label={`Open thread: ${thread.title}`}
    >
      <Card className="rounded-xl shadow-card hover:bg-bgLight transition-all hover-tilt p-4 cursor-pointer group-focus:ring-2 group-focus:ring-primary group-focus:ring-offset-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            <Badge
              variant={thread.status === "Open" ? "default" : "secondary"}
              className={`text-xs px-2 py-0.5 font-semibold ${thread.status === "Open" ? "bg-secondary text-primary" : ""}`}
            >
              {thread.status}
            </Badge>
            <Badge
              variant="outline"
              className="bg-white flex items-center gap-1 font-medium text-xs px-2 py-0.5"
            >
              <span>{topicInfo.icon}</span> {topicInfo.label}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {thread.createdAt.toLocaleDateString()}
          </span>
        </div>
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-rounded text-primary relative flex items-center">
            {thread.title}
            {unreadCount > 0 && (
              <NotificationBadge
                label={unreadCount}
                className="ml-2 bg-accent text-white text-xs font-medium"
                show
              >
                <span />
              </NotificationBadge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mb-2">
          <p className="text-sm text-muted-foreground">
            {thread.summary ? thread.summary : "No summary generated yet."}
          </p>
          {thread.participants && thread.participants.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Participants:</p>
              <p className="text-sm text-muted-foreground">
                {thread.participants.join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ThreadCard;
