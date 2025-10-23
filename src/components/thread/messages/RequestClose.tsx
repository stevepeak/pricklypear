import { formatThreadTimestamp } from '@/utils/formatTimestamp';
import type { Message } from '@/types/message';
import { Button } from '@/components/ui/button';
import { saveMessage } from '@/services/messageService/save-message';
import { toast } from 'sonner';
import { ThreadStatus } from '@/types/thread';

function RequestClose(props: {
  message: Message;
  threadStatus: ThreadStatus;
  isPending: boolean;
}) {
  const { message, threadStatus, isPending } = props;
  const isCurrentUserSender = message.isCurrentUser;

  const handleAccept = async () => {
    try {
      const success = await saveMessage({
        threadId: message.threadId,
        type: 'close_accepted',
      });
      if (success) {
        window.location.reload();
        toast('Accepted close request', {
          description: 'You accepted the close request.',
        });
      } else {
        toast('Failed to accept close request', {
          description: 'Could not save message.',
        });
      }
    } catch (err) {
      toast('Failed to accept close request', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleDecline = async () => {
    try {
      const success = await saveMessage({
        threadId: message.threadId,
        type: 'close_declined',
      });
      if (success) {
        toast('Declined close request', {
          description: 'You declined the close request.',
        });
      } else {
        toast('Failed to decline close request', {
          description: 'Could not save message.',
        });
      }
    } catch (err) {
      toast('Failed to decline close request', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="flex flex-col animate-message-appear items-center justify-center">
      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
        <span>{message.sender?.name || 'someone'}</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          {isPending && !isCurrentUserSender && threadStatus === 'Open' ? (
            <div className="flex w-full mt-2 justify-center">
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={handleAccept}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline}>
                  Decline
                </Button>
              </div>
            </div>
          ) : (
            <span>Requested to close thread.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestClose;
