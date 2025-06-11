import React from 'react';
import type { Thread } from '@/types/thread';

interface OpenedAtProps {
  thread: Thread;
}

const OpenedAt: React.FC<OpenedAtProps> = ({ thread }) => {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 my-2">
      <div className="h-[1px] w-16 bg-muted-foreground/20" />
      Thread opened by {thread.createdBy?.name || 'someone'} on{' '}
      {new Date(thread.createdAt).toLocaleDateString()}
      <div className="h-[1px] w-16 bg-muted-foreground/20" />
    </div>
  );
};

export default OpenedAt;
