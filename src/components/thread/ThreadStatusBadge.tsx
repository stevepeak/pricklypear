import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Thread } from '@/types/thread';

/**
 * Renders a badge for a thread's status (open, closed, arcived).
 * Usage: <ThreadStatusBadge thread={thread} />
 */
export function ThreadStatusBadge({
  thread,
  className,
}: {
  thread: Thread;
  className?: string;
}) {
  return (
    <Badge
      variant={thread.status === 'Open' ? 'default' : 'outline'}
      className={cn(
        'px-2 py-0.5 text-xs font-semibold',
        thread.status === 'Open'
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-muted text-muted-foreground border-muted',
        className
      )}
    >
      {thread.status}
    </Badge>
  );
}

export default ThreadStatusBadge;
