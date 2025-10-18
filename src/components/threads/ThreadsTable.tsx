import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loader2 } from 'lucide-react';

import { AvatarName } from '@/components/ui/avatar-name';
import { cn } from '@/lib/utils';
import { type Thread } from '@/types/thread';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { ThreadStatusBadge } from '@/components/thread/ThreadStatusBadge';
import { ThreadTopicBadge } from '@/components/thread/ThreadTopicBadge';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface ThreadsTableProps {
  threads: Thread[];
  isLoading: boolean;
}

function ThreadsTable(props: ThreadsTableProps) {
  const { threads, isLoading } = props;
  const navigate = useNavigate();
  const { threadCounts } = useUnreadMessages();

  const sortedThreads = useMemo(() => {
    // Closed and Archived threads always at the bottom, then sort by createdAt desc
    const isClosedOrArchived = (status: string) =>
      status === 'Closed' || status === 'Archived';
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
        <col className="w-[1%] whitespace-nowrap" />
        <col className="w-[1%] whitespace-nowrap" />
        <col className="w-[1%] whitespace-nowrap" />
        <col />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedThreads.map((thread) => {
          const participants = thread.participants ?? [];
          const hasUnreadMessages = threadCounts[thread.id] > 0;

          return (
            <TableRow
              data-testid={`thread-tr-${thread.id}`}
              key={thread.id}
              onClick={() => navigate(`/threads/${thread.id}`)}
              className={cn(thread.status !== 'Open' && 'bg-muted')}
            >
              <TableCell>
                <div className="flex items-center">
                  {hasUnreadMessages && (
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  )}
                  <ThreadStatusBadge thread={thread} className="ml-2" />
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center">
                  {participants.slice(0, 3).map((name, idx) => (
                    <AvatarName
                      key={`${thread.id}-participant-${idx}`}
                      name={name}
                      size="sm"
                      showName={false}
                      className={cn(idx > 0 && '-ml-2')}
                    />
                  ))}
                  {participants.length > 3 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      +{participants.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <ThreadTopicBadge thread={thread} />
              </TableCell>

              <TableCell>
                <span className="font-medium">{thread.title}</span>
              </TableCell>

              <TableCell className="max-w-xs truncate whitespace-nowrap overflow-hidden text-ellipsis">
                {thread.summary}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default ThreadsTable;
