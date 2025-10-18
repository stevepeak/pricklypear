import { formatThreadTimestamp } from '@/utils/formatTimestamp';
import type { Message } from '@/types/message';
import { StyledMarkdown } from './StyledMarkdown';
import { Headset } from 'lucide-react';

function CustomerSupportFromMe(props: { message: Message }) {
  const { message } = props;
  return (
    <div className="flex flex-col animate-message-appear self-end items-end">
      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground font-normal">
        <Headset className="h-3 w-3 text-primary/70" />
        Customer Support
        <span>•</span>
        {formatThreadTimestamp(message.timestamp)}
      </div>
      <div className="flex items-start">
        <div className="px-4 py-2 rounded-xl bg-secondary/40 rounded-tr-none ml-20">
          <StyledMarkdown>{message.text}</StyledMarkdown>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupportFromMe;
