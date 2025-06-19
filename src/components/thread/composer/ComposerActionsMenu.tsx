import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu.js';
import {
  Plus,
  FilePlus,
  Lock,
  FileDown,
  Copy,
  MessageSquarePlus,
  ShieldCheck,
  Archive,
  Calendar,
} from 'lucide-react';
import { isAIThread } from '@/types/thread';
import type { Thread } from '@/types/thread';

interface ComposerActionsMenuProps {
  thread: Thread;
  autoAccept: boolean;
  isArchiving: boolean;
  isUnarchiving: boolean;
  isUploading: boolean;
  hasOpenCloseRequest?: boolean;
  onToggleAutoAccept: (value: boolean) => void;
  onCopy: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onFileUpload: () => void;
  onCalendarEvent: () => void;
  onRequestClose: () => void;
}

export function ComposerActionsMenu({
  thread,
  autoAccept,
  isArchiving,
  isUnarchiving,
  isUploading,
  hasOpenCloseRequest,
  onToggleAutoAccept,
  onCopy,
  onArchive,
  onUnarchive,
  onFileUpload,
  onCalendarEvent,
  onRequestClose,
}: ComposerActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          data-testid="composer-actions-button"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        data-testid="composer-actions-options"
      >
        <DropdownMenuLabel>Exporting</DropdownMenuLabel>
        <DropdownMenuItem>
          <FileDown className="h-4 w-4 mr-2" /> Export as PDF{' '}
          <Badge key="coming-soon" variant="secondary" className="ml-2">
            Coming soon
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onCopy}>
          <Copy className="h-4 w-4 mr-2" /> Copy to your clipboard
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquarePlus className="h-4 w-4 mr-2" /> Add as context in new
          AI chat{' '}
          <Badge key="coming-soon" variant="secondary" className="ml-2">
            Coming soon
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Auto-accept AI rephrasing
            </span>
            <Switch
              checked={autoAccept}
              onCheckedChange={onToggleAutoAccept}
              aria-label="Auto-accept AI rephrasing"
            />
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {!isAIThread(thread) && thread.type !== 'customer_support' && (
          <>
            <DropdownMenuItem
              onSelect={onRequestClose}
              disabled={hasOpenCloseRequest}
            >
              {hasOpenCloseRequest ? (
                <>
                  <Lock className="h-4 w-4 mr-2" /> Request to close thread
                  pending...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" /> Request to close thread
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
        {(isAIThread(thread) || thread.type === 'customer_support') &&
          thread.status === 'Open' && (
            <DropdownMenuItem onSelect={onArchive} disabled={isArchiving}>
              <Archive className="h-4 w-4 mr-2" />
              {isArchiving ? 'Archiving...' : 'Archive'}
            </DropdownMenuItem>
          )}
        {(isAIThread(thread) || thread.type === 'customer_support') &&
          thread.status === 'Archived' && (
            <DropdownMenuItem onSelect={onUnarchive} disabled={isUnarchiving}>
              <FileDown className="h-4 w-4 mr-2" />
              {isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
            </DropdownMenuItem>
          )}
        <DropdownMenuItem onSelect={onFileUpload} disabled={isUploading}>
          <FilePlus className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Add photos and files'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onCalendarEvent}>
          <Calendar className="h-4 w-4 mr-2" /> Propose calendar event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
