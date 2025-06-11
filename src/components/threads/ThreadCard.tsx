import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Thread } from '@/types/thread';
import { ThreadStatusBadge } from '@/components/thread/ThreadStatusBadge';
import { ThreadTopicBadge } from '@/components/thread/ThreadTopicBadge';
import { Badge } from '../ui/badge';

interface ThreadCardProps {
  thread: Thread;
  unreadCount?: number;
}

const ThreadCard = ({ thread, unreadCount = 0 }: ThreadCardProps) => {
  return (
    <Link
      to={`/threads/${thread.id}`}
      className="block group focus:outline-none"
      tabIndex={0}
      aria-label={`Open thread: ${thread.title}`}
    >
      <Card
        className={`p-4 shadow-none hover:shadow-lg ${
          thread.status === 'Closed' || thread.status === 'Archived'
            ? ' opacity-70'
            : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            <ThreadStatusBadge thread={thread} />
            <ThreadTopicBadge thread={thread} />
          </div>
          <div className="flex items-center gap-2 relative">
            {/* TODO not showing up for Customer Support / AI threads */}
            {unreadCount > 0 && (
              <Badge className="absolute -top-6 -right-6 rounded-full bg-accent text-accent-foreground text-m font-medium px-2">
                {unreadCount}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {thread.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-rounded">{thread.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mb-2">
          <p className="text-sm text-muted-foreground">
            {thread.summary ? thread.summary : 'No summary generated yet.'}
          </p>
          {thread.participants && thread.participants.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Participants:</p>
              <p className="text-sm text-muted-foreground">
                {thread.participants.join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ThreadCard;
