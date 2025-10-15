import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { ReviewResponse } from '@/utils/messageReview';
import { Badge } from '@/components/ui/badge';

interface MessageReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMessage: string;
  reviewResponse: ReviewResponse | null;
  onAccept: (message: string) => void;
  isLoading: boolean;
  requireAiApproval?: boolean;
}

const MessageReviewDialog = ({
  open,
  onOpenChange,
  newMessage,
  reviewResponse,
  onAccept,
  isLoading,
  requireAiApproval = true,
}: MessageReviewDialogProps) => {
  const handleAccept = () => {
    if (reviewResponse?.suggested_message.trim()) {
      onAccept(reviewResponse.suggested_message);
      onOpenChange(false);
      toast('Message sent', {
        description: 'Your message has been reviewed and sent',
      });
    }
  };
  const handleSendOriginal = () => {
    if (newMessage.trim()) {
      onAccept(newMessage);
      onOpenChange(false);
      toast('Message sent', {
        description: 'Your original message was sent without revision',
      });
    }
  };

  const getToneBadgeVariant = (
    tone: ReviewResponse['tone']
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (tone) {
      case 'neutral':
        return 'secondary';
      case 'empathetic':
        return 'default';
      case 'escalating':
        return 'destructive';
      case 'unclear':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review your message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Original message:
            </p>
            <div className="bg-muted p-3 rounded-md text-sm">{newMessage}</div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : reviewResponse ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-muted-foreground">
                    AI suggested rephrasing:
                  </p>
                  <Badge variant={getToneBadgeVariant(reviewResponse.tone)}>
                    {reviewResponse.tone}
                  </Badge>
                </div>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {reviewResponse.suggested_message}
                </div>
              </div>

              {reviewResponse.analysis && (
                <div>
                  <p className="text-sm font-medium mb-2">Analysis:</p>
                  <p className="text-sm text-muted-foreground">
                    {reviewResponse.analysis}
                  </p>
                </div>
              )}

              {reviewResponse.nvc_elements && (
                <div className="border rounded-md p-3 space-y-2">
                  <p className="text-sm font-medium">
                    Nonviolent Communication Elements:
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {reviewResponse.nvc_elements.observation && (
                      <div>
                        <span className="font-medium">Observation: </span>
                        <span className="text-muted-foreground">
                          {reviewResponse.nvc_elements.observation}
                        </span>
                      </div>
                    )}
                    {reviewResponse.nvc_elements.feeling && (
                      <div>
                        <span className="font-medium">Feeling: </span>
                        <span className="text-muted-foreground">
                          {reviewResponse.nvc_elements.feeling}
                        </span>
                      </div>
                    )}
                    {reviewResponse.nvc_elements.need && (
                      <div>
                        <span className="font-medium">Need: </span>
                        <span className="text-muted-foreground">
                          {reviewResponse.nvc_elements.need}
                        </span>
                      </div>
                    )}
                    {reviewResponse.nvc_elements.request && (
                      <div>
                        <span className="font-medium">Request: </span>
                        <span className="text-muted-foreground">
                          {reviewResponse.nvc_elements.request}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {!requireAiApproval && (
            <Button
              type="button"
              variant="accent"
              onClick={handleSendOriginal}
              disabled={!newMessage.trim() || isLoading}
            >
              Send without revision
            </Button>
          )}
          <Button
            type="button"
            variant="success"
            onClick={handleAccept}
            disabled={!reviewResponse?.suggested_message.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Accept & Send'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReviewDialog;
