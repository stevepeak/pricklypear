import { formatThreadTimestamp } from '@/utils/formatTimestamp';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/message';
import { StyledMarkdown } from './StyledMarkdown';

function CloseDecision(props: { message: Message }) {
  const { message } = props;

  const getCloseDecisionText = () => {
    switch (message.type) {
      case 'close_accepted':
        return 'Agreed to close thread';
      case 'close_declined':
        return 'Declined to close thread';
      default:
        return 'Close decision';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col animate-message-appear items-center justify-center'
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
        <span>{message.sender?.name || 'someone'}</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <div className="flex items-start gap-1">
        <div
          className={cn('px-4 py-2 rounded-xl bg-muted text-muted-foreground')}
        >
          <StyledMarkdown>{getCloseDecisionText()}</StyledMarkdown>
        </div>
      </div>
    </div>
  );
}

export default CloseDecision;
