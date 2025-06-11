import { formatThreadTimestamp } from '@/utils/formatTimestamp';
import type { Message } from '@/types/message';
import ReactMarkdown from 'react-markdown';
import { Headset } from 'lucide-react';

function CustomerSupportMessage(props: { message: Message }) {
  const { message } = props;
  return (
    <div className="flex flex-col animate-message-appear self-start items-start">
      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground font-normal">
        <Headset className="h-3 w-3 text-primary/70" />
        {/* TODO put the customer support person name in here */}
        Customer Support
        <span>•</span>
        {formatThreadTimestamp(message.timestamp)}
      </div>
      <div className="flex items-start">
        <div className="px-4 py-2 rounded-xl bg-muted mr-20">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupportMessage;
