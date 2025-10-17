import { formatThreadTimestamp } from '@/utils/formatTimestamp';
import type { Message } from '@/types/message';
import { StyledMarkdown } from './StyledMarkdown';
import { MessageImages } from './MessageImages';

interface MessageFromParticipantProps {
  message: Message;
  onImagesLoaded?: () => void;
}

function MessageFromParticipant({
  message,
  onImagesLoaded,
}: MessageFromParticipantProps) {
  return (
    <div className="flex flex-col animate-message-appear self-start items-start gap-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{message.sender?.name || 'someone'}</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <MessageImages
        assets={message.details?.assets}
        onImagesLoaded={onImagesLoaded}
      />
      <div className="flex items-start gap-1">
        <div className="px-4 py-2 rounded-xl bg-muted rounded-tl-none mr-20">
          <StyledMarkdown>{message.text}</StyledMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromParticipant;
