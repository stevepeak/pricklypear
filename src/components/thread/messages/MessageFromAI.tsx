import type { Message } from '@/types/message';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MessageImages } from './MessageImages';

interface MessageFromAIProps {
  message: Message;
  onImagesLoaded?: () => void;
}

function MessageFromAI({ message, onImagesLoaded }: MessageFromAIProps) {
  return (
    <div className="flex flex-col animate-message-appear self-start items-start gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 mr-1" />
        <span>Prickly AI</span>
      </div>
      <MessageImages
        assets={message.details?.assets}
        onImagesLoaded={onImagesLoaded}
      />
      <div className="flex items-start gap-1">
        <div className="px-4 py-2 rounded-xl rounded-tl-none bg-muted text-muted-foreground mr-20">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageFromAI;
