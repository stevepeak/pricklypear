import { formatThreadTimestamp } from '@/utils/formatTimestamp';
import type { Message } from '@/types/message';
import { StyledMarkdown } from './StyledMarkdown';
import { MessageImages } from './MessageImages';

interface MessageFromMeProps {
  message: Message;
  onImagesLoaded?: () => void;
}

function MessageFromMe({ message, onImagesLoaded }: MessageFromMeProps) {
  return (
    <div className="flex flex-col animate-message-appear self-end items-end gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>You</span>
        <span>•</span>
        <span>{formatThreadTimestamp(message.timestamp)}</span>
      </div>
      <MessageImages
        assets={message.details?.assets}
        onImagesLoaded={onImagesLoaded}
      />
      <div className="flex items-start gap-1">
        <div className="px-4 py-2 rounded-xl bg-secondary/40 rounded-tr-none ml-20">
          <StyledMarkdown>{message.text}</StyledMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromMe;
