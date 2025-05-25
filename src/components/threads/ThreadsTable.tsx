import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AvatarName } from "@/components/ui/avatar-name";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { getThreadTopicInfo } from "@/types/thread";
import type { Thread } from "@/types/thread";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ThreadsTableProps {
  threads: Thread[];
  isLoading: boolean;
}

const ThreadsTable: React.FC<ThreadsTableProps> = ({ threads, isLoading }) => {
  const { threadCounts } = useUnreadMessages();
  const navigate = useNavigate();

  const sortedThreads = useMemo(() => {
    // Closed threads always at the bottom, then sort by createdAt desc
    return [...threads].sort((a, b) => {
      if (a.status === "closed" && b.status !== "closed") return 1;
      if (a.status !== "closed" && b.status === "closed") return -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [threads]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sortedThreads.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No threads found.
      </p>
    );
  }

  return (
    <Table>
      <colgroup>
        <col style={{ width: "1%", whiteSpace: "nowrap" }} />
        <col style={{ width: "1%", whiteSpace: "nowrap" }} />
        <col style={{ width: "1%", whiteSpace: "nowrap" }} />
        <col />
      </colgroup>
      <TableHeader className="bg-secondary/20 text-left">
        <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
          Status
        </TableHead>
        <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
          Participants
        </TableHead>
        <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
          Topic
        </TableHead>
        <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
          Title
        </TableHead>
        <TableHead className="px-4 py-2 font-semibold whitespace-nowrap">
          Summary
        </TableHead>
      </TableHeader>
      <TableBody className="divide-y divide-muted">
        {sortedThreads.map((thread) => {
          const topicInfo = getThreadTopicInfo(thread.topic);
          const participants = thread.participants ?? [];

          return (
            <TableRow
              key={thread.id}
              onClick={() => navigate(`/threads/${thread.id}`)}
              className={cn(thread.status !== "open" && "bg-muted")}
            >
              <TableCell className="px-4 py-2">
                <Badge
                  variant={thread.status === "open" ? "default" : "outline"}
                  className={cn(
                    "ml-2 px-2 py-0.5 text-xs",
                    thread.status === "open"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-muted text-muted-foreground border-muted",
                  )}
                >
                  {thread.status === "open" ? "Open" : "Closed"}
                </Badge>
              </TableCell>

              {/* Participants */}
              <TableCell className="px-4 py-2">
                <div className="flex items-center">
                  {participants.slice(0, 3).map((name, idx) => (
                    <AvatarName
                      // key guarantees stable list rendering
                      key={`${thread.id}-participant-${idx}`}
                      name={name}
                      size="sm"
                      showName={false}
                      // negative margin on every avatar *after* the first
                      className={cn(idx > 0 && "-ml-2")}
                    />
                  ))}
                  {participants.length > 3 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      +{participants.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              {/* Topic */}
              <TableCell className="px-4 py-2">
                <Badge variant="secondary">
                  <span className="mr-1">{topicInfo.icon}</span>
                  {topicInfo.label}
                </Badge>
              </TableCell>

              {/* Title */}
              <TableCell className="px-4 py-2 font-medium flex items-center gap-2">
                {thread.title}
              </TableCell>

              {/* Summary */}
              <TableCell
                className="px-4 py-2 max-w-xs truncate whitespace-nowrap overflow-hidden text-ellipsis"
                title={thread.summary ?? "No summary generated yet."}
              >
                {thread.summary ?? "No summary generated yet."}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ThreadsTable;
