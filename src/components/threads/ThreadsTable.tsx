import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Loader2 } from "lucide-react";

import { AvatarName } from "@/components/ui/avatar-name";
import { cn } from "@/lib/utils";
import { type Thread } from "@/types/thread";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ThreadStatusBadge } from "@/components/thread/ThreadStatusBadge";
import { ThreadTopicBadge } from "@/components/thread/ThreadTopicBadge";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

interface ThreadsTableProps {
  threads: Thread[];
  isLoading: boolean;
}

const ThreadsTable: React.FC<ThreadsTableProps> = ({ threads, isLoading }) => {
  const navigate = useNavigate();
  const { threadCounts } = useUnreadMessages();

  const sortedThreads = useMemo(() => {
    // Closed and Archived threads always at the bottom, then sort by createdAt desc
    const isClosedOrArchived = (status: string) =>
      status === "Closed" || status === "Archived";
    return [...threads].sort((a, b) => {
      if (isClosedOrArchived(a.status) && !isClosedOrArchived(b.status))
        return 1;
      if (!isClosedOrArchived(a.status) && isClosedOrArchived(b.status))
        return -1;
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
        <TableRow>
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
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-muted">
        {sortedThreads.map((thread) => {
          const participants = thread.participants ?? [];
          const hasUnreadMessages = threadCounts[thread.id] > 0;

          return (
            <TableRow
              key={thread.id}
              onClick={() => navigate(`/threads/${thread.id}`)}
              className={cn(thread.status !== "Open" && "bg-muted")}
            >
              <TableCell className="px-4 py-2">
                <div className="flex items-center">
                  {hasUnreadMessages && (
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  )}
                  <ThreadStatusBadge thread={thread} className="ml-2" />
                </div>
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
                <ThreadTopicBadge thread={thread} />
              </TableCell>

              {/* Title */}
              <TableCell className="px-4 py-2">
                <span className="font-medium">{thread.title}</span>
              </TableCell>

              {/* Summary */}
              <TableCell className="px-4 py-2 max-w-xs truncate whitespace-nowrap overflow-hidden text-ellipsis">
                {thread.summary}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ThreadsTable;
