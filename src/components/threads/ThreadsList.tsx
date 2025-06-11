import { Loader2 } from 'lucide-react';
import ThreadCard from './ThreadCard';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import type { Thread } from '@/types/thread';
import type { User } from '@supabase/supabase-js';

interface ThreadsListProps {
  threads: Thread[];
  isLoading: boolean;
  user: User | null;
  onNewThreadClick: () => void;
}

const ThreadsList = ({ threads, isLoading }: ThreadsListProps) => {
  const { threadCounts } = useUnreadMessages();

  // Separate threads into open and closed
  const openThreads = threads.filter((thread) => thread.status === 'Open');
  const closedThreads = threads.filter((thread) => thread.status === 'Closed');
  const archivedThreads = threads.filter(
    (thread) => thread.status === 'Archived'
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-6 text-lg">No threads found.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30">
      <div className="m-4 space-y-4">
        {/* Open Threads Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Open Threads</h2>
          {openThreads.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  unreadCount={threadCounts[thread.id] || 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No open threads found.</p>
          )}
        </div>

        {/* Closed Threads Section */}
        {closedThreads.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Closed Threads</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {closedThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  unreadCount={threadCounts[thread.id] || 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archived Threads Section */}
        {archivedThreads.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Archived Threads</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  unreadCount={threadCounts[thread.id] || 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadsList;
